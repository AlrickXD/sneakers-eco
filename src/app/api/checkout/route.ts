import Stripe from 'stripe'
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getFirstImage } from '@/utils/imageUtils'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  try {
    const { items, userId, needsLabel } = await req.json() as {
      items: { sku: string; quantity: number }[]
      userId?: string
      needsLabel?: boolean
    }

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Panier vide' }, { status: 400 })
    }

    // Vérifier le rôle de l'utilisateur si userId est fourni
    if (userId) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()

      if (profileError) {
        console.error('Erreur lors de la vérification du profil:', profileError)
        throw new Error('Erreur lors de la vérification des permissions')
      }

      if (profile?.role === 'vendeur' || profile?.role === 'admin') {
        return NextResponse.json({
          error: 'Les vendeurs et administrateurs ne peuvent pas effectuer d\'achats sur cette plateforme'
        }, { status: 403 })
      }
    }

    // Vérifier les SKUs et récupérer les informations des variantes
    const skus = items.map(i => i.sku)
    const { data: variants, error } = await supabase
      .from('product_variants')
      .select('sku, name, prix_eur, images, stock')
      .in('sku', skus)

    if (error) {
      console.error('Erreur Supabase:', error)
      throw new Error('Erreur lors de la vérification des produits')
    }

    if (!variants || variants.length === 0) {
      return NextResponse.json({ error: 'Produits non trouvés' }, { status: 400 })
    }

    // Construire les line_items pour Stripe
    const line_items = items.map(item => {
      const variant = variants.find(v => v.sku === item.sku)
      
      if (!variant) {
        throw new Error(`Produit non trouvé: ${item.sku}`)
      }

      if (variant.stock < item.quantity) {
        throw new Error(`Stock insuffisant pour ${variant.name} (${variant.stock} disponible(s))`)
      }

      // Récupérer la première image nettoyée
      const firstImage = getFirstImage(variant.images)

      return {
        quantity: item.quantity,
        price_data: {
          currency: 'eur',
          unit_amount: Math.round(Number(variant.prix_eur) * 100), // Convertir en centimes
          product_data: {
            name: variant.name,
            images: firstImage ? [firstImage] : [],
            metadata: {
              sku: variant.sku
            }
          }
        }
      }
    })

    console.log('🔍 User ID reçu dans checkout:', userId)
    
    // Créer la session Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items,
      success_url: `${process.env.SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.SITE_URL}/cart`,
      metadata: {
        cart: JSON.stringify(items), // Stocker les items pour le webhook
        user_id: userId || '', // Stocker l'ID utilisateur pour créer la commande
        needs_label: needsLabel ? 'true' : 'false' // Stocker l'information sur l'étiquette
      },
      shipping_address_collection: {
        allowed_countries: ['FR', 'BE', 'CH', 'LU', 'MC']
      },
      billing_address_collection: 'required'
    })

    return NextResponse.json({ url: session.url })
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la création de la session de paiement'
    console.error('Erreur checkout:', error)
    return NextResponse.json(
      { error: errorMessage },
      { status: 400 }
    )
  }
}
