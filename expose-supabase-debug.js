// Script pour exposer Supabase dans la console et diagnostiquer
// À coller dans la console du navigateur sur votre page d'ajout

console.log('=== DIAGNOSTIC SUPABASE CONFIGURATION ===');

// 1. Vérifier si le module Supabase est chargé
console.log('1. VÉRIFICATION MODULES');
console.log('=======================');

// Chercher Supabase dans les modules Next.js
if (typeof window !== 'undefined') {
    // Vérifier les variables d'environnement côté client
    console.log('Variables d\'environnement détectées:');
    console.log('NEXT_PUBLIC_SUPABASE_URL:', process?.env?.NEXT_PUBLIC_SUPABASE_URL || 'NON DÉFINIE');
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process?.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'DÉFINIE' : 'NON DÉFINIE');
    
    // Essayer de trouver Supabase dans les modules webpack
    if (window.__NEXT_DATA__) {
        console.log('✅ Application Next.js détectée');
        console.log('Build ID:', window.__NEXT_DATA__.buildId);
    }
    
    // Vérifier si @supabase/supabase-js est disponible
    try {
        // Essayer d'importer dynamiquement
        import('@supabase/supabase-js').then(({ createClient }) => {
            console.log('✅ Module @supabase/supabase-js disponible');
            
            // Créer un client Supabase temporaire pour test
            const testUrl = prompt('Entrez votre URL Supabase (https://xxx.supabase.co):');
            const testKey = prompt('Entrez votre clé anonyme Supabase:');
            
            if (testUrl && testKey) {
                const testClient = createClient(testUrl, testKey);
                window.supabase = testClient;
                
                console.log('✅ Client Supabase créé et exposé dans window.supabase');
                console.log('Vous pouvez maintenant tester avec:');
                console.log('window.supabase.auth.getUser()');
                
                // Test rapide
                testClient.auth.getUser().then(({ data, error }) => {
                    if (error) {
                        console.log('❌ Erreur auth:', error);
                    } else {
                        console.log('✅ Auth fonctionne:', data.user ? 'Connecté' : 'Non connecté');
                    }
                });
                
                // Test de lecture
                testClient.from('profiles').select('*').limit(1).then(({ data, error }) => {
                    if (error) {
                        console.log('❌ Erreur lecture profiles:', error);
                    } else {
                        console.log('✅ Lecture profiles fonctionne:', data);
                    }
                });
            }
        }).catch(err => {
            console.log('❌ Module @supabase/supabase-js non disponible:', err);
        });
    } catch (err) {
        console.log('❌ Import dynamique échoué:', err);
    }
    
    // Vérifier les erreurs réseau
    const originalConsoleError = console.error;
    console.error = function(...args) {
        if (args.some(arg => typeof arg === 'string' && (arg.includes('supabase') || arg.includes('SUPABASE')))) {
            console.log('🔍 ERREUR SUPABASE DÉTECTÉE:', ...args);
        }
        originalConsoleError.apply(console, args);
    };
    
    console.log('2. ANALYSE DU FORMULAIRE');
    console.log('========================');
    
    // Analyser le formulaire plus en détail
    const form = document.querySelector('form');
    if (form) {
        console.log('✅ Formulaire trouvé');
        
        // Chercher tous les inputs
        const allInputs = form.querySelectorAll('input, textarea, select');
        console.log(`📋 Total des champs: ${allInputs.length}`);
        
        allInputs.forEach((input, index) => {
            const type = input.type || input.tagName.toLowerCase();
            const placeholder = input.placeholder || 'N/A';
            const name = input.name || 'N/A';
            const value = input.value || 'vide';
            
            console.log(`  ${index + 1}. ${type} - name:"${name}" - placeholder:"${placeholder}" - value:"${value.substring(0, 50)}${value.length > 50 ? '...' : ''}"`);
        });
        
        // Vérifier les boutons
        const buttons = form.querySelectorAll('button');
        console.log(`🔘 Boutons trouvés: ${buttons.length}`);
        buttons.forEach((btn, index) => {
            console.log(`  ${index + 1}. "${btn.textContent?.trim()}" - type:"${btn.type}"`);
        });
    }
    
    console.log('\n3. INSTRUCTIONS SUIVANTES');
    console.log('=========================');
    console.log('Si vous voyez des erreurs Supabase ci-dessus:');
    console.log('1. Vérifiez votre fichier .env.local');
    console.log('2. Redémarrez votre serveur de développement');
    console.log('3. Vérifiez que les variables commencent par NEXT_PUBLIC_');
    console.log('4. Essayez de créer un client manuellement avec les prompts ci-dessus');
    
} else {
    console.log('❌ Environnement navigateur non disponible');
}
