import { prisma } from '../server';
import { Request, Response } from 'express';
import { z } from 'zod';

const transactionSchema = z.object({
  description: z.string(),
  amount: z.number(),
  type: z.enum(['income', 'outcome']),
  categoryId: z.string(),
  date: z.string().optional(),
});

export const TransactionController = {
  async create(req: Request, res: Response) {
    try {
      const { description, amount, type, categoryId, date } = transactionSchema.parse(req.body);

      const transaction = await prisma.transaction.create({
        data: {
          description,
          amount,
          type,
          categoryId,
          userId: req.user.id,
          date: date ? new Date(date) : new Date(),
        },
      });

      return res.status(201).json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.format() });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  async list(req: Request, res: Response) {
    try {
      const transactions = await prisma.transaction.findMany({
        where: { userId: req.user.id },
        include: { category: true },
        orderBy: { date: 'desc' },
      });

      return res.json(transactions);
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  async getDashboard(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const transactions = await prisma.transaction.findMany({
        where: { userId },
      });

      const income = transactions
        .filter((t: any) => t.type === 'income')
        .reduce((acc: number, t: any) => acc + t.amount, 0);

      const outcome = transactions
        .filter((t: any) => t.type === 'outcome')
        .reduce((acc: number, t: any) => acc + t.amount, 0);

      const balance = income - outcome;

      return res.json({
        balance,
        income,
        outcome,
        transactions: transactions.slice(0, 5), // Recent transactions
      });
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  async getBalance(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const transactions = await prisma.transaction.findMany({
        where: { userId },
      });

      const income = transactions
        .filter((t: any) => t.type === 'income')
        .reduce((acc: number, t: any) => acc + t.amount, 0);

      const outcome = transactions
        .filter((t: any) => t.type === 'outcome')
        .reduce((acc: number, t: any) => acc + t.amount, 0);

      const balance = income - outcome;

      return res.json({
        balance,
        income,
        outcome,
      });
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },
};
