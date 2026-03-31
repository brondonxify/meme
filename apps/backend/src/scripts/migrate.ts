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

async function migrate() {
    console.log('Starting migration...');
    await loadEnv();

    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '3306'),
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'maximus_telecom', // Default to env or known name
            multipleStatements: true
        })

        console.log('Connected to database.');

        // Path to the migrations folder
        const migrationsDir = path.join(__dirname, '../db/migrations');
        const files = (await fs.readdir(migrationsDir)).filter(f => f.endsWith('.sql')).sort();

        console.log(`Found ${files.length} migration files.`);

        for (const file of files) {
            const filePath = path.join(migrationsDir, file);
            console.log(`Executing migration: ${file}`);
            const sql = await fs.readFile(filePath, 'utf8');
            await connection.query(sql);
        }

        console.log('All migrations completed successfully.');
        await connection.end();
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
