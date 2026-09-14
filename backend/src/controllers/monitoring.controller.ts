import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { MonitoringMessage } from '../models/MonitoringMessage';
import { Appointment } from '../models/Appointment';
import { Patient } from '../models/Patient';
import { User } from '../models/User';
import { AppError } from '../utils/AppError';

const repo = () => AppDataSource.getRepository(MonitoringMessage);

// GET /patients/:patientId/monitoring/messages
export async function getMessages(req: Request, res: Response, next: NextFunction) {
  try {
    const rows = await repo().find({
      where: { patient_id: req.params.patientId, user_id: req.auth!.userId },
      order: { created_at: 'ASC' },
    });
    const professional = await AppDataSource.getRepository(User).findOneBy({ id: req.auth!.userId });
    const data = rows.map((m) => ({
      id: m.id, from: m.from_actor, name: m.from_actor === 'nurse' ? professional?.full_name : undefined,
      time: m.created_at, text: m.text, photo: m.has_photo,
    }));
    res.json({ status: 'ok', data });
  } catch (err) { next(err); }
}

// POST /patients/:patientId/monitoring/messages — body: { text }
export async function sendMessage(req: Request, res: Response, next: NextFunction) {
  try {
    const { text } = req.body;
    if (!text) throw AppError.badRequest('Texto da mensagem obrigatório');

    const m = repo().create({
      patient_id: req.params.patientId, user_id: req.auth!.userId, from_actor: 'nurse', text,
    });
    await repo().save(m);
    res.status(201).json({ status: 'ok', data: { id: m.id, from: 'nurse', text: m.text, time: m.created_at } });
  } catch (err) { next(err); }
}

// POST /patients/:patientId/monitoring/request-photo
export async function requestPhoto(req: Request, res: Response, next: NextFunction) {
  try {
    const m = repo().create({
      patient_id: req.params.patientId, user_id: req.auth!.userId, from_actor: 'nurse',
      text: 'solicitou uma nova foto da ferida ao paciente',
    });
    await repo().save(m);
    res.status(201).json({ status: 'ok', data: { id: m.id, from: 'nurse', text: m.text, time: m.created_at } });
  } catch (err) { next(err); }
}

// GET /patients/:patientId/monitoring/status
// Deriva de dados reais: paciente ativo + próximo agendamento como "próximo contato".
export async function getStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const patient = await AppDataSource.getRepository(Patient).findOneBy({ id: req.params.patientId, user_id: req.auth!.userId });
    if (!patient) throw AppError.notFound('Paciente não encontrado');

    const next7 = await AppDataSource.getRepository(Appointment).findOne({
      where: { patient_id: req.params.patientId, user_id: req.auth!.userId },
      order: { scheduled_at: 'ASC' },
    });

    res.json({
      status: 'ok',
      data: { active: patient.status === 'active', nextContact: next7?.scheduled_at || null },
    });
  } catch (err) { next(err); }
}
