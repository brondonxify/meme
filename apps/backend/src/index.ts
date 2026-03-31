import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import { createFolderRoute } from 'hono-file-router';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { testConnection } from './db/connection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
function loadEnv() {
  try {
    const envPath = path.resolve(__dirname, '../.env');
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
      console.log('✅ Environment variables loaded from .env');
    } else {
      console.log('⚠️ No .env file found, using system environment variables');
    }
  } catch (error) {
    console.warn('⚠️ Could not load .env file:', error);
  }
}

// Load environment variables first
loadEnv();

const app = new Hono();

// Add request logging middleware
app.use('*', logger());

// Add CORS middleware
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Length', 'X-Kuma-Revision'],
  maxAge: 600,
  credentials: true,
}));

// Set up file-based routing
// Use relative path from working directory (apps/backend/)
const routes = await createFolderRoute({ path: './src/routes' });
console.log('[DEBUG] Routes registered successfully');
app.route('/', routes);

// Health check endpoint
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const port = parseInt(process.env.PORT || '3001');

// Test database connection on startup
async function startServer() {
  console.log('\n🚀 Starting E-Commerce API Server...');
  console.log('═'.repeat(50));

  // Test database connection
  console.log('\n📊 Testing database connection...');
  const dbResult = await testConnection();
  if (dbResult.success) {
    console.log(`✅ ${dbResult.message}`);
  } else {
    console.log(`❌ ${dbResult.message}`);
    console.log('⚠️ Server will start but database operations will fail');
  }

  // Log environment info
  console.log('\n📋 Configuration:');
  console.log(`  - Port: ${port}`);
  console.log(`  - DB Host: ${process.env.DB_HOST || 'not set'}`);
  console.log(`  - DB Name: ${process.env.DB_NAME || 'not set'}`);
  console.log(`  - DB User: ${process.env.DB_USER || 'not set'}`);

  console.log('\n═'.repeat(50));
  console.log(`🌐 Server is running on http://localhost:${port}`);
  console.log('═'.repeat(50));

  serve({
    fetch: app.fetch,
    port
  });
}

startServer();
