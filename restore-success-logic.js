// =====================================================
// CODE À RESTAURER DANS success/page.tsx APRÈS AVOIR AJOUTÉ LA COLONNE
// =====================================================

// Remplacer les lignes 34-43 dans src/app/success/page.tsx par :

/*
        // D'abord, essayons une requête simple sans les relations
        const { data: simpleOrderData, error: simpleOrderError } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id)
          .eq('stripe_session_id', sessionId)
          .order('created_at', { ascending: false })
          .limit(1)
*/

// Cette logique sera restaurée automatiquement une fois la colonne stripe_session_id ajoutée
