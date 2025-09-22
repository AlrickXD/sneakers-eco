-- =====================================================
-- DONNÉES DE TEST POUR SNEAKERS-ECO
-- À exécuter après les migrations principales
-- =====================================================

-- Insérer des produits de test
INSERT INTO products (product_id, name, categorie, images, description) VALUES
('NIKE-AIR-FORCE-1', 'Nike Air Force 1', 'Lifestyle', 'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/b7d9211c-26e7-431a-ac24-b0540fb3c00f/air-force-1-07-shoes-WrLlWX.png', 'La légendaire Air Force 1 dans sa version classique.'),
('ADIDAS-STAN-SMITH', 'Adidas Stan Smith', 'Lifestyle', 'https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/ee6425c7c3e04297b1b7af4a00dc2b38_9366/Stan_Smith_Shoes_White_FX5500_01_standard.jpg', 'Le modèle iconique Stan Smith en cuir blanc.'),
('JORDAN-AIR-JORDAN-1-MID', 'Air Jordan 1 Mid', 'Basketball', 'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/i1-665455a5-45de-40fb-945f-c1852b82400d/air-jordan-1-mid-shoes-86TN7K.png', 'Le légendaire Jordan 1 dans sa version Mid.'),
('CONVERSE-CHUCK-TAYLOR', 'Converse Chuck Taylor All Star', 'Lifestyle', 'https://www.converse.com/dw/image/v2/BCZC_PRD/on/demandware.static/-/Sites-cnv-master-catalog/default/dw3b9e5b5e/images/a_107/M9160C_A_107X1.jpg', 'La classique Chuck Taylor All Star en toile.'),
('VANS-OLD-SKOOL', 'Vans Old Skool', 'Skateboard', 'https://images.vans.com/is/image/Vans/D3HY28-HERO?$583x583$', 'La mythique Old Skool avec sa bande latérale iconique.')
ON CONFLICT (product_id) DO NOTHING;

-- Insérer des variantes de produits
INSERT INTO product_variants (sku, product_id, name, etat, taille, categorie, prix_eur, stock, images, description) VALUES
-- Nike Air Force 1 - Neuf
('AF1-WHITE-39-NEW', 'NIKE-AIR-FORCE-1', 'Nike Air Force 1 - Blanc', 'NEUF', 39, 'Lifestyle', 109.99, 5, 'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/b7d9211c-26e7-431a-ac24-b0540fb3c00f/air-force-1-07-shoes-WrLlWX.png', 'Air Force 1 blanche, taille 39, état neuf'),
('AF1-WHITE-40-NEW', 'NIKE-AIR-FORCE-1', 'Nike Air Force 1 - Blanc', 'NEUF', 40, 'Lifestyle', 109.99, 3, 'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/b7d9211c-26e7-431a-ac24-b0540fb3c00f/air-force-1-07-shoes-WrLlWX.png', 'Air Force 1 blanche, taille 40, état neuf'),
('AF1-WHITE-41-NEW', 'NIKE-AIR-FORCE-1', 'Nike Air Force 1 - Blanc', 'NEUF', 41, 'Lifestyle', 109.99, 8, 'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/b7d9211c-26e7-431a-ac24-b0540fb3c00f/air-force-1-07-shoes-WrLlWX.png', 'Air Force 1 blanche, taille 41, état neuf'),

-- Nike Air Force 1 - Seconde main
('AF1-WHITE-40-USED', 'NIKE-AIR-FORCE-1', 'Nike Air Force 1 - Blanc (Occasion)', 'SECONDE_MAIN', 40, 'Lifestyle', 79.99, 2, 'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/b7d9211c-26e7-431a-ac24-b0540fb3c00f/air-force-1-07-shoes-WrLlWX.png', 'Air Force 1 blanche, taille 40, bon état'),
('AF1-WHITE-42-USED', 'NIKE-AIR-FORCE-1', 'Nike Air Force 1 - Blanc (Occasion)', 'SECONDE_MAIN', 42, 'Lifestyle', 69.99, 1, 'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/b7d9211c-26e7-431a-ac24-b0540fb3c00f/air-force-1-07-shoes-WrLlWX.png', 'Air Force 1 blanche, taille 42, très bon état'),

