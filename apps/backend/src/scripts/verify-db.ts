import mysql from 'mysql2/promise';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

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
                if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
                if (!process.env[key]) process.env[key] = value.trim();
            }
        }
    } catch (error) { }
}

async function verify() {
    await loadEnv();
    const config = {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306'),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'maximus_telecom',
    };

    try {
        const connection = await mysql.createConnection(config);
        console.log(`Connected to database: ${config.database}`);

        // Check for new columns in orders
        console.log('\n--- Checking Orders Table Schema ---');
        const [columns]: any = await connection.query('SHOW COLUMNS FROM orders');
        const columnNames = columns.map((c: any) => c.Field);

        const neededColumns = [
            { name: 'payment_status', type: "ENUM('unpaid', 'paid', 'refunded') DEFAULT 'unpaid'" },
            { name: 'tracking_number', type: "VARCHAR(100) DEFAULT NULL" },
            { name: 'carrier', type: "VARCHAR(50) DEFAULT NULL" },
            { name: 'estimated_delivery', type: "DATETIME DEFAULT NULL" }
        ];

        for (const col of neededColumns) {
            if (!columnNames.includes(col.name)) {
                console.log(`Adding column ${col.name}...`);
                await connection.query(`ALTER TABLE orders ADD COLUMN ${col.name} ${col.type}`);
            } else {
                console.log(`Column ${col.name} already exists.`);
            }
        }

        const tables = ['category', 'admin', 'customer', 'article', 'orders', 'order_details'];

        console.log('\n--- Table Counts ---');
        for (const table of tables) {
            const [rows]: any = await connection.query(`SELECT COUNT(*) as count FROM \`${table}\``);
            console.log(`${table.padEnd(15)}: ${rows[0].count} records`);
        }

        await connection.end();
    } catch (error: any) {
        console.error('Error verifying database:', error.message);
    }
}

verify();
