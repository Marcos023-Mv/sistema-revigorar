import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { Patient } from '../models/Patient';
import { Evaluation } from '../models/Evaluation';
import { Prescription } from '../models/Prescription';
import { PatientPhoto } from '../models/PatientPhoto';
import { Appointment } from '../models/Appointment';

const WEEKDAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
// Ordem exibida no dashboard: Seg..Dom
const WEEK_ORDER = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
function endOfToday() {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}
function startOfWeek() {
  const d = startOfToday();
  const dow = d.getDay(); // 0=Dom
  const diffToMonday = dow === 0 ? 6 : dow - 1;
  d.setDate(d.getDate() - diffToMonday);
  return d;
}

export async function stats(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.auth!.userId;
    const today0 = startOfToday();
    const today1 = endOfToday();

    const activePatients = await AppDataSource.getRepository(Patient)
      .count({ where: { user_id: userId, status: 'active' } });

    const assessmentsToday = await AppDataSource.getRepository(Evaluation)
      .createQueryBuilder('e')
      .where('e.user_id = :userId AND e.created_at BETWEEN :a AND :b', { userId, a: today0, b: today1 })
      .getCount();

    const [prescriptionsToday, photosToday] = await Promise.all([
      AppDataSource.getRepository(Prescription)
        .createQueryBuilder('p')
        .where('p.user_id = :userId AND p.created_at BETWEEN :a AND :b', { userId, a: today0, b: today1 })
        .getCount(),
      AppDataSource.getRepository(PatientPhoto)
        .createQueryBuilder('p')
        .where('p.user_id = :userId AND p.created_at BETWEEN :a AND :b', { userId, a: today0, b: today1 })
        .getCount(),
    ]);

    const pendencies = await AppDataSource.getRepository(Appointment)
      .createQueryBuilder('a')
      .where('a.user_id = :userId AND a.status = :s AND a.scheduled_at <= :now', { userId, s: 'scheduled', now: new Date() })
      .getCount();

    res.json({
      status: 'ok',
      data: {
        activePatients,
        assessmentsToday,
        evolutionsToday: assessmentsToday + prescriptionsToday + photosToday,
        pendencies,
      },
    });
  } catch (err) { next(err); }
}

export async function weeklySeries(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.auth!.userId;
    const from = startOfWeek();
    const to = new Date(from.getTime() + 7 * 24 * 60 * 60 * 1000);

    const appts = await AppDataSource.getRepository(Appointment)
      .createQueryBuilder('a')
      .select('a.scheduled_at', 'scheduled_at')
      .where('a.user_id = :userId AND a.scheduled_at >= :from AND a.scheduled_at < :to', { userId, from, to })
      .getRawMany();

    const counts: Record<string, number> = { Seg: 0, Ter: 0, Qua: 0, Qui: 0, Sex: 0, Sáb: 0, Dom: 0 };
    for (const row of appts) {
      const day = new Date(row.scheduled_at);
      counts[WEEKDAY_LABELS[day.getDay()]] += 1;
    }

    res.json({
      status: 'ok',
      data: { labels: WEEK_ORDER, values: WEEK_ORDER.map((d) => counts[d]) },
    });
  } catch (err) { next(err); }
}

export async function distribution(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.auth!.userId;
    const rows = await AppDataSource.getRepository(Patient)
      .createQueryBuilder('p')
      .select('p.care_type', 'care_type')
      .addSelect('COUNT(*)', 'count')
      .where('p.user_id = :userId', { userId })
      .groupBy('p.care_type')
      .getRawMany();

    const byType: Record<string, number> = {};
    for (const r of rows) byType[r.care_type] = parseInt(r.count, 10);

    const data = [
      { label: 'Feridas', value: byType.ferida || 0, color: 'var(--color-primary)' },
      { label: 'Estomias', value: byType.estomia || 0, color: 'var(--color-primary-light)' },
      { label: 'Outros', value: Object.keys(byType).filter(k => k !== 'ferida' && k !== 'estomia').reduce((s, k) => s + byType[k], 0), color: 'var(--color-accent-soft)' },
    ];
    res.json({ status: 'ok', data });
  } catch (err) { next(err); }
}
