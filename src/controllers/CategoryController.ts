import { prisma } from '../server';
import { Request, Response } from 'express';
import { z } from 'zod';

const categorySchema = z.object({
  name: z.string(),
  icon: z.string(),
  color: z.string(),
  type: z.enum(['income', 'outcome']),
});

export const CategoryController = {
  async create(req: Request, res: Response) {
    try {
      const { name, icon, color, type } = categorySchema.parse(req.body);

      const category = await prisma.category.create({
        data: {
          name,
          icon,
          color,
          type,
          userId: req.user.id,
        },
      });

      return res.status(201).json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.format() });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  async list(req: Request, res: Response) {
    try {
      const categories = await prisma.category.findMany({
        where: {
          OR: [
            { userId: req.user.id },
            { userId: null }, // System default categories
          ],
        },
      });

      return res.json(categories);
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },
};
