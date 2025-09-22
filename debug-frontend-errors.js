// Script de diagnostic pour les erreurs frontend lors de l'ajout de produit
// À exécuter dans la console du navigateur pendant l'ajout d'un produit

console.log('=== DIAGNOSTIC FRONTEND AJOUT PRODUIT ===');

// 1. Vérifier la configuration Supabase
console.log('\n1. CONFIGURATION SUPABASE');
console.log('==========================');

if (typeof window !== 'undefined' && window.supabase) {
    console.log('✅ Client Supabase disponible');
    console.log('URL Supabase:', window.supabase.supabaseUrl);
    console.log('Clé Supabase:', window.supabase.supabaseKey ? 'Configurée' : '❌ Manquante');
} else {
    console.log('❌ Client Supabase non disponible');
}

// 2. Vérifier l'authentification
console.log('\n2. AUTHENTIFICATION');
console.log('===================');

async function checkAuth() {
    try {
        if (typeof window !== 'undefined' && window.supabase) {
            const { data: { user }, error } = await window.supabase.auth.getUser();
            
            if (error) {
                console.log('❌ Erreur auth:', error);
                return null;
            }
            
            if (user) {
                console.log('✅ Utilisateur connecté:', user.email);
                console.log('ID utilisateur:', user.id);
                console.log('Métadonnées:', user.user_metadata);
                
                // Vérifier le profil
                const { data: profile, error: profileError } = await window.supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();
                
                if (profileError) {
                    console.log('❌ Erreur profil:', profileError);
                } else {
                    console.log('✅ Profil trouvé:', profile);
                    console.log('Rôle:', profile.role);
                }
                
                return { user, profile };
            } else {
                console.log('❌ Aucun utilisateur connecté');
                return null;
            }
        }
    } catch (err) {
        console.log('❌ Erreur lors de la vérification auth:', err);
        return null;
    }
}

// 3. Vérifier les permissions sur les tables
console.log('\n3. PERMISSIONS TABLES');
console.log('=====================');

async function checkTablePermissions() {
    try {
        if (typeof window !== 'undefined' && window.supabase) {
            console.log('Test lecture products...');
            const { data: products, error: productsError } = await window.supabase
                .from('products')
                .select('product_id, name')
                .limit(1);
            
            if (productsError) {
                console.log('❌ Erreur lecture products:', productsError);
            } else {
                console.log('✅ Lecture products OK, échantillon:', products);
            }
            
            console.log('Test lecture product_variants...');
            const { data: variants, error: variantsError } = await window.supabase
                .from('product_variants')
                .select('sku, name')
                .limit(1);
            
            if (variantsError) {
                console.log('❌ Erreur lecture product_variants:', variantsError);
            } else {
                console.log('✅ Lecture product_variants OK, échantillon:', variants);
            }
        }
    } catch (err) {
        console.log('❌ Erreur lors du test permissions:', err);
    }
}

// 4. Tester l'insertion d'un produit de test
console.log('\n4. TEST INSERTION PRODUIT');
console.log('=========================');

async function testProductInsertion() {
    try {
        if (typeof window !== 'undefined' && window.supabase) {
            const { data: { user } } = await window.supabase.auth.getUser();
            
            if (!user) {
                console.log('❌ Pas d\'utilisateur connecté pour le test');
                return;
            }
            
            const testProductId = `TEST-DEBUG-${Date.now()}`;
            
            console.log('Test insertion produit avec ID:', testProductId);
            
            // Test produit principal
            const { data: productData, error: productError } = await window.supabase
                .from('products')
                .insert({
                    product_id: testProductId,
                    name: 'Test Debug Product',
                    categorie: 'Homme',
                    description: 'Produit de test pour diagnostic',
                    images: 'https://example.com/test.jpg',
                    seller_id: user.id
                })
                .select();
            
            if (productError) {
                console.log('❌ Erreur insertion produit:', productError);
                console.log('Détails erreur:', {
                    message: productError.message,
                    code: productError.code,
                    details: productError.details,
                    hint: productError.hint
                });
            } else {
                console.log('✅ Insertion produit réussie:', productData);
                
                // Test variante
                const testVariantSku = `${testProductId}-40-neuf`;
                
                console.log('Test insertion variante avec SKU:', testVariantSku);
                
                const { data: variantData, error: variantError } = await window.supabase
                    .from('product_variants')
                    .insert({
                        sku: testVariantSku,
                        product_id: testProductId,
                        name: 'Test Debug Product - Taille 40',
                        brand: 'Nike',
                        etat: 'NEUF',
                        taille: 40,
                        categorie: 'Homme',
                        prix_eur: 99.99,
                        stock: 1,
                        images: 'https://example.com/test.jpg',
                        couleur: 'NOIR',
                        description: 'Variante de test',
                        seller_id: user.id
                    })
                    .select();
                
                if (variantError) {
                    console.log('❌ Erreur insertion variante:', variantError);
                    console.log('Détails erreur:', {
                        message: variantError.message,
                        code: variantError.code,
                        details: variantError.details,
                        hint: variantError.hint
                    });
                } else {
                    console.log('✅ Insertion variante réussie:', variantData);
                }
                
                // Nettoyer les données de test
                console.log('Nettoyage des données de test...');
                await window.supabase.from('product_variants').delete().eq('product_id', testProductId);
                await window.supabase.from('products').delete().eq('product_id', testProductId);
                console.log('✅ Données de test supprimées');
            }
        }
    } catch (err) {
        console.log('❌ Erreur lors du test insertion:', err);
    }
}

