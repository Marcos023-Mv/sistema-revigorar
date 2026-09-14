import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { FinancialRecord } from '../models/FinancialRecord';
import { Between } from 'typeorm';
import { AppError } from '../utils/AppError';

const repo = () => AppDataSource.getRepository(FinancialRecord);

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.auth!.userId;
    const { type, from, to, page = '1', limit = '50' } = req.query;

    const where: any = { user_id: userId };
    if (type) where.type = type;
    if (from && to) where.recorded_date = Between(from as string, to as string);

    const pg = Math.max(1, parseInt(page as string));
    const lm = Math.min(100, parseInt(limit as string));

    const [data, total] = await repo().findAndCount({
      where, order: { recorded_date: 'DESC' },
      skip: (pg - 1) * lm, take: lm,
    });
    res.json({ status: 'ok', data, meta: { total, page: pg, limit: lm } });
  } catch (err) { next(err); }
}

export async function dashboard(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.auth!.userId;

    const income = await repo()
      .createQueryBuilder('f')
      .select('COALESCE(SUM(f.amount),0)', 'total')
      .where('f.user_id = :userId AND f.type = :t AND f.status = :s',
        { userId, t: 'income', s: 'completed' })
      .getRawOne();

    const expense = await repo()
      .createQueryBuilder('f')
      .select('COALESCE(SUM(f.amount),0)', 'total')
      .where('f.user_id = :userId AND f.type = :t AND f.status = :s',
        { userId, t: 'expense', s: 'completed' })
      .getRawOne();

    res.json({
      status: 'ok',
      data: {
        income: parseFloat(income.total),
        expense: parseFloat(expense.total),
        profit: parseFloat(income.total) - parseFloat(expense.total),
      },
    });
  } catch (err) { next(err); }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const { type, category, amount, description, payment_method, status, recorded_date, patient_id } = req.body;
    if (!type || !category || !amount || !recorded_date) {
      throw AppError.badRequest('Tipo, categoria, valor e data obrigatórios');
    }

    const record = repo().create({
      user_id: req.auth!.userId,
      type, category, amount, description, payment_method,
      status: status || 'completed', recorded_date, patient_id,
    });
    await repo().save(record);
    res.status(201).json({ status: 'ok', data: record });
  } catch (err) { next(err); }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await repo().delete({ id: req.params.id, user_id: req.auth!.userId });
    if (!result.affected) throw AppError.notFound();
    res.json({ status: 'ok', message: 'Registro removido' });
  } catch (err) { next(err); }
}
