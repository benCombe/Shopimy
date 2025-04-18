CREATE TABLE Users (
    id INT IDENTITY(10000001,1) PRIMARY KEY,
    first_name NVARCHAR(50) NOT NULL,
    last_name NVARCHAR(50) NOT NULL,
    email NVARCHAR(100) UNIQUE NOT NULL,
    phone NVARCHAR(20) NOT NULL,
    address NVARCHAR(255) NOT NULL,
    country NVARCHAR(50) NOT NULL,
    dob DATE NOT NULL,
    password NVARCHAR(255) NOT NULL,
    verified BIT NOT NULL DEFAULT 0,
    subscribed BIT NOT NULL DEFAULT 0
);

CREATE TABLE ActiveUsers (
    user_id INT NOT NULL,
    login_date DATETIME2 DEFAULT SYSUTCDATETIME(),
    token NVARCHAR(MAX) NOT NULL,
    PRIMARY KEY (user_id),
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

CREATE TABLE Stores (
    store_id INT IDENTITY(10000001,1) PRIMARY KEY,
    owner INT NOT NULL,
    name NVARCHAR(100) UNIQUE NOT NULL,
    store_url varchar(100) UNIQUE NOT NULL,
    FOREIGN KEY (owner) REFERENCES Users(id) ON DELETE CASCADE
);

CREATE TABLE StoreThemes (
    store_id INT NOT NULL PRIMARY KEY,
    theme_colour1 NVARCHAR(7) NOT NULL,
    theme_colour2 NVARCHAR(7) NOT NULL,
    theme_colour3 NVARCHAR(7) NOT NULL,
    font_colour NVARCHAR(7) NOT NULL,
    font_family VARCHAR(200) NOT NULL,
    banner_text varchar(50),
    logo_text varchar(50),
    FOREIGN KEY (store_id) REFERENCES Stores(store_id) ON DELETE CASCADE
);

CREATE TABLE StoreBanners (
    store_id INT NOT NULL,
    banner_url VARCHAR(200) NOT NULL,
    FOREIGN KEY (store_id) REFERENCES Stores(store_id) ON DELETE CASCADE,
);

CREATE TABLE StoreLogos (
    store_id INT NOT NULL,
    logo_url VARCHAR(200) NOT NULL,
    FOREIGN KEY (store_id) REFERENCES Stores(store_id) ON DELETE CASCADE,
);


CREATE TABLE Categories (
    category_id INT IDENTITY(1,1) PRIMARY KEY,
    store_id INT NOT NULL,
    name NVARCHAR(100) NOT NULL,
    parent_category INT NULL,
    FOREIGN KEY (store_id) REFERENCES Stores(store_id) ON DELETE CASCADE,
    FOREIGN KEY (parent_category) REFERENCES Categories(category_id) ON DELETE NO ACTION,
    CONSTRAINT UQ_Categories UNIQUE (store_id, name)
);

CREATE TABLE ShoppingCarts (
	cart_id INT IDENTITY(1,1) PRIMARY KEY,
	store_id INT NOT NULL,
	user_id INT NOT NULL,
	item_id INT NOT NULL,
	quantity INT NOT NULL CHECK (quantity > 0),
	FOREIGN KEY (store_id) REFERENCES Stores(store_id) ON DELETE NO ACTION,
	FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE NO ACTION,
	FOREIGN KEY (item_id) REFERENCES Items(item_id) ON DELETE NO ACTION
);


CREATE VIEW ItemsView AS
    SELECT
    l.list_id,
    i.item_id,
    l.store_id,
    l.category,
    l.name,
    i.price,
    i.sale_price,
    i.quantity,
    l.description,
    i.type,
    i.size,
    i.colour,
    l.availFrom,
    l.availTo,
    img.blob
FROM Items AS i
JOIN Listing AS l ON l.list_id = i.list_id
JOIN ItemImages AS img ON img.blob = i.item_id;

CREATE table Listing(
    list_id int not null Identity(1,1) Primary key,
    store_id int not null,
    name NVARCHAR(100)  NOT NULL,
    description NVARCHAR(200) not null,
    category Int not null,
    availFrom datetime null, 
    availTo datetime null,
    currentRating int default 0,
    quatity int default 0,
    FOREIGN KEY (store_id) REFERENCES Stores(store_id) ON DELETE CASCADE,
    FOREIGN KEY (category) REFERENCES Categories(category_id) ON DELETE no action
    );

CREATE table Items(
    item_id int not null Identity(1,1) Primary key,
    list_id int not null,
    price decimal(10,2) not null,
    sale_price decimal(10,2) not null,
    type nvarchar(100) null,
    size nvarchar(10) null,
    colour nvarchar(10) null,
    quantity int not null,
    FOREIGN KEY (list_id) REFERENCES Listing(list_id) ON DELETE CASCADE
);

create table ItemImages(
	store_id INT NOT NULL,
	user_id INT NOT NULL,
	item_id INT NOT NULL,
	item_index int NOT NULL default 0,
	blob varchar(200) NOT NULL,
	FOREIGN KEY (store_id) REFERENCES Stores(store_id) ON DELETE NO ACTION,
	FOREIGN KEY (item_id) REFERENCES Items(item_id) ON DELETE NO ACTION
);


CREATE TABLE OrderLog (
	order_id INT IDENTITY(1,1) PRIMARY KEY,
	store_id INT,
	purchaser_id INT,
	purchaser_email NVARCHAR(100) NOT NULL,
	delivery_address NVARCHAR(255) NOT NULL,
	stripe_token NVARCHAR(255),
	order_date DATETIME NOT NULL,
	order_status NVARCHAR(50),
	FOREIGN KEY (store_id) REFERENCES Stores(store_id)
);

CREATE TABLE OrderItems (
	order_id INT,
	item_id INT,
	quantity INT,
	FOREIGN KEY (order_id) REFERENCES OrderLog(order_id), 
	FOREIGN KEY (item_id) REFERENCES Items(item_id),
	PRIMARY KEY (order_id, item_id)

CREATE TABLE Orders (
    order_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    store_id INT NOT NULL,
    order_date DATETIME2 DEFAULT SYSUTCDATETIME(),
    total_amount DECIMAL(10,2) NOT NULL,
    status NVARCHAR(50) NOT NULL DEFAULT 'Pending', -- 'Pending', 'Paid', 'Failed', 'Processing', 'Shipped', 'Cancelled' (Increased size for status)
    stripe_session_id NVARCHAR(255) NULL, -- Added Stripe Session ID
    shipping_address NVARCHAR(255) NULL,
    shipping_city NVARCHAR(100) NULL,
    shipping_state NVARCHAR(100) NULL,
    shipping_postal_code NVARCHAR(20) NULL,
    shipping_country NVARCHAR(100) NULL,
    payment_method NVARCHAR(50) NULL,
    payment_transaction_id NVARCHAR(100) NULL,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE NO ACTION,
    FOREIGN KEY (store_id) REFERENCES Stores(store_id) ON DELETE NO ACTION
);

CREATE TABLE OrderItems (
    order_item_id INT IDENTITY(1,1) PRIMARY KEY,
    order_id INT NOT NULL,
    item_id INT NOT NULL, -- Renamed from product_id if needed, matches OrderItem model
    product_name NVARCHAR(255) NOT NULL, -- Added ProductName
    quantity INT NOT NULL,
    price_paid DECIMAL(10,2) NOT NULL, -- Renamed from unit_price if needed, matches OrderItem model
    FOREIGN KEY (order_id) REFERENCES Orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES Items(item_id) ON DELETE NO ACTION -- Assuming item_id refers to Items table PK
);