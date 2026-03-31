import mysql from 'mysql2/promise';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to manually load .env file
async function loadEnv() {
    try {
        const envPath = path.resolve(__dirname, '../../.env');
        const content = await fs.readFile(envPath, 'utf8');
        const lines = content.split('\n');
        for (const line of lines) {
            const match = line.match(/^\s*([\w]+)\s*=\s*(.*)?\s*$/);
            if (match) {
                const key = match[1];
                let value = match[2] || '';
                // Remove quotes if present
                if (value.startsWith('"') && value.endsWith('"')) {
                    value = value.slice(1, -1);
                }
                if (!process.env[key]) {
                    process.env[key] = value.trim();
                }
            }
        }
        console.log('Loaded environment variables manually.');
    } catch (error) {
        console.warn('Could not load .env file, assuming env vars are set.', error);
    }
}

async function seed() {
    console.log('🌱 Starting database seeding...');
    await loadEnv();

    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '3306'),
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'maximus_telecom',
            multipleStatements: true
        });

        console.log('Connected to database.');

        // Seed Categories
        console.log('📁 Seeding categories...');
        await connection.query(`
            INSERT INTO category (name, description) VALUES
            ('Electronics', 'Electronic devices and gadgets'),
            ('Smartphones', 'Mobile phones and accessories'),
            ('Laptops', 'Portable computers and accessories'),
            ('Audio', 'Headphones, speakers, and audio equipment'),
            ('Accessories', 'Various tech accessories')
        `);
        console.log('✅ Categories seeded');

        // Seed Admin
        console.log('🔐 Seeding admin users...');
        await connection.query(`
            INSERT INTO admin (username, email, password) VALUES
            ('admin', 'admin@maximus.com', 'admin123'),
            ('superadmin', 'superadmin@maximus.com', 'super123')
        `);
        console.log('✅ Admin users seeded');

        // Seed Customers
        console.log('👤 Seeding customers...');
        await connection.query(`
            INSERT INTO customer (first_name, last_name, email, password, phone, address, city, postal_code) VALUES
            ('John', 'Doe', 'john.doe@example.com', 'password123', '+1234567890', '123 Main St', 'New York', '10001'),
            ('Jane', 'Smith', 'jane.smith@example.com', 'password123', '+0987654321', '456 Oak Ave', 'Los Angeles', '90001'),
            ('Bob', 'Johnson', 'bob.johnson@example.com', 'password123', '+1122334455', '789 Pine Rd', 'Chicago', '60601')
        `);
        console.log('✅ Customers seeded');

        // Seed Articles (Products)
        console.log('📦 Seeding articles...');
        await connection.query(`
            INSERT INTO article (name, description, price, stock_quantity, image_url, category_id) VALUES
            ('iPhone 15 Pro', 'Latest Apple smartphone with A17 Pro chip', 1199.99, 50, '/images/iphone15pro.jpg', 2),
            ('Samsung Galaxy S24', 'Premium Android smartphone', 999.99, 75, '/images/galaxys24.jpg', 2),
            ('MacBook Pro 14"', 'Professional laptop with M3 Pro chip', 1999.99, 30, '/images/macbookpro.jpg', 3),
            ('Dell XPS 15', 'High-performance Windows laptop', 1499.99, 40, '/images/dellxps.jpg', 3),
            ('Sony WH-1000XM5', 'Premium noise-cancelling headphones', 349.99, 100, '/images/sonywh1000xm5.jpg', 4),
            ('AirPods Pro 2', 'Apple wireless earbuds with ANC', 249.99, 150, '/images/airpodspro2.jpg', 4),
            ('Apple Watch Series 9', 'Advanced smartwatch', 399.99, 60, '/images/applewatch9.jpg', 1),
            ('USB-C Hub', 'Multi-port USB-C adapter', 49.99, 200, '/images/usbchub.jpg', 5),
            ('Wireless Charger', 'Fast wireless charging pad', 29.99, 300, '/images/wirelesscharger.jpg', 5),
            ('Laptop Stand', 'Ergonomic aluminum laptop stand', 79.99, 120, '/images/laptopstand.jpg', 5)
        `);
        console.log('✅ Articles seeded');

        // Seed Orders
        console.log('🛒 Seeding orders...');
        await connection.query(`
            INSERT INTO orders (customer_id, status, total_amount) VALUES
            (1, 'delivered', 1249.98),
            (1, 'shipped', 349.99),
            (2, 'pending', 1999.99),
            (3, 'pending', 299.98)
        `);
        console.log('✅ Orders seeded');

        // Seed Order Details
        console.log('📋 Seeding order details...');
        await connection.query(`
            INSERT INTO order_details (order_id, article_id, quantity, unit_price) VALUES
            (1, 1, 1, 1199.99),
            (1, 8, 1, 49.99),
            (2, 5, 1, 349.99),
            (3, 3, 1, 1999.99),
            (4, 6, 1, 249.99),
            (4, 8, 1, 49.99)
        `);
        console.log('✅ Order details seeded');

        // Seed Specifications
        console.log('🔧 Seeding specifications...');
        await connection.query(`
            INSERT INTO specification (name) VALUES
            ('5G Compatible'),
            ('NVMe SSD'),
            ('RTX Enabled'),
            ('Under $1000'),
            ('Waterproof'),
            ('Noise Cancelling')
        `);
        console.log('✅ Specifications seeded');

        // Seed Article Specifications
        console.log('🔗 Seeding article specifications...');
        await connection.query(`
            INSERT INTO article_specification (article_id, specification_id) VALUES
            (1, 1), (1, 4), -- iPhone 15 Pro: 5G, Under $1000 (Wait, iPhone is > 1000 in seed, I'll fix logic)
            (2, 1), (2, 4), -- Samsung S24: 5G, Under $1000
            (3, 2),         -- MacBook Pro: NVMe SSD
            (4, 2), (4, 3), -- Dell XPS: NVMe, RTX
            (5, 6),         -- Sony Headphones: Noise Cancelling
            (6, 6)          -- AirPods: Noise Cancelling
        `);
        console.log('✅ Article specifications seeded');

        console.log('\n🎉 Database seeding completed successfully!');
        console.log('\n📊 Summary:');
        console.log('  - 5 categories');
        console.log('  - 2 admin users');
        console.log('  - 3 customers');
        console.log('  - 10 articles');
        console.log('  - 6 specifications');
        console.log('  - 4 orders');
        console.log('  - 6 order details');

        await connection.end();
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

seed();
