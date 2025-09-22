-- =====================================================
-- AJOUT DE PRODUITS ENFANTS POUR TESTER LES FILTRES
-- =====================================================

-- Ajouter des produits enfants
INSERT INTO products (product_id, name, categorie, images, description) VALUES
('NIKE-AIR-MAX-KIDS', 'Nike Air Max 90 Kids', 'Running', 'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/f8dda126-d56e-4b4c-9e6e-1b4c5a5b5c5d/air-max-90-kids-shoes.png', 'Air Max 90 spécialement conçue pour les enfants.'),
('ADIDAS-SUPERSTAR-KIDS', 'Adidas Superstar Kids', 'Lifestyle', 'https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/superstar-kids.jpg', 'La légendaire Superstar en version enfant.'),
('CONVERSE-KIDS-CHUCK', 'Converse Chuck Taylor Kids', 'Lifestyle', 'https://www.converse.com/dw/image/v2/BCZC_PRD/on/demandware.static/-/Sites-cnv-master-catalog/default/kids-chuck.jpg', 'Chuck Taylor All Star pour les plus petits.')
ON CONFLICT (product_id) DO NOTHING;

-- Ajouter des variantes enfants (tailles 28-38)
INSERT INTO product_variants (sku, product_id, name, etat, taille, categorie, prix_eur, stock, images, description) VALUES
-- Nike Air Max Kids
('NIKE-KIDS-28-NEW', 'NIKE-AIR-MAX-KIDS', 'Nike Air Max 90 Kids', 'NEUF', 28, 'Running', 65.99, 8, 'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/f8dda126-d56e-4b4c-9e6e-1b4c5a5b5c5d/air-max-90-kids-shoes.png', 'Air Max 90 enfant taille 28'),
('NIKE-KIDS-30-NEW', 'NIKE-AIR-MAX-KIDS', 'Nike Air Max 90 Kids', 'NEUF', 30, 'Running', 65.99, 5, 'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/f8dda126-d56e-4b4c-9e6e-1b4c5a5b5c5d/air-max-90-kids-shoes.png', 'Air Max 90 enfant taille 30'),
('NIKE-KIDS-32-NEW', 'NIKE-AIR-MAX-KIDS', 'Nike Air Max 90 Kids', 'NEUF', 32, 'Running', 65.99, 6, 'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/f8dda126-d56e-4b4c-9e6e-1b4c5a5b5c5d/air-max-90-kids-shoes.png', 'Air Max 90 enfant taille 32'),
('NIKE-KIDS-34-NEW', 'NIKE-AIR-MAX-KIDS', 'Nike Air Max 90 Kids', 'NEUF', 34, 'Running', 65.99, 4, 'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/f8dda126-d56e-4b4c-9e6e-1b4c5a5b5c5d/air-max-90-kids-shoes.png', 'Air Max 90 enfant taille 34'),
('NIKE-KIDS-36-NEW', 'NIKE-AIR-MAX-KIDS', 'Nike Air Max 90 Kids', 'NEUF', 36, 'Running', 65.99, 7, 'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/f8dda126-d56e-4b4c-9e6e-1b4c5a5b5c5d/air-max-90-kids-shoes.png', 'Air Max 90 enfant taille 36'),
('NIKE-KIDS-38-NEW', 'NIKE-AIR-MAX-KIDS', 'Nike Air Max 90 Kids', 'NEUF', 38, 'Running', 65.99, 3, 'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/f8dda126-d56e-4b4c-9e6e-1b4c5a5b5c5d/air-max-90-kids-shoes.png', 'Air Max 90 enfant taille 38'),

