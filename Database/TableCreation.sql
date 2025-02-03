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
    token NVARCHAR(255) NOT NULL,
    PRIMARY KEY (user_id),
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

CREATE TABLE Stores (
    store_id INT IDENTITY(10000001,1) PRIMARY KEY,
    owner INT NOT NULL,
    name NVARCHAR(100) UNIQUE NOT NULL,
    FOREIGN KEY (owner) REFERENCES Users(id) ON DELETE CASCADE
);

CREATE TABLE StoreThemes (
    store_id INT NOT NULL PRIMARY KEY,
    theme_colour1 NVARCHAR(7) NOT NULL,
    theme_colour2 NVARCHAR(7) NOT NULL,
    theme_colour3 NVARCHAR(7) NOT NULL,
    font_colour NVARCHAR(7) NOT NULL,
    font_family NVARCHAR(50) NOT NULL,
    FOREIGN KEY (store_id) REFERENCES Stores(store_id) ON DELETE CASCADE
);

CREATE TABLE StoreFiles (
    file_id INT IDENTITY(1,1) PRIMARY KEY,
    store_id INT NOT NULL,
    banner VARBINARY(MAX) NULL,
    logo VARBINARY(MAX) NULL,
    FOREIGN KEY (store_id) REFERENCES Stores(store_id) ON DELETE CASCADE,
    CONSTRAINT UQ_StoreFiles UNIQUE (store_id, file_id)
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



