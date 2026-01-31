import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { randomUUID } from 'crypto';
import fs from 'fs';

// Create uploads directory if it doesn't exist
const uploadDir = path.join(process.cwd(), process.env.UPLOAD_DIR || 'uploads', 'avatars');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${randomUUID()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// File filter to accept only images
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'));
  }
};

// Configure multer
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'), // 5MB default
  },
});

export const UploadController = {
  async uploadAvatar(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // Generate public URL for the uploaded file
      const fileUrl = `${req.protocol}://${req.get('host')}/uploads/avatars/${req.file.filename}`;

      return res.json({
        url: fileUrl,
        filename: req.file.filename,
        size: req.file.size,
      });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to upload file' });
    }
  },
};
