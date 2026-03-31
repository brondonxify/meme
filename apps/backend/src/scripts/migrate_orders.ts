import pool from '../db/connection.js';

async function migrate() {
    console.log('🚀 Starting Database Migration: Add Payment and Tracking fields...');

    try {
        // 1. Add payment_status
        await pool.query(`
            ALTER TABLE orders 
            ADD COLUMN payment_status ENUM('unpaid', 'paid', 'refunded', 'failed') DEFAULT 'unpaid' 
            AFTER status
        `);
        console.log('✅ Added payment_status to orders table');

        // 2. Add tracking_number
        await pool.query(`
            ALTER TABLE orders 
            ADD COLUMN tracking_number VARCHAR(255) NULL 
            AFTER total_amount
        `);
        console.log('✅ Added tracking_number to orders table');

        // 3. Add estimated_delivery
        await pool.query(`
            ALTER TABLE orders 
            ADD COLUMN estimated_delivery TIMESTAMP NULL 
            AFTER tracking_number
        `);
        console.log('✅ Added estimated_delivery to orders table');

        console.log('🎉 Migration completed successfully!');
    } catch (error: any) {
        if (error.code === 'ER_DUP_COLUMN_NAME') {
            console.log('⚠️ Migration already applied (columns already exist).');
        } else {
            console.error('❌ Migration failed:', error.message);
        }
    } finally {
        process.exit();
    }
}

migrate();
