import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';
import { env } from './env';

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function storageFor(subdir: string) {
  const dir = path.join(env.upload.dir, subdir);
  ensureDir(dir);
  return multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, dir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${randomUUID()}${ext}`);
    },
  });
}

export const uploadPhoto = multer({
  storage: storageFor('photos'),
  limits: { fileSize: env.upload.maxFileSize },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) return cb(new Error('Arquivo precisa ser uma imagem'));
    cb(null, true);
  },
});

export const uploadDocument = multer({
  storage: storageFor('documents'),
  limits: { fileSize: env.upload.maxFileSize },
});

// Caminho público (servido em /uploads) a partir de um caminho absoluto em disco
export function toPublicPath(absPath: string) {
  const rel = path.relative(env.upload.dir, absPath).split(path.sep).join('/');
  return `/uploads/${rel}`;
}