// 5. Vérifier le storage des images
console.log('\n5. STORAGE IMAGES');
console.log('=================');

async function checkImageStorage() {
    try {
        if (typeof window !== 'undefined' && window.supabase) {
            console.log('Test liste buckets...');
            const { data: buckets, error: bucketsError } = await window.supabase.storage.listBuckets();
            
            if (bucketsError) {
                console.log('❌ Erreur liste buckets:', bucketsError);
            } else {
                console.log('✅ Buckets disponibles:', buckets);
                
                const productBucket = buckets.find(b => b.name === 'product-images');
                if (productBucket) {
                    console.log('✅ Bucket product-images trouvé:', productBucket);
                } else {
                    console.log('❌ Bucket product-images non trouvé');
                }
            }
            
            // Test upload d'un fichier de test (blob vide)
            console.log('Test upload fichier...');
            const testFile = new Blob(['test'], { type: 'text/plain' });
            const testFileName = `test-${Date.now()}.txt`;
            
            const { data: uploadData, error: uploadError } = await window.supabase.storage
                .from('product-images')
                .upload(testFileName, testFile);
            
            if (uploadError) {
                console.log('❌ Erreur upload test:', uploadError);
            } else {
                console.log('✅ Upload test réussi:', uploadData);
                
                // Supprimer le fichier de test
                await window.supabase.storage.from('product-images').remove([testFileName]);
                console.log('✅ Fichier de test supprimé');
            }
        }
    } catch (err) {
        console.log('❌ Erreur lors du test storage:', err);
    }
}

// 6. Analyser les erreurs du formulaire
console.log('\n6. ANALYSE FORMULAIRE');
console.log('=====================');

function analyzeFormData() {
    try {
        // Chercher le formulaire d'ajout de produit
        const form = document.querySelector('form');
        if (!form) {
            console.log('❌ Formulaire non trouvé sur cette page');
            return;
        }
        
        console.log('✅ Formulaire trouvé');
        
        // Analyser les champs requis
        const requiredFields = [
            'input[placeholder*="SKU"]',
            'input[placeholder*="Nike Air Force"]',
            'textarea[placeholder*="Décrivez"]'
        ];
        
        requiredFields.forEach((selector, index) => {
            const field = form.querySelector(selector);
            if (field) {
                console.log(`✅ Champ ${index + 1} trouvé:`, field.value || 'vide');
            } else {
                console.log(`❌ Champ ${index + 1} non trouvé (${selector})`);
            }
        });
        
        // Vérifier les sélecteurs
        const selects = form.querySelectorAll('select');
        console.log(`Nombre de sélecteurs: ${selects.length}`);
        selects.forEach((select, index) => {
            console.log(`Select ${index + 1}:`, select.value || 'non sélectionné');
        });
        
        // Vérifier les images
        const fileInputs = form.querySelectorAll('input[type="file"]');
        console.log(`Nombre d'inputs file: ${fileInputs.length}`);
        fileInputs.forEach((input, index) => {
            console.log(`File input ${index + 1}:`, input.files ? input.files.length + ' fichiers' : 'aucun fichier');
        });
        
    } catch (err) {
        console.log('❌ Erreur analyse formulaire:', err);
    }
}

// 7. Intercepter les erreurs réseau
console.log('\n7. INTERCEPTION ERREURS RÉSEAU');
console.log('==============================');

// Sauvegarder les méthodes originales
const originalFetch = window.fetch;
const originalXHROpen = XMLHttpRequest.prototype.open;

// Intercepter fetch
window.fetch = function(...args) {
    console.log('🌐 Fetch request:', args[0]);
    return originalFetch.apply(this, args)
        .then(response => {
            if (!response.ok) {
                console.log('❌ Fetch error response:', response.status, response.statusText);
            }
            return response;
        })
        .catch(error => {
            console.log('❌ Fetch network error:', error);
            throw error;
        });
};

// Intercepter XMLHttpRequest
XMLHttpRequest.prototype.open = function(method, url, ...args) {
    console.log('🌐 XHR request:', method, url);
    return originalXHROpen.apply(this, [method, url, ...args]);
};

// Exécuter tous les tests
async function runAllTests() {
    console.log('\n=== EXÉCUTION DE TOUS LES TESTS ===');
    
    const auth = await checkAuth();
    if (auth) {
        await checkTablePermissions();
        await testProductInsertion();
        await checkImageStorage();
    }
    
    analyzeFormData();
    
    console.log('\n=== DIAGNOSTIC TERMINÉ ===');
    console.log('Vérifiez les résultats ci-dessus pour identifier les problèmes.');
    console.log('Les erreurs réseau seront maintenant interceptées et loggées.');
    
    // Restaurer les méthodes originales après 30 secondes
    setTimeout(() => {
        window.fetch = originalFetch;
        XMLHttpRequest.prototype.open = originalXHROpen;
        console.log('🔄 Interception réseau désactivée');
    }, 30000);
}

// Lancer les tests automatiquement
runAllTests();

// Exposer les fonctions pour usage manuel
window.debugSellerProduct = {
    checkAuth,
    checkTablePermissions,
    testProductInsertion,
    checkImageStorage,
    analyzeFormData,
    runAllTests
};
