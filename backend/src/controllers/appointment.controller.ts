import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { Appointment } from '../models/Appointment';
import { Between } from 'typeorm';
import { AppError } from '../utils/AppError';

const repo = () => AppDataSource.getRepository(Appointment);

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.auth!.userId;
    const { from, to, status } = req.query;

    const where: any = { user_id: userId };
    if (status) where.status = status;
    if (from && to) where.scheduled_at = Between(new Date(from as string), new Date(to as string));

    const data = await repo().find({
      where,
      relations: ['patient'],
      order: { scheduled_at: 'ASC' },
    });
    res.json({ status: 'ok', data });
  } catch (err) { next(err); }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const { patient_id, scheduled_at, duration_min, location_type, procedure_type, notes } = req.body;
    if (!patient_id || !scheduled_at) throw AppError.badRequest('Paciente e data obrigatórios');

    const appt = repo().create({
      user_id: req.auth!.userId,
      patient_id, scheduled_at, duration_min, location_type, procedure_type, notes,
    });
    await repo().save(appt);
    res.status(201).json({ status: 'ok', data: appt });
  } catch (err) { next(err); }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const appt = await repo().findOneBy({ id: req.params.id, user_id: req.auth!.userId });
    if (!appt) throw AppError.notFound();

    const allowed = ['scheduled_at','duration_min','status','location_type','procedure_type','notes'] as const;
    for (const k of allowed) if (req.body[k] !== undefined) (appt as any)[k] = req.body[k];
    await repo().save(appt);
    res.json({ status: 'ok', data: appt });
  } catch (err) { next(err); }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await repo().delete({ id: req.params.id, user_id: req.auth!.userId });
    if (!result.affected) throw AppError.notFound();
    res.json({ status: 'ok', message: 'Agendamento removido' });
  } catch (err) { next(err); }
}
