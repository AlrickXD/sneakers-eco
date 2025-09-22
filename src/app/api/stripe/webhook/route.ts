import Stripe from 'stripe'
import { headers } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

// Cache en mémoire pour éviter les doublons de webhooks
const processedSessions = new Set<string>()

export const runtime = 'nodejs'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  // FORCER L'AFFICHAGE DES LOGS
  console.log('🚀 WEBHOOK APPELÉ - DÉBUT')
  console.log('🕐 Timestamp:', new Date().toISOString())
  
  const headersList = await headers()
  const sig = headersList.get('stripe-signature')
  const rawBody = await req.text()

  console.log('📝 Signature présente:', !!sig)
  console.log('📦 Body length:', rawBody.length)

  if (!sig) {
    console.error('❌ Signature Stripe manquante')
    return new Response('Signature manquante', { status: 400 })
  }

  let event: Stripe.Event

  console.log('🔑 Webhook secret configuré:', !!process.env.STRIPE_WEBHOOK_SECRET)
  console.log('🔑 Secret length:', process.env.STRIPE_WEBHOOK_SECRET?.length || 0)

  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET!)
    console.log('✅ Événement Stripe vérifié avec succès')
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
    console.error(`❌ Erreur de vérification webhook: ${errorMessage}`)
    return new Response(`Webhook error: ${errorMessage}`, { status: 400 })
  }

  console.log(`=== WEBHOOK DEBUG ===`)
  console.log(`Événement reçu: ${event.type}`)
  console.log(`Timestamp: ${new Date().toISOString()}`)
  
  // Traiter l'événement checkout.session.completed
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    console.log('=== SESSION DEBUG ===')
    console.log('Session de paiement complétée:', session.id)
    
    // Vérification anti-doublon en mémoire
    if (processedSessions.has(session.id)) {
      console.log('🛑 Session déjà traitée (cache mémoire):', session.id)
      return new Response('Session déjà traitée', { status: 200 })
    }
    
    // Marquer la session comme en cours de traitement
    processedSessions.add(session.id)
    
    // Nettoyer le cache (garder seulement les 100 dernières sessions)
    if (processedSessions.size > 100) {
      const sessionsArray = Array.from(processedSessions)
      processedSessions.clear()
      sessionsArray.slice(-50).forEach(id => processedSessions.add(id))
    }
    
    console.log('Session metadata:', session.metadata)
    console.log('Session amount_total:', session.amount_total)
    console.log('Session payment_status:', session.payment_status)

    try {
      // Récupérer les données depuis les métadonnées
      const cartData = session.metadata?.cart
      const userId = session.metadata?.user_id
      
      console.log('=== METADATA DEBUG ===')
      console.log('Cart data raw:', cartData)
      console.log('User ID raw:', userId)
      
      if (!cartData) {
        console.error('❌ ERREUR: Pas de données de panier dans les métadonnées')
        console.log('Métadonnées disponibles:', Object.keys(session.metadata || {}))
        return new Response('Pas de données de panier', { status: 400 })
      }

      let items: { sku: string; quantity: number }[]
      try {
        items = JSON.parse(cartData)
        console.log('✅ Items parsés avec succès:', items)
      } catch (parseError) {
        console.error('❌ ERREUR: Impossible de parser les données du panier:', parseError)
        return new Response('Données de panier invalides', { status: 400 })
      }
      
      console.log('User ID:', userId)
      
      if (!userId) {
        console.error('❌ ERREUR: Pas d\'user_id dans les métadonnées')
        return new Response('User ID manquant', { status: 400 })
      }

      // Utiliser le client admin Supabase pour bypasser RLS
      const admin = supabaseAdmin()

      // Calculer le total de la commande
      const totalAmount = session.amount_total ? session.amount_total / 100 : 0

      // Vérifier si une commande existe déjà pour cette session (temporaire sans stripe_session_id)
      // Protection basique : vérifier les commandes récentes du même utilisateur avec le même montant
      const { data: recentOrders, error: checkError } = await admin
        .from('orders')
        .select('id, created_at')
        .eq('user_id', userId)
        .eq('total_eur', totalAmount)
        .gte('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString()) // 5 minutes
        .order('created_at', { ascending: false })

      if (checkError) {
        console.error('❌ Erreur lors de la vérification des doublons:', checkError)
      }

      if (recentOrders && recentOrders.length > 0) {
        console.log('⚠️ Commande récente similaire trouvée, possible doublon:', recentOrders[0].id)
        return new Response('Commande similaire récente détectée', { status: 200 })
      }

      // Créer la commande en base de données si on a un user_id
      if (userId) {
        console.log('=== CRÉATION COMMANDE ===')
        console.log('💰 Total amount:', totalAmount)
        console.log('👤 User ID:', userId)
        console.log('📦 Items count:', items.length)
        console.log('🔗 Session ID:', session.id)
        
        try {
          console.log('🔄 Tentative avec create_order_from_webhook...')
          // Utiliser la nouvelle fonction pour créer la commande (sans session_id pour l'instant)
          const { data: orderId, error: orderError } = await admin.rpc('create_order_from_webhook', {
            p_user_id: userId,
            p_total_eur: totalAmount,
            p_items: items
          })

          if (orderError) {
            console.error('❌ Erreur fonction create_order_from_webhook:', orderError)
            throw orderError
          }

          console.log('✅ Commande créée avec succès (fonction):', orderId)
        } catch (error) {
          console.error('❌ Erreur avec la fonction create_order_from_webhook, utilisation de la méthode manuelle...')
          console.log('🔄 Tentative méthode manuelle...')
          
          // Fallback: méthode manuelle
          const { data: order, error: orderError } = await admin
            .from('orders')
            .insert({
              user_id: userId,
              status: 'paid',
              total_eur: totalAmount,
              stripe_session_id: session.id
            })
            .select()
            .single()

          if (orderError) {
            console.error('❌ Erreur lors de la création de la commande (fallback):', orderError)
            console.log('Details de l\'erreur:', JSON.stringify(orderError, null, 2))
            throw orderError
          }

          const orderId = order.id
          console.log('✅ Commande créée avec la méthode fallback:', orderId)

          // Créer les order_items manuellement
          for (const item of items) {
            console.log(`Traitement de l'item: ${item.sku}, quantité: ${item.quantity}`)
            
            // Récupérer le prix de la variante
            const { data: variant, error: variantError } = await admin
              .from('product_variants')
              .select('prix_eur')
              .eq('sku', item.sku)
              .single()

            if (variantError || !variant) {
              console.error(`Erreur lors de la récupération de la variante ${item.sku}:`, variantError)
              continue
            }

            // Créer l'order_item
            const { error: itemError } = await admin
              .from('order_items')
              .insert({
                order_id: orderId,
                sku: item.sku,
                quantity: item.quantity,
                unit_price_eur: variant.prix_eur
              })

            if (itemError) {
              console.error(`Erreur lors de la création de l'order_item pour ${item.sku}:`, itemError)
            } else {
              console.log(`Order_item créé pour ${item.sku}`)
            }

            // Décrémenter le stock
            const { error: stockError } = await admin.rpc('decrement_stock_by_sku', {
              p_sku: item.sku,
              p_qty: item.quantity
            })

            if (stockError) {
              console.error(`Erreur lors de la décrémentation du stock pour ${item.sku}:`, stockError)
            } else {
              console.log(`Stock décrémenté avec succès pour ${item.sku}`)
            }
          }
        }
      } else {
        console.warn('Pas d\'user_id dans les métadonnées - commande non créée en base')
      }
      
      console.log('Traitement du webhook terminé avec succès')
      return new Response('OK', { status: 200 })

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
      console.error('Erreur lors du traitement du webhook:', error)
      return new Response(`Erreur de traitement: ${errorMessage}`, { status: 500 })
    }
  }

  // Traiter l'événement payment_intent.succeeded (alternative à checkout.session.completed)
  else if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent
    console.log('Paiement réussi:', paymentIntent.id)

    try {
      // Récupérer la session de checkout associée au payment_intent
      const sessions = await stripe.checkout.sessions.list({
        payment_intent: paymentIntent.id,
        limit: 1
      })

      if (sessions.data.length === 0) {
        console.log('Aucune session de checkout trouvée pour ce payment_intent')
        return new Response('OK', { status: 200 })
      }

      const session = sessions.data[0]
      console.log('Session trouvée:', session.id)
      
      // Vérification anti-doublon en mémoire pour payment_intent
      if (processedSessions.has(session.id)) {
        console.log('🛑 Session déjà traitée via payment_intent (cache mémoire):', session.id)
        return new Response('Session déjà traitée', { status: 200 })
      }
      
      // Marquer la session comme en cours de traitement
      processedSessions.add(session.id)

      // Récupérer les données depuis les métadonnées de la session
      const cartData = session.metadata?.cart
      const userId = session.metadata?.user_id
      
      if (!cartData) {
        console.error('Pas de données de panier dans les métadonnées de la session')
        return new Response('Pas de données de panier', { status: 400 })
      }

      const items: { sku: string; quantity: number }[] = JSON.parse(cartData)
      console.log('Items à traiter:', items)
      console.log('User ID:', userId)

      // Utiliser le client admin Supabase pour bypasser RLS
      const admin = supabaseAdmin()

      // Calculer le total de la commande
      const totalAmount = paymentIntent.amount ? paymentIntent.amount / 100 : 0

      // Vérifier si une commande existe déjà (protection temporaire)
      const { data: recentOrders, error: checkError } = await admin
        .from('orders')
        .select('id, created_at')
        .eq('user_id', userId)
        .eq('total_eur', totalAmount)
        .gte('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })

      if (recentOrders && recentOrders.length > 0) {
        console.log('⚠️ Commande récente similaire trouvée via payment_intent:', recentOrders[0].id)
        return new Response('Commande similaire récente détectée', { status: 200 })
      }

      // Créer la commande en base de données si on a un user_id
      if (userId) {
        console.log('Création de la commande en base via payment_intent...')
        
        try {
          // Utiliser la nouvelle fonction pour créer la commande
          const { data: orderId, error: orderError } = await admin.rpc('create_order_from_webhook', {
            p_user_id: userId,
            p_total_eur: totalAmount,
            p_items: items
          })

          if (orderError) {
            console.error('Erreur lors de la création de la commande:', orderError)
            throw orderError
          }

          console.log('Commande créée avec succès via payment_intent:', orderId)
        } catch (error) {
          console.error('Erreur avec la fonction create_order_from_webhook, utilisation de la méthode manuelle...')
          
          // Fallback: méthode manuelle
          const { data: order, error: orderError } = await admin
            .from('orders')
            .insert({
              user_id: userId,
              status: 'paid',
              total_eur: totalAmount
            })
            .select()
            .single()

          if (orderError) {
            console.error('Erreur lors de la création de la commande (fallback):', orderError)
            throw orderError
          }

          const orderId = order.id
          console.log('Commande créée avec la méthode fallback via payment_intent:', orderId)

          // Créer les order_items et décrémenter le stock
          for (const item of items) {
            console.log(`Traitement de l'item: ${item.sku}, quantité: ${item.quantity}`)
            
            // Récupérer le prix de la variante
            const { data: variant, error: variantError } = await admin
              .from('product_variants')
              .select('prix_eur')
              .eq('sku', item.sku)
              .single()

            if (variantError || !variant) {
              console.error(`Erreur lors de la récupération de la variante ${item.sku}:`, variantError)
              continue
            }

            // Créer l'order_item
            const { error: itemError } = await admin
              .from('order_items')
              .insert({
                order_id: orderId,
                sku: item.sku,
                quantity: item.quantity,
                unit_price_eur: variant.prix_eur
              })

            if (itemError) {
              console.error(`Erreur lors de la création de l'order_item pour ${item.sku}:`, itemError)
            } else {
              console.log(`Order_item créé pour ${item.sku}`)
            }

            // Décrémenter le stock
            const { error: stockError } = await admin.rpc('decrement_stock_by_sku', {
              p_sku: item.sku,
              p_qty: item.quantity
            })

            if (stockError) {
              console.error(`Erreur lors de la décrémentation du stock pour ${item.sku}:`, stockError)
            } else {
              console.log(`Stock décrémenté avec succès pour ${item.sku}`)
            }
          }
        }
      } else {
        console.warn('Pas d\'user_id dans les métadonnées - commande non créée en base')
      }
      
      console.log('Traitement du payment_intent terminé avec succès')
      return new Response('OK', { status: 200 })

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
      console.error('Erreur lors du traitement du payment_intent:', error)
      return new Response(`Erreur de traitement: ${errorMessage}`, { status: 500 })
    }
  }
  else if (event.type === 'payment_intent.payment_failed') {
    console.log('Échec du paiement:', event.data.object.id)
  }
  else {
    console.log(`Événement non géré: ${event.type}`)
    console.log(`Données de l'événement:`, JSON.stringify(event.data, null, 2))
  }

  console.log(`=== FIN WEBHOOK DEBUG ===`)
  return new Response('OK', { status: 200 })
}
