import dns from 'node:dns';

// Some ISP/router DNS servers refuse the SRV lookup needed by mongodb+srv:// URIs
dns.setServers(['8.8.8.8', '1.1.1.1']);

import 'dotenv/config';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { requireAuth } from './middleware/auth.js';
import authRoutes from './routes/auth.js';
import employeeRoutes from './routes/employees.js';
import categoryRoutes from './routes/categories.js';
import payrollRoutes from './routes/payroll.js';

const { MONGO_URI, JWT_SECRET, PORT = 5000 } = process.env;
if (!MONGO_URI || !JWT_SECRET) {
  console.error('Missing MONGO_URI or JWT_SECRET. Copy server/.env.example to server/.env');
  process.exit(1);
}

// Express 4 does not catch rejected promises in async handlers by itself
const wrap = (router) => {
  router.stack.forEach((layer) => {
    if (!layer.route) return;
    layer.route.stack.forEach((l) => {
      const fn = l.handle;
      if (fn.length <= 3) l.handle = (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
    });
  });
  return router;
};

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', wrap(authRoutes));
app.use('/api/employees', requireAuth, wrap(employeeRoutes));
app.use('/api/categories', requireAuth, wrap(categoryRoutes));
app.use('/api/payroll', requireAuth, wrap(payrollRoutes));

// In production, serve the built React app
const dist = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../client/dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get(/^\/(?!api).*/, (_req, res) => res.sendFile(path.join(dist, 'index.html')));
}

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err);
  if (err.name === 'ValidationError') return res.status(400).json({ message: err.message });
  res.status(500).json({ message: 'Something went wrong on the server' });
});

mongoose
  .connect(MONGO_URI)
  .then(() => app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`)))
  .catch((err) => {
    console.error('Could not connect to MongoDB:', err.message);
    process.exit(1);
  });
