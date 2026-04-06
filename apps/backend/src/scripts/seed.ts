import mysql from 'mysql2/promise';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
                if (value.startsWith('"') && value.endsWith('"')) {
                    value = value.slice(1, -1);
                }
                if (!process.env[key]) {
                    process.env[key] = value.trim();
                }
            }
        }
    } catch {
        // env vars already set
    }
}

function slugify(text: string): string {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function generateSKU(name: string, index: number): string {
    const prefix = name.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'X');
    return `${prefix}-${String(index).padStart(4, '0')}`;
}

function generateInvoiceNo(date: Date, index: number): string {
    const yyyymmdd = date.toISOString().slice(0, 10).replace(/-/g, '');
    return `INV-${yyyymmdd}-${String(index).padStart(4, '0')}`;
}

async function seed() {
    console.log('Starting HI-TECH database seeding...');
    await loadEnv();

    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306'),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'new',
        multipleStatements: true
    });

    console.log('Connected to database.');

    try {
        // Drop all tables in reverse dependency order
        console.log('Cleaning database...');
        await connection.query(`
            SET FOREIGN_KEY_CHECKS = 0;
            DROP TABLE IF EXISTS payments;
            DROP TABLE IF EXISTS contact_messages;
            DROP TABLE IF EXISTS article_specification;
            DROP TABLE IF EXISTS specification;
            DROP TABLE IF EXISTS inventory_log;
            DROP TABLE IF EXISTS notification;
            DROP TABLE IF EXISTS order_details;
            DROP TABLE IF EXISTS orders;
            DROP TABLE IF EXISTS article;
            DROP TABLE IF EXISTS category;
            DROP TABLE IF EXISTS coupon;
            DROP TABLE IF EXISTS staff;
            DROP TABLE IF EXISTS staff_roles;
            DROP TABLE IF EXISTS customer;
            DROP TABLE IF EXISTS admin;
            SET FOREIGN_KEY_CHECKS = 1;
        `);

        // Run schema migration
        const schemaPath = path.join(__dirname, '../db/migrations/001_full_schema.sql');
        const schemaSql = await fs.readFile(schemaPath, 'utf8');
        await connection.query(schemaSql);

        const adminPassword = await bcrypt.hash('admin123', 10);
        const customerPassword = await bcrypt.hash('password123', 10);

        // 1. Admin
        await connection.query(
            'INSERT INTO admin (username, email, password, role) VALUES (?, ?, ?, ?)',
            ['admin', 'admin@meme.com', adminPassword, 'super_admin']
        );

        // 2. Categories
        console.log('Seeding HI-TECH Categories...');
        const categories = [
            { name: 'Laptops', desc: 'Powerful portable stations for work and gaming' },
            { name: 'Computers', desc: 'Desktop PCs, Workstations, and Servers' },
            { name: 'Accessories', desc: 'High-quality peripherals for your setup' },
            { name: 'Networking', desc: 'Secure and fast networking solutions' },
            { name: 'Smart Devices', desc: 'Connected home and office tech' }
        ];
        for (const cat of categories) {
            await connection.query(
                'INSERT INTO category (name, slug, description, published) VALUES (?, ?, ?, true)',
                [cat.name, slugify(cat.name), cat.desc]
            );
        }

        // 3. Products
        console.log('Seeding HI-TECH Products...');
        const products = [
            // Laptops (Cat 1)
            { name: 'MacBook Pro M3 Max 16"', cat: 1, cost: 2500000, sell: 3200000, stock: 10, img: '/products/1.jpg' },
            { name: 'Dell XPS 15 9530', cat: 1, cost: 1200000, sell: 1550000, stock: 15, img: '/products/2.jpg' },
            { name: 'HP Spectre x360', cat: 1, cost: 850000, sell: 1050000, stock: 12, img: '/products/3.jpg' },
            
            // Computers (Cat 2)
            { name: 'iMac 24" M3 Blue', cat: 2, cost: 950000, sell: 1250000, stock: 8, img: '/products/4.jpg' },
            { name: 'Custom Gaming Rig RTX 4080', cat: 2, cost: 1800000, sell: 2450000, stock: 5, img: '/products/5.jpg' },
            
            // Accessories (Cat 3)
            { name: 'Keychron K2 Mechanical Keyboard', cat: 3, cost: 65000, sell: 95000, stock: 30, img: '/products/6.jpg' },
            { name: 'Logitech MX Master 3S', cat: 3, cost: 60000, sell: 85000, stock: 45, img: '/products/7.jpg' },
            { name: 'ASUS ROG Swift 27" 4K', cat: 3, cost: 350000, sell: 495000, stock: 10, img: '/products/8.jpg' },
            
            // Networking (Cat 4)
            { name: 'TP-Link Archer AX6000', cat: 4, cost: 180000, sell: 245000, stock: 20, img: '/products/9.jpg' },
            { name: 'Ubiquiti Dream Machine Pro', cat: 4, cost: 450000, sell: 595000, stock: 6, img: '/products/10.jpg' },
            
            // Smart Devices (Cat 5)
            { name: 'Echo Show 15', cat: 5, cost: 180000, sell: 235000, stock: 15, img: '/products/11.jpg' },
            { name: 'Philips Hue Starter Kit', cat: 5, cost: 120000, sell: 165000, stock: 25, img: '/products/12.jpg' }
        ];

        for (let i = 0; i < products.length; i++) {
            const p = products[i];
            await connection.query(
                `INSERT INTO article (name, slug, sku, description, category_id, image_url, cost_price, selling_price, stock, min_stock_threshold, published)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 5, true)`,
                [p.name, slugify(p.name), generateSKU(p.name, i + 1), `${p.name} - High-End performance for modern professionals. Available at HI-TECH.`, p.cat, p.img, p.cost, p.sell, p.stock]
            );
        }

        // 4. Coupons
        await connection.query(`
            INSERT INTO coupon (campaign_name, code, discount_type, discount_value, start_date, end_date, published) VALUES
            ('Flash Modernization', 'HITECH24', 'percentage', 15.00, '2026-04-01 00:00:00', '2026-12-31 23:59:59', true),
            ('New Customer', 'WELCOME_XAF', 'fixed', 25000.00, '2026-01-01 00:00:00', '2026-12-31 23:59:59', true),
            ('Tech Anniversary', 'ANNIVERSARY_FIXED', 'fixed', 50000.00, '2026-04-01 00:00:00', '2026-05-31 23:59:59', true)
        `);

        // 5. Customers
        await connection.query(
            `INSERT INTO customer (first_name, last_name, email, password, phone, address, city, postal_code) VALUES
            ('Marcel', 'Ngoubou', 'marcel.ngoubou@email.cm', ?, '+237612345678', 'Rue de la Paix, Bonanjo', 'Douala', 'BP 1234'),
            ('Christelle', 'Tchamba', 'christelle.tchamba@email.cm', ?, '+237677890123', 'Avenue Kennedy, Akwa', 'Douala', 'BP 5678')`,
            [customerPassword, customerPassword]
        );

        console.log('\nHI-TECH Database seeded successfully!');

    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    } finally {
        await connection.end();
    }
}

seed();
