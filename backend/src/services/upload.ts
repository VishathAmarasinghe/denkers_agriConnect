import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    const uploadPath = 'uploads/profile-pictures';
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    // Generate unique filename: timestamp_originalname
    const uniqueSuffix = Date.now() + '_' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const filename = `profile_${uniqueSuffix}${ext}`;
    cb(null, filename);
  }
});

// File filter to allow only image files
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Check file type
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

// Configure multer
export const uploadProfilePicture = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

// Generate public URL for uploaded file
export const generateFileUrl = (filename: string): string => {
  return `/uploads/profile-pictures/${filename}`;
};

// Delete file from filesystem
export const deleteFile = (filepath: string): boolean => {
  try {
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

// Get file path from filename
export const getFilePath = (filename: string): string => {
  return path.join('uploads/profile-pictures', filename);
};

// Validate file size
export const validateFileSize = (file: Express.Multer.File, maxSize: number = 5 * 1024 * 1024): boolean => {
  return file.size <= maxSize;
};

// Validate file type
export const validateFileType = (file: Express.Multer.File): boolean => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  return allowedTypes.includes(file.mimetype);
};
