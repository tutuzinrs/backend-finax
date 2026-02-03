import { prisma } from '../server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import { emailService } from '../services/emailService';

const registerSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const updateProfileSchema = z.object({
  name: z.string().min(3).optional(),
  email: z.string().email().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6).optional(),
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

  async updateProfile(req: Request, res: Response) {
    try {
      const data = updateProfileSchema.parse(req.body);

      // Buscar usuário atual
      const currentUser = await prisma.user.findUnique({
        where: { id: req.user.id },
      });

      if (!currentUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Validar mudança de senha
      if (data.newPassword) {
        if (!data.currentPassword) {
          return res.status(400).json({ 
            error: 'Current password is required to change password' 
          });
        }

        const passwordMatch = await bcrypt.compare(
          data.currentPassword,
          currentUser.password
        );

        if (!passwordMatch) {
          return res.status(400).json({ error: 'Current password is incorrect' });
        }
      }

      // Validar mudança de email
      if (data.email && data.email !== currentUser.email) {
        const emailExists = await prisma.user.findUnique({
          where: { email: data.email },
        });

        if (emailExists) {
          return res.status(400).json({ error: 'Email already in use' });
        }
      }

      // Preparar dados para atualização
      const updateData: any = {};

      if (data.name) updateData.name = data.name;
      if (data.email) updateData.email = data.email;
      if (data.newPassword) {
        updateData.password = await bcrypt.hash(data.newPassword, 8);
      }

      // Atualizar usuário
      const updatedUser = await prisma.user.update({
        where: { id: req.user.id },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          createdAt: true,
        },
      });

      return res.json(updatedUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.format() });
      }
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

  async forgotPassword(req: Request, res: Response) {
    try {
      const forgotPasswordSchema = z.object({
        email: z.string().email(),
      });

      const { email } = forgotPasswordSchema.parse(req.body);

      const user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        // Por segurança, não informar se o email existe ou não
        return res.json({ 
          message: 'If the email exists, a password reset link has been sent.' 
        });
      }

      // Gerar token único e seguro
      const resetToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
      
      // Token expira em 1 hora
      const resetTokenExpiry = new Date(Date.now() + 3600000);

      // Salvar token no banco
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken: hashedToken,
          resetTokenExpiry,
        },
      });

      // Enviar email
      try {
        await emailService.sendPasswordResetEmail(email, resetToken);
      } catch (emailError) {
        console.error('Failed to send email:', emailError);
        return res.status(500).json({ 
          error: 'Failed to send reset email. Please try again later.' 
        });
      }

      return res.json({ 
        message: 'If the email exists, a password reset link has been sent.' 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.format() });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  async resetPassword(req: Request, res: Response) {
    try {
      const resetPasswordSchema = z.object({
        token: z.string(),
        newPassword: z.string().min(6),
      });

      const { token, newPassword } = resetPasswordSchema.parse(req.body);

      // Hash do token para comparar com o banco
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

      // Buscar usuário com token válido e não expirado
      const user = await prisma.user.findFirst({
        where: {
          resetToken: hashedToken,
          resetTokenExpiry: {
            gt: new Date(), // Token ainda não expirou
          },
        },
      });

      if (!user) {
        return res.status(400).json({ 
          error: 'Invalid or expired reset token' 
        });
      }

      // Hash da nova senha
      const hashedPassword = await bcrypt.hash(newPassword, 8);

      // Atualizar senha e limpar token
      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          resetToken: null,
          resetTokenExpiry: null,
        },
      });

      // Enviar email de confirmação (não bloqueia a resposta)
      emailService.sendPasswordChangedNotification(user.email, user.name)
        .catch(err => console.error('Failed to send notification email:', err));

      return res.json({ 
        message: 'Password has been reset successfully' 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.format() });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  },
};
