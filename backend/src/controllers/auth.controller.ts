import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { User } from '../models/User';
import { signToken } from '../middleware/auth';
import { AppError } from '../utils/AppError';

const userRepo = () => AppDataSource.getRepository(User);

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { full_name, email, password, phone, professional_license, specialization } = req.body;

    if (!full_name || !email || !password) {
      throw AppError.badRequest('Nome, e-mail e senha são obrigatórios');
    }

    const exists = await userRepo().findOneBy({ email });
    if (exists) throw AppError.conflict('E-mail já cadastrado');

    const user = new User();
    user.full_name = full_name;
    user.email = email.toLowerCase().trim();
    user.phone = phone || null;
    user.professional_license = professional_license || null;
    user.specialization = specialization || null;
    await user.setPassword(password);

    await userRepo().save(user);

    const token = signToken({ userId: user.id, email: user.email });

    res.status(201).json({
      status: 'ok',
      data: {
        user: { id: user.id, full_name: user.full_name, email: user.email, plan: user.plan },
        token,
      },
    });
  } catch (err) { next(err); }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;
    if (!email || !password) throw AppError.badRequest('E-mail e senha são obrigatórios');

    const user = await userRepo()
      .createQueryBuilder('u')
      .addSelect('u.password_hash')
      .where('u.email = :email', { email: email.toLowerCase().trim() })
      .getOne();

    if (!user || !(await user.checkPassword(password))) {
      throw AppError.unauthorized('Credenciais inválidas');
    }

    user.last_login = new Date();
    await userRepo().save(user);

    const token = signToken({ userId: user.id, email: user.email });

    res.json({
      status: 'ok',
      data: {
        user: { id: user.id, full_name: user.full_name, email: user.email, plan: user.plan },
        token,
      },
    });
  } catch (err) { next(err); }
}

export async function profile(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await userRepo().findOneBy({ id: req.auth!.userId });
    if (!user) throw AppError.notFound('Usuário não encontrado');

    res.json({ status: 'ok', data: user });
  } catch (err) { next(err); }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await userRepo().findOneBy({ id: req.auth!.userId });
    if (!user) throw AppError.notFound();

    const allowed = ['full_name', 'phone', 'professional_license', 'specialization'] as const;
    for (const key of allowed) {
      if (req.body[key] !== undefined) (user as any)[key] = req.body[key];
    }
    await userRepo().save(user);

    res.json({ status: 'ok', data: user });
  } catch (err) { next(err); }
}
