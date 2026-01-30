import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import Database from 'better-sqlite3';

dotenv.config();

const app = express();
const db = new Database('./dev.db');
const adapter = new PrismaBetterSqlite3(db);
export const prisma = new PrismaClient({ adapter });

app.use(cors());
app.use(express.json());

import { routes as authRoutes } from './routes/auth.routes';
import { routes as transactionRoutes } from './routes/transaction.routes';
import { routes as categoryRoutes } from './routes/category.routes';

app.use('/auth', authRoutes);
app.use('/transactions', transactionRoutes);
app.use('/categories', categoryRoutes);

const PORT = process.env.PORT || 3333;

app.get('/', (req, res) => {
  res.json({ message: 'Gestão Financeira API is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
