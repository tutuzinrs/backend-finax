import { prisma } from '../server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const AuthController = {
  async register(req: Request, res: Response) {
    try {
      const { name, email, password } = registerSchema.parse(req.body);

      const userExists = await prisma.user.findUnique({ where: { email } });

      if (userExists) {
        return res.status(400).json({ error: 'User already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 8);

      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      });

      // @ts-ignore
      delete user.password;

      return res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.format() });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  async login(req: Request, res: Response) {
    try {
      const { email, password } = loginSchema.parse(req.body);

      const user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secret', {
        expiresIn: '1d',
      });

      // @ts-ignore
      delete user.password;

      return res.json({ user, token });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.format() });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  async getProfile(req: Request, res: Response) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          createdAt: true,
        },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.json(user);
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  async updateAvatar(req: Request, res: Response) {
    try {
      const { avatarUrl } = req.body;

      if (!avatarUrl || typeof avatarUrl !== 'string') {
        return res.status(400).json({ error: 'Avatar URL is required' });
      }

      const user = await prisma.user.update({
        where: { id: req.user.id },
        data: { avatar: avatarUrl },
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      });

      return res.json(user);
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },
};
