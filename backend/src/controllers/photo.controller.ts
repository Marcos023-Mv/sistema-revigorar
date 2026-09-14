import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { PatientPhoto } from '../models/PatientPhoto';
import { Patient } from '../models/Patient';
import { AppError } from '../utils/AppError';
import { toPublicPath } from '../config/upload';

const photoRepo = () => AppDataSource.getRepository(PatientPhoto);

// GET /patients/:patientId/photos
export async function getPatientPhotos(req: Request, res: Response, next: NextFunction) {
  try {
    const photos = await photoRepo().find({
      where: { patient_id: req.params.patientId, user_id: req.auth!.userId },
      order: { created_at: 'DESC' },
    });
    const data = photos.map((p) => ({ id: p.id, date: p.created_at, url: toPublicPath(p.file_path) }));
    res.json({ status: 'ok', data });
  } catch (err) { next(err); }
}

// POST /patients/:patientId/photos  (multipart/form-data, campo "photo")
export async function uploadPatientPhoto(req: Request, res: Response, next: NextFunction) {
  try {
    const file = (req as any).file;
    if (!file) throw AppError.badRequest('Arquivo de foto obrigatório');

    const photo = photoRepo().create({
      patient_id: req.params.patientId,
      user_id: req.auth!.userId,
      file_path: file.path,
      file_size: file.size,
    });
    await photoRepo().save(photo);
    res.status(201).json({ status: 'ok', data: { id: photo.id, date: photo.created_at, url: toPublicPath(photo.file_path) } });
  } catch (err) { next(err); }
}

// GET /photos — última foto de cada paciente
export async function listPatientsWithPhotos(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.auth!.userId;
    const patients = await AppDataSource.getRepository(Patient).find({ where: { user_id: userId }, order: { name: 'ASC' } });

    const data = await Promise.all(patients.map(async (p) => {
      const last = await photoRepo().findOne({ where: { patient_id: p.id }, order: { created_at: 'DESC' } });
      return { id: p.id, name: p.name, last_photo_date: last?.created_at || null };
    }));

    res.json({ status: 'ok', data });
  } catch (err) { next(err); }
}
