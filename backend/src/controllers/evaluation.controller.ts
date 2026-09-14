import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { Evaluation } from '../models/Evaluation';
import { AppError } from '../utils/AppError';

const repo = () => AppDataSource.getRepository(Evaluation);

export async function listByWound(req: Request, res: Response, next: NextFunction) {
  try {
    const evals = await repo().find({
      where: { wound_id: req.params.woundId, user_id: req.auth!.userId },
      relations: ['photos', 'scales'],
      order: { recorded_at: 'DESC' },
    });
    res.json({ status: 'ok', data: evals });
  } catch (err) { next(err); }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const ev = await repo().findOne({
      where: { id: req.params.id, user_id: req.auth!.userId },
      relations: ['photos', 'scales'],
    });
    if (!ev) throw AppError.notFound('Avaliação não encontrada');
    res.json({ status: 'ok', data: ev });
  } catch (err) { next(err); }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const { wound_id, description, length_cm, width_cm, depth_cm,
            granulation_pct, slough_pct, necrosis_pct, epithelialization_pct,
            exudate_level, exudate_type, has_odor, signs_infection,
            wound_border, periwound_skin, dressing_used, clinical_notes } = req.body;

    if (!wound_id || !description) throw AppError.badRequest('Ferida e descrição obrigatórios');

    const area = length_cm && width_cm ? parseFloat(length_cm) * parseFloat(width_cm) : undefined;

    const ev = repo().create({
      wound_id, user_id: req.auth!.userId, description,
      length_cm, width_cm, depth_cm, area_cm2: area,
      granulation_pct, slough_pct, necrosis_pct, epithelialization_pct,
      exudate_level, exudate_type, has_odor, signs_infection,
      wound_border, periwound_skin, dressing_used, clinical_notes,
    });
    await repo().save(ev);
    res.status(201).json({ status: 'ok', data: ev });
  } catch (err) { next(err); }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const ev = await repo().findOneBy({ id: req.params.id, user_id: req.auth!.userId });
    if (!ev) throw AppError.notFound();

    const allowed = [
      'description','length_cm','width_cm','depth_cm',
      'granulation_pct','slough_pct','necrosis_pct','epithelialization_pct',
      'exudate_level','exudate_type','has_odor','signs_infection',
      'wound_border','periwound_skin','dressing_used','clinical_notes',
    ] as const;
    for (const k of allowed) if (req.body[k] !== undefined) (ev as any)[k] = req.body[k];

    if (ev.length_cm && ev.width_cm) ev.area_cm2 = ev.length_cm * ev.width_cm;
    await repo().save(ev);
    res.json({ status: 'ok', data: ev });
  } catch (err) { next(err); }
}
