import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { Prescription } from '../models/Prescription';
import { AppError } from '../utils/AppError';

const repo = () => AppDataSource.getRepository(Prescription);

// GET /patients/:patientId/prescriptions
export async function listByPatient(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await repo().find({
      where: { patient_id: req.params.patientId, user_id: req.auth!.userId },
      order: { created_at: 'DESC' },
    });
    res.json({ status: 'ok', data });
  } catch (err) { next(err); }
}

// POST /patients/:patientId/prescriptions
export async function createForPatient(req: Request, res: Response, next: NextFunction) {
  try {
    const { type, description } = req.body;
    if (!type || !description) throw AppError.badRequest('Tipo e descrição obrigatórios');

    const p = repo().create({
      patient_id: req.params.patientId, user_id: req.auth!.userId, type, description,
    });
    await repo().save(p);
    res.status(201).json({ status: 'ok', data: p });
  } catch (err) { next(err); }
}

// GET /prescriptions — quadro Kanban com todos os pacientes
export async function listAll(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await repo()
      .createQueryBuilder('pr')
      .innerJoin('pr.patient', 'p')
      .select(['pr.id', 'pr.type', 'pr.description', 'pr.status', 'pr.created_at'])
      .addSelect('p.id', 'patient_id')
      .addSelect('p.name', 'patient_name')
      .where('pr.user_id = :userId', { userId: req.auth!.userId })
      .orderBy('pr.created_at', 'DESC')
      .getRawMany();

    res.json({
      status: 'ok',
      data: data.map((r) => ({
        id: r.pr_id, patient_id: r.patient_id, patient: r.patient_name,
        type: r.pr_type, description: r.pr_description, status: r.pr_status, date: r.pr_created_at,
      })),
    });
  } catch (err) { next(err); }
}

// POST /prescriptions — body: { patient_id, type, description }
export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const { patient_id, type, description } = req.body;
    if (!patient_id || !type || !description) throw AppError.badRequest('Paciente, tipo e descrição obrigatórios');

    const p = repo().create({ patient_id, user_id: req.auth!.userId, type, description });
    await repo().save(p);
    res.status(201).json({ status: 'ok', data: p });
  } catch (err) { next(err); }
}

// PUT /prescriptions/:id — body: { description?, status?, type? }
export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const p = await repo().findOneBy({ id: req.params.id, user_id: req.auth!.userId });
    if (!p) throw AppError.notFound();

    const allowed = ['type', 'description', 'status'] as const;
    for (const k of allowed) if (req.body[k] !== undefined) (p as any)[k] = req.body[k];
    await repo().save(p);
    res.json({ status: 'ok', data: p });
  } catch (err) { next(err); }
}

// DELETE /prescriptions/:id
export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await repo().delete({ id: req.params.id, user_id: req.auth!.userId });
    if (!result.affected) throw AppError.notFound();
    res.json({ status: 'ok', message: 'Prescrição removida' });
  } catch (err) { next(err); }
}

const DRESSING_CATALOG = [
  { name: 'Hidrogel', indication: 'Feridas com tecido necrótico ou esfacelo, pouco exsudativas.', frequency: 'Troca a cada 24–72h' },
  { name: 'Espuma de poliuretano', indication: 'Feridas com exsudato moderado a intenso.', frequency: 'Troca a cada 3–7 dias' },
  { name: 'Alginato de cálcio', indication: 'Feridas altamente exsudativas ou com sangramento leve.', frequency: 'Troca a cada 1–3 dias' },
  { name: 'Filme transparente', indication: 'Proteção de pele íntegra ou feridas superficiais.', frequency: 'Troca a cada 5–7 dias' },
  { name: 'Carvão ativado com prata', indication: 'Feridas com odor e sinais de infecção.', frequency: 'Troca a cada 2–3 dias' },
];

// GET /dressing-catalog — catálogo de referência clínica (fixo/estático de propósito)
export async function dressingCatalog(_req: Request, res: Response) {
  res.json({ status: 'ok', data: DRESSING_CATALOG });
}
