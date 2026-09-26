import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';
const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp']);
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  if (ALLOWED.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(null, false); // Veya hata mesajı için: cb(new Error('Sadece resim dosyaları yüklenebilir'));
  }
};

export const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 10 },
});