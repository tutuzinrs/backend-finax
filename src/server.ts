import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

const app = express();
export const prisma = new PrismaClient({ adapter });

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files for uploads
app.use('/uploads', express.static('uploads'));

import { routes as authRoutes } from './routes/auth.routes';
import { routes as transactionRoutes } from './routes/transaction.routes';
import { routes as categoryRoutes } from './routes/category.routes';
import uploadRoutes from './routes/upload.routes';

app.use('/auth', authRoutes);
app.use('/transactions', transactionRoutes);
app.use('/categories', categoryRoutes);
app.use('/upload', uploadRoutes);

const PORT = process.env.PORT || 3333;

app.get('/', (req, res) => {
  res.json({ message: 'Gestão Financeira API is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
