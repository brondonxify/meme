import { config } from 'dotenv';
config({ path: 'apps/backend/.env' });
import jwt from 'jsonwebtoken';
const secret = process.env.JWT_SECRET || 'secret';
const token = jwt.sign({ id: '1', role: 'customer', type: 'customer' }, secret);
fetch('http://localhost:3001/api/v1/auth/customer/orders?page=1&limit=50', {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json()).then(console.log).catch(console.error);
