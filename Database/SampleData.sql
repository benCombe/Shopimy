INSERT INTO Stores (owner, name)
VALUES 
(10000001, 'Tech Haven'),
(10000002, 'Fashion Boutique'),
(10000003, 'Gourmet Delights');


INSERT INTO StoreThemes (store_id, theme_colour1, theme_colour2, theme_colour3, font_colour, font_family)
VALUES 
(10000001, '#1E90FF', '#87CEFA', '#ADD8E6', '#000000', 'Arial'),
(10000002, '#FF69B4', '#FFB6C1', '#FFC0CB', '#333333', 'Helvetica'),
(10000003, '#32CD32', '#98FB98', '#00FF7F', '#222222', 'Verdana');


INSERT INTO Categories (store_id, name, parent_category)
VALUES 
(10000001, 'Electronics', NULL),
(10000002, 'Womens Fashion', NULL),
(10000003, 'Gourmet Food', NULL);


-- Subcategories under "Electronics"
INSERT INTO Categories (store_id, name, parent_category)
VALUES 
(10000001, 'Laptops', (SELECT category_id FROM Categories WHERE name = 'Electronics' AND store_id = 10000001)),
(10000001, 'Smartphones', (SELECT category_id FROM Categories WHERE name = 'Electronics' AND store_id = 10000001));

-- Subcategories under "Women’s Fashion"
INSERT INTO Categories (store_id, name, parent_category)
VALUES 
(10000002, 'Dresses', (SELECT category_id FROM Categories WHERE name = 'Womens Fashion' AND store_id = 10000002)),
(10000002, 'Handbags', (SELECT category_id FROM Categories WHERE name = 'Womens Fashion' AND store_id = 10000002));

-- Subcategories under "Gourmet Food"
INSERT INTO Categories (store_id, name, parent_category)
VALUES 
(10000003, 'Chocolates', (SELECT category_id FROM Categories WHERE name = 'Gourmet Food' AND store_id = 10000003)),
(10000003, 'Cheeses', (SELECT category_id FROM Categories WHERE name = 'Gourmet Food' AND store_id = 10000003));


-- Fooba's Store
INSERT INTO StoreThemes (store_id, theme_colour1, theme_colour2, theme_colour3, font_colour, font_family, banner_text, logo_text)
VALUES (10000005, '#0f5e16', '#88aa99', '#cafadb', '#f4f4d3', 'Franklin Gothic Medium, Arial Narrow', 'The Best The Wasteland has to Offer!', 'We Got Weapons, Armour, and Chems!');


INSERT INTO Categories (store_id, name, parent_category)
VALUES
(10000005, 'Weapons', NULL),
(10000005, 'Armour', NULL),
(10000005, 'Chems', NULL);


INSERT INTO Listing (store_id, name, description, category)
VALUES
(10000005, 'Combat Rifle', '5.56mm Caliber Rifle' 13),
(10000005, 'Laser Gun', 'Uses fusion cell ammunition, hand pistol', 13),
(10000005, 'Plasma Gun', 'Uses plasma cartridges, hand pistol', 13),
(10000005, 'Raider Armour Set', 'Includes chest piece, left/right arms and legs', 18),
(10000005, 'Leather Boots', 'quality radroach leather', 17),
(10000005, 'Batting Helmet', 'Home Run!', 16),
(10000005, 'Buffout', 'Highly advanced steroids that increase strength, reflexes, and endurance', 19),
(10000005, 'Jet', 'Stimulates the central nervous system, triggering a rush of energy and strength', 19),
(10000005, 'Psycho', 'Increase in damage resistance and dampening of higher brain functions', 19),
(10000005, 'RadAway', 'Relieves radiation poisoning', 20),
(10000005, 'Stimpak', 'Get some health back!', 20),
(10000005, 'Mentats', 'Increases memory-related functions, and speeds other mental processes.', 21),
(10000005, 'Frag Mine', 'Instant death', 15),
(10000005, 'Cryo Mine', 'Freezes target', 15),
(10000005, 'World Series Baseball Bat', 'Knock em out of the park!', 14),
(10000005, 'Police Baton', 'Perfect for close-quater bashing', 14);