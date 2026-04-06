import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { createFolderRoute } from 'hono-file-router';
import { serveStatic } from '@hono/node-server/serve-static';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { testConnection } from '@/db/connection.js';
import { errorHandler } from '@/middleware/error-handler.js';
import { requestIdMiddleware, requestLogger } from '@/middleware/request-logger.js';
import { success } from '@/utils/response.js';

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
          if (value.startsWith('"') && value.endsWith('"')) {
            value = value.slice(1, -1);
          }
          if (!process.env[key]) {
            process.env[key] = value.trim();
          }
        }
      }
    // Silent startup - no console output
    } else {
      console.log('No .env file found, using system environment variables');
    }
  } catch (error) {
    console.warn('Could not load .env file:', error);
  }
}

loadEnv();

const app = new Hono();

app.use('*', requestIdMiddleware);
app.use('*', requestLogger);

app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Length', 'X-Request-Id'],
  maxAge: 600,
  credentials: true,
}));

const uploadsDir = path.resolve(__dirname, '../uploads').replace(/\\/g, '/');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.get('/uploads/*', serveStatic({ root: './' }));

// Load routes from folder structure
// Routes are at src/routes/api/v1/... and will be mounted at /api/v1
const routes = await createFolderRoute({ path: './src/routes' });
app.route('/', routes);

// Health check at /api/v1/health (createFolderRoute mounts routes at /)
app.get('/api/v1/health', (c) => success(c, { status: 'ok' }));

const port = parseInt(process.env.PORT || '3001');

app.use('*', errorHandler);

async function startServer() {
  console.log('\n' + '='.repeat(50));
  console.log('Starting E-Commerce API Server...');
  console.log('='.repeat(50));

  console.log('\nTesting database connection...');
  const dbResult = await testConnection();
  if (dbResult.success) {
    console.log(dbResult.message);
  } else {
    console.log(dbResult.message);
    console.log('Server will start but database operations may fail');
  }

  console.log('\nConfiguration:');
  console.log(`  - Port: ${port}`);
  console.log(`  - DB Host: ${process.env.DB_HOST || 'not set'}`);
  console.log(`  - DB Name: ${process.env.DB_NAME || 'not set'}`);
  console.log(`  - DB User: ${process.env.DB_USER || 'not set'}`);

  console.log('\n' + '='.repeat(50));
  console.log(`Server running on http://localhost:${port}`);
  console.log('='.repeat(50));

  serve({
    fetch: app.fetch,
    port
  });
}

startServer();