-- Adidas Superstar Kids
('ADIDAS-KIDS-29-NEW', 'ADIDAS-SUPERSTAR-KIDS', 'Adidas Superstar Kids', 'NEUF', 29, 'Lifestyle', 55.99, 6, 'https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/superstar-kids.jpg', 'Superstar enfant taille 29'),
('ADIDAS-KIDS-31-NEW', 'ADIDAS-SUPERSTAR-KIDS', 'Adidas Superstar Kids', 'NEUF', 31, 'Lifestyle', 55.99, 8, 'https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/superstar-kids.jpg', 'Superstar enfant taille 31'),
('ADIDAS-KIDS-33-NEW', 'ADIDAS-SUPERSTAR-KIDS', 'Adidas Superstar Kids', 'NEUF', 33, 'Lifestyle', 55.99, 4, 'https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/superstar-kids.jpg', 'Superstar enfant taille 33'),
('ADIDAS-KIDS-35-NEW', 'ADIDAS-SUPERSTAR-KIDS', 'Adidas Superstar Kids', 'NEUF', 35, 'Lifestyle', 55.99, 5, 'https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/superstar-kids.jpg', 'Superstar enfant taille 35'),
('ADIDAS-KIDS-37-NEW', 'ADIDAS-SUPERSTAR-KIDS', 'Adidas Superstar Kids', 'NEUF', 37, 'Lifestyle', 55.99, 7, 'https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/superstar-kids.jpg', 'Superstar enfant taille 37'),

-- Converse Kids
('CONVERSE-KIDS-30-NEW', 'CONVERSE-KIDS-CHUCK', 'Converse Chuck Taylor Kids', 'NEUF', 30, 'Lifestyle', 45.99, 9, 'https://www.converse.com/dw/image/v2/BCZC_PRD/on/demandware.static/-/Sites-cnv-master-catalog/default/kids-chuck.jpg', 'Chuck Taylor enfant taille 30'),
('CONVERSE-KIDS-32-NEW', 'CONVERSE-KIDS-CHUCK', 'Converse Chuck Taylor Kids', 'NEUF', 32, 'Lifestyle', 45.99, 6, 'https://www.converse.com/dw/image/v2/BCZC_PRD/on/demandware.static/-/Sites-cnv-master-catalog/default/kids-chuck.jpg', 'Chuck Taylor enfant taille 32'),
('CONVERSE-KIDS-34-NEW', 'CONVERSE-KIDS-CHUCK', 'Converse Chuck Taylor Kids', 'NEUF', 34, 'Lifestyle', 45.99, 8, 'https://www.converse.com/dw/image/v2/BCZC_PRD/on/demandware.static/-/Sites-cnv-master-catalog/default/kids-chuck.jpg', 'Chuck Taylor enfant taille 34'),
('CONVERSE-KIDS-36-NEW', 'CONVERSE-KIDS-CHUCK', 'Converse Chuck Taylor Kids', 'NEUF', 36, 'Lifestyle', 45.99, 4, 'https://www.converse.com/dw/image/v2/BCZC_PRD/on/demandware.static/-/Sites-cnv-master-catalog/default/kids-chuck.jpg', 'Chuck Taylor enfant taille 36'),
('CONVERSE-KIDS-38-NEW', 'CONVERSE-KIDS-CHUCK', 'Converse Chuck Taylor Kids', 'NEUF', 38, 'Lifestyle', 45.99, 5, 'https://www.converse.com/dw/image/v2/BCZC_PRD/on/demandware.static/-/Sites-cnv-master-catalog/default/kids-chuck.jpg', 'Chuck Taylor enfant taille 38'),

-- Quelques variantes seconde main pour enfants
('NIKE-KIDS-30-USED', 'NIKE-AIR-MAX-KIDS', 'Nike Air Max 90 Kids', 'SECONDE_MAIN', 30, 'Running', 45.99, 3, 'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/f8dda126-d56e-4b4c-9e6e-1b4c5a5b5c5d/air-max-90-kids-shoes.png', 'Air Max 90 enfant taille 30 seconde main'),
('ADIDAS-KIDS-31-USED', 'ADIDAS-SUPERSTAR-KIDS', 'Adidas Superstar Kids', 'SECONDE_MAIN', 31, 'Lifestyle', 35.99, 2, 'https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/superstar-kids.jpg', 'Superstar enfant taille 31 seconde main'),
('CONVERSE-KIDS-32-USED', 'CONVERSE-KIDS-CHUCK', 'Converse Chuck Taylor Kids', 'SECONDE_MAIN', 32, 'Lifestyle', 25.99, 4, 'https://www.converse.com/dw/image/v2/BCZC_PRD/on/demandware.static/-/Sites-cnv-master-catalog/default/kids-chuck.jpg', 'Chuck Taylor enfant taille 32 seconde main')
ON CONFLICT (sku) DO NOTHING;

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE '✅ Produits enfants ajoutés avec succès !';
    RAISE NOTICE 'Les filtres par genre devraient maintenant fonctionner.';
END $$;


