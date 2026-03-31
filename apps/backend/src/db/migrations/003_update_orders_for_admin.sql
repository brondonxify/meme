-- Add administrative columns to orders table
ALTER TABLE orders 
ADD COLUMN payment_status ENUM('unpaid', 'paid', 'refunded') DEFAULT 'unpaid',
ADD COLUMN tracking_number VARCHAR(100) DEFAULT NULL,
ADD COLUMN carrier VARCHAR(50) DEFAULT NULL,
ADD COLUMN estimated_delivery DATETIME DEFAULT NULL;

-- Update existing orders to have 'paid' status for demo purposes
UPDATE orders SET payment_status = 'paid' WHERE status IN ('shipped', 'delivered');
