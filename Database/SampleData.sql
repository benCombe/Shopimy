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
