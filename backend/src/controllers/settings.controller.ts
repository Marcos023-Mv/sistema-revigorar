import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { Institution } from '../models/Institution';
import { Integration } from '../models/Integration';
import { User } from '../models/User';
import { BackupLog } from '../models/BackupLog';
import { AppError } from '../utils/AppError';
import * as crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { env } from '../config/env';

const instRepo = () => AppDataSource.getRepository(Institution);
const integRepo = () => AppDataSource.getRepository(Integration);
const userRepo = () => AppDataSource.getRepository(User);
const backupRepo = () => AppDataSource.getRepository(BackupLog);

// ── Instituição ─────────────────────────────
export async function getInstitution(req: Request, res: Response, next: NextFunction) {
  try {
    let inst = await instRepo().findOneBy({ user_id: req.auth!.userId });
    if (!inst) {
      inst = instRepo().create({ user_id: req.auth!.userId, name: '' });
      await instRepo().save(inst);
    }
    res.json({ status: 'ok', data: inst });
  } catch (err) { next(err); }
}

export async function updateInstitution(req: Request, res: Response, next: NextFunction) {
  try {
    let inst = await instRepo().findOneBy({ user_id: req.auth!.userId });
    if (!inst) inst = instRepo().create({ user_id: req.auth!.userId });

    const allowed = ['name', 'cnpj', 'email', 'phone', 'address'] as const;
    for (const k of allowed) if (req.body[k] !== undefined) (inst as any)[k] = req.body[k];
    await instRepo().save(inst);
    res.json({ status: 'ok', data: inst });
  } catch (err) { next(err); }
}

// ── Usuários do sistema ─────────────────────
export async function listUsers(_req: Request, res: Response, next: NextFunction) {
  try {
    const users = await userRepo().find({ order: { full_name: 'ASC' } });
    const data = users.map((u) => ({
      id: u.id, name: u.full_name, email: u.email, role: u.role,
      status: u.is_active ? 'Ativo' : 'Inativo',
    }));
    res.json({ status: 'ok', data });
  } catch (err) { next(err); }
}

// Cria um novo profissional. Como ainda não existe fluxo de convite,
// geramos uma senha temporária aleatória (o usuário precisará de um "esqueci
// minha senha" para acessar — próximo passo natural de evolução do backend).
export async function createUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, email, role } = req.body;
    if (!name || !email) throw AppError.badRequest('Nome e e-mail obrigatórios');

    const exists = await userRepo().findOneBy({ email: String(email).toLowerCase().trim() });
    if (exists) throw AppError.conflict('E-mail já cadastrado');

    const user = new User();
    user.full_name = name;
    user.email = String(email).toLowerCase().trim();
    user.role = role || 'Enfermeira';
    await user.setPassword(crypto.randomBytes(16).toString('hex'));
    await userRepo().save(user);

    res.status(201).json({
      status: 'ok',
      data: { id: user.id, name: user.full_name, email: user.email, role: user.role, status: 'Ativo' },
    });
  } catch (err) { next(err); }
}

export async function updateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await userRepo().findOneBy({ id: req.params.id });
    if (!user) throw AppError.notFound();

    if (req.body.role !== undefined) user.role = req.body.role;
    if (req.body.name !== undefined) user.full_name = req.body.name;
    if (req.body.status !== undefined) user.is_active = req.body.status === 'Ativo';
    await userRepo().save(user);

    res.json({
      status: 'ok',
      data: { id: user.id, name: user.full_name, email: user.email, role: user.role, status: user.is_active ? 'Ativo' : 'Inativo' },
    });
  } catch (err) { next(err); }
}

export async function deleteUser(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await userRepo().delete({ id: req.params.id });
    if (!result.affected) throw AppError.notFound();
    res.json({ status: 'ok', message: 'Usuário removido' });
  } catch (err) { next(err); }
}

// ── Integrações ──────────────────────────────
const DEFAULT_INTEGRATIONS = [
  { name: 'WhatsApp Business API', description: 'Envio de notificações e lembretes por WhatsApp.', enabled: false },
  { name: 'E-mail transacional', description: 'Envio de relatórios e confirmações por e-mail.', enabled: false },
  { name: 'Backup automático na nuvem', description: 'Cópia de segurança diária dos dados do sistema.', enabled: false },
  { name: 'Assinatura digital de documentos', description: 'Assinatura eletrônica de laudos e termos.', enabled: false },
];

