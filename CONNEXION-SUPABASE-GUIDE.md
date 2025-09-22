# Guide de connexion à Supabase

## Étapes pour se connecter :

### 1. Ouvrir Supabase SQL Editor
- Allez sur votre projet Supabase
- Cliquez sur "SQL Editor" dans le menu de gauche

### 2. Se connecter
- En haut à droite, cliquez sur "Connect"
- Choisissez **"Direct connection"** avec URI
- Utilisez votre compte vendeur : `alrickadote@gmail.com`

### 3. Exécuter la section 1
```sql
-- section-1-with-auth.sql
SELECT
  '=== INSTRUCTIONS ===' as section,
  '1. Dans Supabase SQL Editor, cliquez sur "Connect" en haut à droite' as instruction_1,
  '2. Choisissez "Direct connection" avec URI' as instruction_2,
  '3. Connectez-vous avec votre compte vendeur: alrickadote@gmail.com' as instruction_3,
  '4. Exécutez cette requête après connexion' as instruction_4;

SELECT
  '=== RÉSULTAT ATTENDU ===' as section,
  auth.uid() as user_id,
  CASE WHEN auth.uid() IS NOT NULL THEN 'AUTHENTIFIÉ' ELSE 'NON AUTHENTIFIÉ' END as status;
```

## Résultat attendu après connexion :
```json
[
  {
    "section": "=== RÉSULTAT ATTENDU ====",
    "user_id": "votre-uuid-ici",
    "status": "AUTHENTIFIÉ"
  }
]
```

## Une fois connecté :
- Continuez avec `section-2-products.sql`
- Puis `section-3-variants.sql`
- Etc.

**Connectez-vous dans Supabase et exécutez `section-1-with-auth.sql` !** 🎉
