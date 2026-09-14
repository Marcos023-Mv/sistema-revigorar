import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { Evaluation } from '../models/Evaluation';
import { Wound } from '../models/Wound';
import { Prescription } from '../models/Prescription';
import { PatientPhoto } from '../models/PatientPhoto';
import { User } from '../models/User';

interface FeedEvent {
  id: string;
  patient_id: string;
  patient_name: string;
  professional: string;
  type: 'Avaliação' | 'Prescrição' | 'Fotográfica';
  text: string;
  details?: string;
  has_photo?: boolean;
  date: Date;
}

async function collectEvents(userId: string, patientId?: string): Promise<FeedEvent[]> {
  const userRepo = AppDataSource.getRepository(User);

  const evalQb = AppDataSource.getRepository(Evaluation)
    .createQueryBuilder('e')
    .innerJoin(Wound, 'w', 'w.id = e.wound_id')
    .innerJoin('w.patient', 'p')
    .select(['e.id', 'e.description', 'e.recorded_at', 'e.user_id', 'e.length_cm', 'e.width_cm', 'e.depth_cm', 'e.wound_border', 'e.periwound_skin'])
    .addSelect('p.id', 'patient_id')
    .addSelect('p.name', 'patient_name')
    .where('e.user_id = :userId', { userId });
  if (patientId) evalQb.andWhere('w.patient_id = :patientId', { patientId });
  const evals = await evalQb.getRawMany();

  const presRepo = AppDataSource.getRepository(Prescription)
    .createQueryBuilder('pr')
    .innerJoin('pr.patient', 'p')
    .select(['pr.id', 'pr.description', 'pr.type', 'pr.created_at', 'pr.user_id'])
    .addSelect('p.id', 'patient_id')
    .addSelect('p.name', 'patient_name')
    .where('pr.user_id = :userId', { userId });
  if (patientId) presRepo.andWhere('pr.patient_id = :patientId', { patientId });
  const prescriptions = await presRepo.getRawMany();

  const photoRepo = AppDataSource.getRepository(PatientPhoto)
    .createQueryBuilder('ph')
    .innerJoin('ph.patient', 'p')
    .select(['ph.id', 'ph.created_at', 'ph.user_id'])
    .addSelect('p.id', 'patient_id')
    .addSelect('p.name', 'patient_name')
    .where('ph.user_id = :userId', { userId });
  if (patientId) photoRepo.andWhere('ph.patient_id = :patientId', { patientId });
  const photos = await photoRepo.getRawMany();

  const professionalName = await (async () => {
    const u = await userRepo.findOneBy({ id: userId });
    return u?.full_name || '—';
  })();

  const events: FeedEvent[] = [];

  for (const e of evals) {
    events.push({
      id: e.e_id, patient_id: e.patient_id, patient_name: e.patient_name,
      professional: professionalName, type: 'Avaliação',
      text: e.e_description?.slice(0, 140) || 'Avaliação clínica registrada.',
      details: `Comprimento ${e.e_length_cm ?? '—'} cm, largura ${e.e_width_cm ?? '—'} cm, profundidade ${e.e_depth_cm ?? '—'} cm.` +
        (e.e_wound_border ? ` Bordas: ${e.e_wound_border}.` : ''),
      date: e.e_recorded_at,
    });
  }
  for (const p of prescriptions) {
    events.push({
      id: p.pr_id, patient_id: p.patient_id, patient_name: p.patient_name,
      professional: professionalName, type: 'Prescrição',
      text: p.pr_description, details: `Tipo: ${p.pr_type}.`,
      date: p.pr_created_at,
    });
  }
  for (const ph of photos) {
    events.push({
      id: ph.ph_id, patient_id: ph.patient_id, patient_name: ph.patient_name,
      professional: professionalName, type: 'Fotográfica',
      text: 'Novo registro fotográfico adicionado.', has_photo: true,
      date: ph.ph_created_at,
    });
  }

  events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return events;
}

// GET /evolutions/feed
export async function feed(req: Request, res: Response, next: NextFunction) {
  try {
    const events = await collectEvents(req.auth!.userId);
    const data = events.slice(0, 100).map((e) => ({
      id: e.id,
      patient: { id: e.patient_id, name: e.patient_name },
      type: e.type,
      text: e.text,
      date: e.date,
    }));
    res.json({ status: 'ok', data });
  } catch (err) { next(err); }
}

// GET /patients/:patientId/records
export async function records(req: Request, res: Response, next: NextFunction) {
  try {
    const events = await collectEvents(req.auth!.userId, req.params.patientId);
    const TYPE_LABEL: Record<string, string> = {
      'Avaliação': 'Avaliação clínica',
      'Prescrição': 'Prescrição',
      'Fotográfica': 'Evolução fotográfica',
    };
    const data = events.map((e) => ({
      date: e.date,
      type: TYPE_LABEL[e.type] || e.type,
      professional: e.professional,
      description: e.text,
    }));
    res.json({ status: 'ok', data });
  } catch (err) { next(err); }
}

// GET /patients/:patientId/evolution-timeline
export async function timeline(req: Request, res: Response, next: NextFunction) {
  try {
    const events = await collectEvents(req.auth!.userId, req.params.patientId);
    const TITLE: Record<string, string> = {
      'Avaliação': 'Avaliação clínica',
      'Prescrição': 'Prescrição de enfermagem',
      'Fotográfica': 'Evolução fotográfica',
    };
    const data = events.map((e) => ({
      date: e.date,
      title: TITLE[e.type] || e.type,
      description: e.text,
      details: e.details || e.text,
      hasPhoto: Boolean(e.has_photo),
    }));
    res.json({ status: 'ok', data });
  } catch (err) { next(err); }
}
