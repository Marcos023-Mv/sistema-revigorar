import { Router } from 'express';
import * as appt from '../controllers/appointment.controller';
import * as fin from '../controllers/financial.controller';
import * as stk from '../controllers/stock.controller';

// --- Appointments ---
export const appointmentRoutes = Router();
appointmentRoutes.get('/', appt.list);
appointmentRoutes.post('/', appt.create);
appointmentRoutes.put('/:id', appt.update);
appointmentRoutes.delete('/:id', appt.remove);

// --- Financial ---
export const financialRoutes = Router();
financialRoutes.get('/', fin.list);
financialRoutes.get('/dashboard', fin.dashboard);
financialRoutes.post('/', fin.create);
financialRoutes.delete('/:id', fin.remove);

// --- Stock ---
export const stockRoutes = Router();
stockRoutes.get('/', stk.listItems);
stockRoutes.get('/alerts', stk.alerts);
stockRoutes.post('/', stk.createItem);
stockRoutes.put('/:id', stk.updateItem);
stockRoutes.post('/movement', stk.addMovement);
