import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { StockItem } from '../models/StockItem';
import { StockMovement } from '../models/StockMovement';
import { AppError } from '../utils/AppError';

const itemRepo = () => AppDataSource.getRepository(StockItem);
const movRepo  = () => AppDataSource.getRepository(StockMovement);

export async function listItems(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await itemRepo().find({
      where: { user_id: req.auth!.userId, is_active: true },
      order: { name: 'ASC' },
    });
    res.json({ status: 'ok', data });
  } catch (err) { next(err); }
}

export async function createItem(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, unit, quantity, min_quantity, expiry_date, unit_cost, category } = req.body;
    if (!name || !unit) throw AppError.badRequest('Nome e unidade obrigatórios');

    const item = itemRepo().create({
      user_id: req.auth!.userId,
      name, unit, quantity: quantity || 0, min_quantity: min_quantity || 0,
      expiry_date, unit_cost, category,
    });
    await itemRepo().save(item);
    res.status(201).json({ status: 'ok', data: item });
  } catch (err) { next(err); }
}

export async function updateItem(req: Request, res: Response, next: NextFunction) {
  try {
    const item = await itemRepo().findOneBy({ id: req.params.id, user_id: req.auth!.userId });
    if (!item) throw AppError.notFound();

    const allowed = ['name','unit','min_quantity','expiry_date','unit_cost','category','is_active'] as const;
    for (const k of allowed) if (req.body[k] !== undefined) (item as any)[k] = req.body[k];
    await itemRepo().save(item);
    res.json({ status: 'ok', data: item });
  } catch (err) { next(err); }
}

export async function addMovement(req: Request, res: Response, next: NextFunction) {
  try {
    const { item_id, direction, quantity, reason, evaluation_id } = req.body;
    if (!item_id || !direction || !quantity) throw AppError.badRequest('Item, direção e quantidade obrigatórios');

    const item = await itemRepo().findOneBy({ id: item_id, user_id: req.auth!.userId });
    if (!item) throw AppError.notFound('Item não encontrado');

    if (direction === 'in') {
      item.quantity = parseFloat(String(item.quantity)) + parseFloat(quantity);
    } else {
      if (parseFloat(String(item.quantity)) < parseFloat(quantity)) {
        throw AppError.badRequest('Estoque insuficiente');
      }
      item.quantity = parseFloat(String(item.quantity)) - parseFloat(quantity);
    }

    const mov = movRepo().create({ item_id, direction, quantity, reason, evaluation_id });
    await AppDataSource.transaction(async (em) => {
      await em.save(item);
      await em.save(mov);
    });

    res.status(201).json({ status: 'ok', data: { item, movement: mov } });
  } catch (err) { next(err); }
}

export async function alerts(req: Request, res: Response, next: NextFunction) {
  try {
    const items = await itemRepo()
      .createQueryBuilder('s')
      .where('s.user_id = :uid AND s.is_active = true', { uid: req.auth!.userId })
      .andWhere('(s.quantity <= s.min_quantity OR s.expiry_date <= CURRENT_DATE + INTERVAL \'30 days\')')
      .orderBy('s.quantity', 'ASC')
      .getMany();
    res.json({ status: 'ok', data: items });
  } catch (err) { next(err); }
}
