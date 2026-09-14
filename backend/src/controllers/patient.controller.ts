import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { Patient } from '../models/Patient';
import { AppError } from '../utils/AppError';

const repo = () => AppDataSource.getRepository(Patient);

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.auth!.userId;
    const { status, search, page = '1', limit = '20' } = req.query;

    const qb = repo().createQueryBuilder('p')
      .where('p.user_id = :userId', { userId })
      .orderBy('p.name', 'ASC');

    if (status) qb.andWhere('p.status = :status', { status });
    if (search) qb.andWhere('p.name ILIKE :s', { s: `%${search}%` });

    const pg = Math.max(1, parseInt(page as string));
    const lm = Math.min(100, Math.max(1, parseInt(limit as string)));
    qb.skip((pg - 1) * lm).take(lm);

    const [data, total] = await qb.getManyAndCount();

    res.json({ status: 'ok', data, meta: { total, page: pg, limit: lm } });
  } catch (err) { next(err); }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const patient = await repo().findOne({
      where: { id: req.params.id, user_id: req.auth!.userId },
      relations: ['wounds'],
    });
    if (!patient) throw AppError.notFound('Paciente não encontrado');
    res.json({ status: 'ok', data: patient });
  } catch (err) { next(err); }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, birth_date, cpf, email, phone, address, gender,
            medical_history, comorbidities, medications, allergies,
            insurance_provider, insurance_number, care_type } = req.body;

    if (!name || !birth_date) throw AppError.badRequest('Nome e data de nascimento obrigatórios');

    const patient = repo().create({
      user_id: req.auth!.userId,
      name, birth_date, cpf, email, phone, address, gender,
      medical_history, comorbidities, medications, allergies,
      insurance_provider, insurance_number, care_type,
    });

    await repo().save(patient);
    res.status(201).json({ status: 'ok', data: patient });
  } catch (err) { next(err); }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const patient = await repo().findOneBy({ id: req.params.id, user_id: req.auth!.userId });
    if (!patient) throw AppError.notFound();

    const allowed = [
      'name','birth_date','cpf','email','phone','address','gender',
      'medical_history','comorbidities','medications','allergies',
      'insurance_provider','insurance_number','status','care_type',
    ] as const;
    for (const key of allowed) {
      if (req.body[key] !== undefined) (patient as any)[key] = req.body[key];
    }
    await repo().save(patient);
    res.json({ status: 'ok', data: patient });
  } catch (err) { next(err); }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await repo().delete({ id: req.params.id, user_id: req.auth!.userId });
    if (!result.affected) throw AppError.notFound();
    res.json({ status: 'ok', message: 'Paciente removido' });
  } catch (err) { next(err); }
}
