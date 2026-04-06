import mysql from 'mysql2/promise';

let pool: mysql.Pool | null = null;

export function getPool(): mysql.Pool {
    if (!pool) {
        pool = mysql.createPool({
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '3306'),
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'meme_shop',
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });
    }
    return pool;
}

export async function testConnection(): Promise<{ success: boolean; message: string }> {
    try {
        const connection = await getPool().getConnection();
        await connection.ping();
        connection.release();
        return { success: true, message: 'Database connection successful' };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return { success: false, message: `Database connection failed: ${errorMessage}` };
    }
}

const poolProxy = new Proxy({} as mysql.Pool, {
    get(_target, prop) {
        return getPool()[prop as keyof mysql.Pool];
    }
});

export default poolProxy;
