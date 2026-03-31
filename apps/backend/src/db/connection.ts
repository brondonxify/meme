import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
function loadEnv() {
    try {
        const envPath = path.resolve(__dirname, '../../.env');
        if (fs.existsSync(envPath)) {
            const content = fs.readFileSync(envPath, 'utf8');
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
        }
    } catch (error) {
        console.warn('Could not load .env file in connection.ts:', error);
    }
}

// Load environment variables before creating the pool
loadEnv();

// Log database configuration for debugging
console.log('[DB] Creating connection pool with config:');
console.log(`  - Host: ${process.env.DB_HOST || 'not set'}`);
console.log(`  - Port: ${process.env.DB_PORT || 'not set'}`);
console.log(`  - Database: ${process.env.DB_NAME || 'not set'}`);
console.log(`  - User: ${process.env.DB_USER || 'not set'}`);

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'maximus_telecom',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export async function testConnection(): Promise<{ success: boolean; message: string }> {
    try {
        const connection = await pool.getConnection();
        await connection.ping();
        connection.release();
        return { success: true, message: 'Database connection successful' };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return { success: false, message: `Database connection failed: ${errorMessage}` };
    }
}

export default pool;
