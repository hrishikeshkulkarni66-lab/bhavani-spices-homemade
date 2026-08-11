-- ============================================================================
-- Bhavani Homemade Spices — Initial Database Seed Data
-- Seed 001_initial_data.sql
-- ============================================================================

-- Seed Categories
INSERT INTO categories (id, name, slug, description) VALUES
('blends', 'Signature Blends', 'signature-blends', 'Handcrafted regional spice blends milled fresh using traditional recipes.'),
('singles', 'Single Origin Spices', 'single-origin-spices', 'Pure, single-estate spices sourced directly from partner farms in India.')
ON CONFLICT (id) DO NOTHING;

-- Seed Products
INSERT INTO products (id, name, slug, category_id, description, price, mrp, rating, reviews_count, badge, image, stock_status, ingredients, origin) VALUES
(
    'garam-masala',
    'Royal Garam Masala',
    'royal-garam-masala',
    'blends',
    'An aromatic, handcrafted blend of 13 whole spices roasted in small batches. Adds rich depth and warming fragrance to curries, biryanis, and gravies.',
    280.00,
    320.00,
    4.9,
    128,
    'Bestseller',
    'assets/garam_masala.jpg',
    'in-stock',
    'Coriander, Cumin, Green Cardamom, Black Pepper, Cinnamon, Cloves, Star Anise, Bay Leaf, Nutmeg, Mace, Black Cardamom',
    'Maharashtra, India'
),
(
    'kashmiri-chili',
    'Kashmiri Red Chili Powder',
    'kashmiri-red-chili-powder',
    'singles',
    'Vibrant crimson chili powder ground from hand-picked Kashmiri chilies. Delivers an iconic rich color with mild, pleasant heat.',
    195.00,
    220.00,
    4.8,
    94,
    'Vibrant Color',
    'assets/kashmiri_chili.jpg',
    'in-stock',
    '100% Pure Sun-Dried Kashmiri Chilies',
    'Kashmir, India'
),
(
    'turmeric-powder',
    'Organic Wild Turmeric Powder',
    'organic-wild-turmeric-powder',
    'singles',
    'High-curcumin golden turmeric powder sun-dried and finely ground. Earthy flavor profile ideal for daily cooking and traditional golden milk.',
    160.00,
    185.00,
    5.0,
    215,
    'High Curcumin',
    'assets/turmeric_powder.jpg',
    'in-stock',
    '100% Pure Organic Turmeric Root',
    'Sangli, Maharashtra'
),
(
    'green-cardamom',
    'Idukki Green Cardamom (8mm)',
    'idukki-green-cardamom-8mm',
    'singles',
    'Jumbo 8mm green cardamom pods hand-harvested from the hills of Idukki. Intensely sweet aroma and essential oil richness.',
    420.00,
    480.00,
    4.9,
    76,
    'Premium Pods',
    'assets/green_cardamom.jpg',
    'in-stock',
    '100% Whole Green Cardamom Pods',
    'Idukki, Kerala'
)
ON CONFLICT (id) DO NOTHING;

-- Seed Initial Inventory
INSERT INTO inventory (product_id, available_quantity, reserved_quantity, low_stock_threshold) VALUES
('garam-masala', 150, 0, 15),
('kashmiri-chili', 120, 0, 15),
('turmeric-powder', 200, 0, 20),
('green-cardamom', 80, 0, 10)
ON CONFLICT (product_id) DO NOTHING;
