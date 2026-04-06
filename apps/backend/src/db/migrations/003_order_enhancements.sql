-- Add cancellation and tracking columns to orders table
ALTER TABLE orders ADD COLUMN cancellation_reason VARCHAR(255) DEFAULT NULL;
ALTER TABLE orders ADD COLUMN cancellation_note TEXT DEFAULT NULL;
ALTER TABLE orders ADD COLUMN cancelled_at TIMESTAMP NULL DEFAULT NULL;
ALTER TABLE orders ADD COLUMN tracking_number VARCHAR(100) DEFAULT NULL;
ALTER TABLE orders ADD COLUMN carrier VARCHAR(100) DEFAULT NULL;
ALTER TABLE orders ADD COLUMN estimated_delivery DATE DEFAULT NULL;
ALTER TABLE orders MODIFY COLUMN status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending';
ALTER TABLE orders MODIFY COLUMN payment_status ENUM('unpaid', 'paid', 'refunded', 'failed') DEFAULT 'unpaid';
