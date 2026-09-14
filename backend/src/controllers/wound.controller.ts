import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { Wound } from '../models/Wound';
import { AppError } from '../utils/AppError';

const repo = () => AppDataSource.getRepository(Wound);

export async function listByPatient(req: Request, res: Response, next: NextFunction) {
  try {
    const wounds = await repo().find({
      where: { patient_id: req.params.patientId, user_id: req.auth!.userId },
      order: { created_at: 'DESC' },
    });
    res.json({ status: 'ok', data: wounds });
  } catch (err) { next(err); }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const wound = await repo().findOne({
      where: { id: req.params.id, user_id: req.auth!.userId },
      relations: ['evaluations', 'evaluations.photos', 'evaluations.scales'],
    });
    if (!wound) throw AppError.notFound('Ferida não encontrada');
    res.json({ status: 'ok', data: wound });
  } catch (err) { next(err); }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const { patient_id, etiology, location, laterality, body_map, description,
            initial_length_cm, initial_width_cm, initial_depth_cm, onset_date } = req.body;

    if (!patient_id || !etiology || !location) {
      throw AppError.badRequest('Paciente, etiologia e localização obrigatórios');
    }

    const wound = repo().create({
      patient_id, user_id: req.auth!.userId,
      etiology, location, laterality, body_map, description,
      initial_length_cm, initial_width_cm, initial_depth_cm, onset_date,
    });
    await repo().save(wound);
    res.status(201).json({ status: 'ok', data: wound });
  } catch (err) { next(err); }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const wound = await repo().findOneBy({ id: req.params.id, user_id: req.auth!.userId });
    if (!wound) throw AppError.notFound();

    const allowed = ['etiology','location','laterality','body_map','status','description','healed_date'] as const;
    for (const key of allowed) {
      if (req.body[key] !== undefined) (wound as any)[key] = req.body[key];
    }
    await repo().save(wound);
    res.json({ status: 'ok', data: wound });
  } catch (err) { next(err); }
}
