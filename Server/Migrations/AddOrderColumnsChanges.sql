-- Add missing columns to the Orders table
ALTER TABLE Orders
ADD user_id INT,
    store_id INT,
    order_date DATETIME DEFAULT GETDATE(),
    shipping_address NVARCHAR(MAX),
    payment_method NVARCHAR(MAX);

-- Update column names if needed
EXEC sp_rename 'Orders.Id', 'order_id', 'COLUMN';

-- Set foreign key relationships
ALTER TABLE Orders
ADD CONSTRAINT FK_Orders_Users
FOREIGN KEY (user_id) REFERENCES Users(id);

-- Move existing data to proper columns
UPDATE Orders
SET user_id = UserId,
    store_id = StoreId,
    order_date = CreatedAt; 