import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { PatientDocument } from '../models/PatientDocument';
import { AppError } from '../utils/AppError';

const repo = () => AppDataSource.getRepository(PatientDocument);

function formatSize(bytes?: number | null) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// GET /patients/:patientId/documents
export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const docs = await repo().find({
      where: { patient_id: req.params.patientId, user_id: req.auth!.userId },
      order: { created_at: 'DESC' },
    });
    const data = docs.map((d) => ({ id: d.id, name: d.name, date: d.created_at, size: formatSize(d.file_size) }));
    res.json({ status: 'ok', data });
  } catch (err) { next(err); }
}

// POST /patients/:patientId/documents (multipart/form-data, campo "document")
export async function add(req: Request, res: Response, next: NextFunction) {
  try {
    const file = (req as any).file;
    // Aceita tanto upload real (multipart, campo "document") quanto apenas
    // metadados (JSON { name }) — a tela de Prontuário hoje só registra o
    // nome do documento, sem anexar arquivo.
    if (!file && !req.body.name) throw AppError.badRequest('Arquivo ou nome do documento obrigatório');

    const doc = repo().create({
      patient_id: req.params.patientId,
      user_id: req.auth!.userId,
      name: file ? file.originalname : req.body.name,
      file_path: file ? file.path : null as any,
      file_size: file ? file.size : null,
    });
    await repo().save(doc);
    res.status(201).json({ status: 'ok', data: { id: doc.id, name: doc.name, date: doc.created_at, size: formatSize(doc.file_size) } });
  } catch (err) { next(err); }
}

// GET /patients/:patientId/documents/:name/download
export async function download(req: Request, res: Response, next: NextFunction) {
  try {
    const doc = await repo().findOne({
      where: { patient_id: req.params.patientId, user_id: req.auth!.userId, name: req.params.name },
    });
    if (!doc) throw AppError.notFound('Documento não encontrado');
    res.download(doc.file_path, doc.name);
  } catch (err) { next(err); }
}