export async function listIntegrations(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.auth!.userId;
    const existing = await integRepo().find({ where: { user_id: userId } });
    if (existing.length === 0) {
      const created = DEFAULT_INTEGRATIONS.map((i) => integRepo().create({ ...i, user_id: userId }));
      await integRepo().save(created);
      return res.json({ status: 'ok', data: created });
    }
    res.json({ status: 'ok', data: existing });
  } catch (err) { next(err); }
}

export async function toggleIntegration(req: Request, res: Response, next: NextFunction) {
  try {
    const integration = await integRepo().findOneBy({ user_id: req.auth!.userId, name: req.params.name });
    if (!integration) throw AppError.notFound('Integração não encontrada');
    integration.enabled = Boolean(req.body.enabled);
    await integRepo().save(integration);
    res.json({ status: 'ok', data: integration });
  } catch (err) { next(err); }
}

// ── Segurança ────────────────────────────────
export async function updateSecurity(req: Request, res: Response, next: NextFunction) {
  try {
    const { currentPassword, newPassword, twoFactor, loginAlerts } = req.body;
    const user = await userRepo()
      .createQueryBuilder('u')
      .addSelect('u.password_hash')
      .where('u.id = :id', { id: req.auth!.userId })
      .getOne();
    if (!user) throw AppError.notFound();

    if (newPassword) {
      if (!currentPassword || !(await user.checkPassword(currentPassword))) {
        throw AppError.unauthorized('Senha atual incorreta');
      }
      await user.setPassword(newPassword);
    }
    if (twoFactor !== undefined) user.two_factor_enabled = Boolean(twoFactor);
    if (loginAlerts !== undefined) user.login_alerts = Boolean(loginAlerts);
    await userRepo().save(user);

    res.json({ status: 'ok', data: { twoFactor: user.two_factor_enabled, loginAlerts: user.login_alerts } });
  } catch (err) { next(err); }
}

// ── Backup ───────────────────────────────────
// Backup real em nível de aplicação: exporta os dados do usuário (pacientes,
// feridas, avaliações, agendamentos, estoque, prescrições...) para um JSON
// e salva em disco — não é um pg_dump do banco inteiro, mas é um backup de
// verdade dos dados da conta, restaurável programaticamente.
export async function getBackupInfo(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await userRepo().findOneBy({ id: req.auth!.userId });
    const last = await backupRepo().findOne({ where: { user_id: req.auth!.userId }, order: { created_at: 'DESC' } });
    res.json({
      status: 'ok',
      data: {
        when: last?.created_at || null,
        status: last ? 'Concluído com sucesso' : 'Nenhum backup realizado ainda',
        frequency: user?.backup_frequency || 'Diário',
      },
    });
  } catch (err) { next(err); }
}

export async function runBackup(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.auth!.userId;
    const tables = ['patients', 'wounds', 'evaluations', 'appointments', 'stock_items', 'stock_movements', 'prescriptions', 'patient_documents'];
    const dump: Record<string, any> = {};
    for (const table of tables) {
      dump[table] = await AppDataSource.query(`SELECT * FROM ${table} WHERE user_id = $1`, [userId]).catch(() => []);
    }

    const dir = path.join(env.upload.dir, 'backups');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const fileName = `backup_${userId}_${Date.now()}.json`;
    const filePath = path.join(dir, fileName);
    fs.writeFileSync(filePath, JSON.stringify(dump, null, 2));

    const log = backupRepo().create({ user_id: userId, status: 'completed', file_path: filePath });
    await backupRepo().save(log);

    res.status(201).json({ status: 'ok', data: { when: log.created_at, status: 'Concluído com sucesso' } });
  } catch (err) { next(err); }
}

export async function updateBackupFrequency(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await userRepo().findOneBy({ id: req.auth!.userId });
    if (!user) throw AppError.notFound();
    user.backup_frequency = req.body.frequency || user.backup_frequency;
    await userRepo().save(user);
    res.json({ status: 'ok', data: { frequency: user.backup_frequency } });
  } catch (err) { next(err); }
}
