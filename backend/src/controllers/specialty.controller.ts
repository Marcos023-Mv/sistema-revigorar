import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { Specialty } from '../models/Specialty';
import { AppError } from '../utils/AppError';

const repo = () => AppDataSource.getRepository(Specialty);

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await repo().find({
      where: { user_id: req.auth!.userId, is_active: true },
      order: { name: 'ASC' },
    });
    res.json({ status: 'ok', data });
  } catch (err) { next(err); }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, description } = req.body;
    if (!name?.trim()) throw AppError.badRequest('Nome da especialidade é obrigatório');

    const exists = await repo().findOneBy({
      user_id: req.auth!.userId,
      name: name.trim(),
    });
    if (exists) throw AppError.conflict('Esta especialidade já está cadastrada');

    const specialty = repo().create({
      user_id: req.auth!.userId,
      name: name.trim(),
      description: description?.trim() || null,
    });
    await repo().save(specialty);
    res.status(201).json({ status: 'ok', data: specialty });
  } catch (err) { next(err); }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const specialty = await repo().findOneBy({
      id: req.params.id,
      user_id: req.auth!.userId,
    });
    if (!specialty) throw AppError.notFound('Especialidade não encontrada');

    if (req.body.name !== undefined) specialty.name = String(req.body.name).trim();
    if (req.body.description !== undefined) specialty.description = req.body.description || null;
    if (req.body.is_active !== undefined) specialty.is_active = Boolean(req.body.is_active);

    await repo().save(specialty);
    res.json({ status: 'ok', data: specialty });
  } catch (err) { next(err); }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await repo().delete({ id: req.params.id, user_id: req.auth!.userId });
    if (!result.affected) throw AppError.notFound('Especialidade não encontrada');
    res.json({ status: 'ok', message: 'Especialidade removida' });
  } catch (err) { next(err); }
}
