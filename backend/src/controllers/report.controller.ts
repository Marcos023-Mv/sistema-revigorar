import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { Patient } from '../models/Patient';
import { Evaluation } from '../models/Evaluation';
import { Wound } from '../models/Wound';
import { StockMovement } from '../models/StockMovement';
import { StockItem } from '../models/StockItem';

const WEEK_ORDER = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

function last7Days() {
  const days: Date[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    days.push(d);
  }
  return days;
}

function bucketByDay(dates: Date[], days: Date[]) {
  const counts = days.map(() => 0);
  for (const d of dates) {
    const day = new Date(d);
    day.setHours(0, 0, 0, 0);
    const idx = days.findIndex((ref) => ref.getTime() === day.getTime());
    if (idx >= 0) counts[idx] += 1;
  }
  return counts;
}

// GET /reports
export async function listReports(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.auth!.userId;
    const days = last7Days();
    const from = days[0];
    const to = new Date(days[6].getTime() + 24 * 60 * 60 * 1000);

    const patients = await AppDataSource.getRepository(Patient)
      .createQueryBuilder('p')
      .select('p.created_at', 'created_at')
      .where('p.user_id = :userId AND p.created_at >= :from AND p.created_at < :to', { userId, from, to })
      .getRawMany();

    const evalRows = await AppDataSource.getRepository(Evaluation)
      .createQueryBuilder('e')
      .innerJoin(Wound, 'w', 'w.id = e.wound_id')
      .innerJoin('w.patient', 'p')
      .select('e.recorded_at', 'recorded_at')
      .addSelect('p.care_type', 'care_type')
      .addSelect('e.signs_infection', 'signs_infection')
      .where('e.user_id = :userId AND e.recorded_at >= :from AND e.recorded_at < :to', { userId, from, to })
      .getRawMany();

    const stockOut = await AppDataSource.getRepository(StockMovement)
      .createQueryBuilder('m')
      .innerJoin(StockItem, 's', 's.id = m.item_id')
      .select('m.created_at', 'created_at')
      .where('s.user_id = :userId AND m.direction = :dir AND m.created_at >= :from AND m.created_at < :to', { userId, dir: 'out', from, to })
      .getRawMany();

    const feridaSeries = bucketByDay(evalRows.filter(r => r.care_type === 'ferida').map(r => r.recorded_at), days);
    const estomiaSeries = bucketByDay(evalRows.filter(r => r.care_type === 'estomia').map(r => r.recorded_at), days);
    const infectionSeries = bucketByDay(evalRows.filter(r => r.signs_infection).map(r => r.recorded_at), days);

    const data = {
      'Perfil dos pacientes': { series: bucketByDay(patients.map(p => p.created_at), days), label: 'Novos pacientes cadastrados' },
      'Evolução das feridas': { series: feridaSeries, label: 'Avaliações de feridas registradas' },
      'Evolução das estomias': { series: estomiaSeries, label: 'Avaliações de estomias registradas' },
      'Uso de coberturas': { series: bucketByDay(stockOut.map(s => s.created_at), days), label: 'Itens de estoque baixados (coberturas aplicadas)' },
      'Indicadores clínicos': { series: infectionSeries, label: 'Avaliações com sinais de infecção' },
    };

    res.json({ status: 'ok', data });
  } catch (err) { next(err); }
}

// GET /reports/weekdays
export async function weekdays(_req: Request, res: Response) {
  res.json({ status: 'ok', data: WEEK_ORDER });
}

// GET /reports/distribution
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