-- Adidas Stan Smith - Neuf
('STAN-WHITE-39-NEW', 'ADIDAS-STAN-SMITH', 'Adidas Stan Smith - Blanc/Vert', 'NEUF', 39, 'Lifestyle', 89.99, 4, 'https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/ee6425c7c3e04297b1b7af4a00dc2b38_9366/Stan_Smith_Shoes_White_FX5500_01_standard.jpg', 'Stan Smith classique blanc/vert, taille 39'),
('STAN-WHITE-40-NEW', 'ADIDAS-STAN-SMITH', 'Adidas Stan Smith - Blanc/Vert', 'NEUF', 40, 'Lifestyle', 89.99, 6, 'https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/ee6425c7c3e04297b1b7af4a00dc2b38_9366/Stan_Smith_Shoes_White_FX5500_01_standard.jpg', 'Stan Smith classique blanc/vert, taille 40'),
('STAN-WHITE-41-NEW', 'ADIDAS-STAN-SMITH', 'Adidas Stan Smith - Blanc/Vert', 'NEUF', 41, 'Lifestyle', 89.99, 2, 'https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/ee6425c7c3e04297b1b7af4a00dc2b38_9366/Stan_Smith_Shoes_White_FX5500_01_standard.jpg', 'Stan Smith classique blanc/vert, taille 41'),

-- Jordan 1 Mid - Neuf
('J1MID-BRW-40-NEW', 'JORDAN-AIR-JORDAN-1-MID', 'Air Jordan 1 Mid - Bred Toe', 'NEUF', 40, 'Basketball', 129.99, 3, 'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/i1-665455a5-45de-40fb-945f-c1852b82400d/air-jordan-1-mid-shoes-86TN7K.png', 'Jordan 1 Mid coloris Bred Toe, taille 40'),
('J1MID-BRW-41-NEW', 'JORDAN-AIR-JORDAN-1-MID', 'Air Jordan 1 Mid - Bred Toe', 'NEUF', 41, 'Basketball', 129.99, 5, 'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/i1-665455a5-45de-40fb-945f-c1852b82400d/air-jordan-1-mid-shoes-86TN7K.png', 'Jordan 1 Mid coloris Bred Toe, taille 41'),

-- Jordan 1 Mid - Seconde main
('J1MID-BRW-40-USED', 'JORDAN-AIR-JORDAN-1-MID', 'Air Jordan 1 Mid - Bred Toe (Occasion)', 'SECONDE_MAIN', 40, 'Basketball', 89.99, 1, 'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/i1-665455a5-45de-40fb-945f-c1852b82400d/air-jordan-1-mid-shoes-86TN7K.png', 'Jordan 1 Mid Bred Toe, taille 40, bon état'),

-- Converse Chuck Taylor - Neuf
('CHUCK-BLACK-39-NEW', 'CONVERSE-CHUCK-TAYLOR', 'Chuck Taylor All Star - Noir', 'NEUF', 39, 'Lifestyle', 69.99, 7, 'https://www.converse.com/dw/image/v2/BCZC_PRD/on/demandware.static/-/Sites-cnv-master-catalog/default/dw3b9e5b5e/images/a_107/M9160C_A_107X1.jpg', 'Chuck Taylor All Star noir, taille 39'),
('CHUCK-BLACK-40-NEW', 'CONVERSE-CHUCK-TAYLOR', 'Chuck Taylor All Star - Noir', 'NEUF', 40, 'Lifestyle', 69.99, 4, 'https://www.converse.com/dw/image/v2/BCZC_PRD/on/demandware.static/-/Sites-cnv-master-catalog/default/dw3b9e5b5e/images/a_107/M9160C_A_107X1.jpg', 'Chuck Taylor All Star noir, taille 40'),

-- Vans Old Skool - Neuf
('VANS-OS-BLK-40-NEW', 'VANS-OLD-SKOOL', 'Vans Old Skool - Noir/Blanc', 'NEUF', 40, 'Skateboard', 79.99, 6, 'https://images.vans.com/is/image/Vans/D3HY28-HERO?$583x583$', 'Old Skool noir et blanc, taille 40'),
('VANS-OS-BLK-41-NEW', 'VANS-OLD-SKOOL', 'Vans Old Skool - Noir/Blanc', 'NEUF', 41, 'Skateboard', 79.99, 3, 'https://images.vans.com/is/image/Vans/D3HY28-HERO?$583x583$', 'Old Skool noir et blanc, taille 41'),

-- Vans Old Skool - Seconde main
('VANS-OS-BLK-40-USED', 'VANS-OLD-SKOOL', 'Vans Old Skool - Noir/Blanc (Occasion)', 'SECONDE_MAIN', 40, 'Skateboard', 49.99, 2, 'https://images.vans.com/is/image/Vans/D3HY28-HERO?$583x583$', 'Old Skool noir et blanc, taille 40, très bon état')

ON CONFLICT (sku) DO NOTHING;

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE '✅ Données de test insérées avec succès !';
    RAISE NOTICE 'Produits: %', (SELECT COUNT(*) FROM products);
    RAISE NOTICE 'Variantes: %', (SELECT COUNT(*) FROM product_variants);
END $$;
