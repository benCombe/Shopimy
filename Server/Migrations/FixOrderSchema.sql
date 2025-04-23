-- Add missing columns to Orders table
ALTER TABLE Orders
ADD order_id INT,
    user_id INT,
    store_id INT,
    order_date DATETIME,
    shipping_address NVARCHAR(MAX),
    payment_method NVARCHAR(MAX);

-- Copy data from existing columns to new columns
UPDATE Orders
SET order_id = Id,
    user_id = UserId,
    store_id = StoreId,
    order_date = CreatedAt;

-- Fix OrderItems table if needed
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('OrderItems') AND name = 'order_id')
BEGIN
    ALTER TABLE OrderItems
    ADD order_id INT;
    
    UPDATE OrderItems
    SET order_id = OrderId;
END

-- Optional: Add any other missing tables or columns referenced in the controller
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'ItemImages')
BEGIN
    CREATE TABLE ItemImages (
        id INT IDENTITY(1,1) PRIMARY KEY,
        item_id INT,
        item_index INT,
        blob NVARCHAR(MAX)
    );
END 