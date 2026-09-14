import { Router } from 'express';
import * as ctrl from '../controllers/wound.controller';

const router = Router();

router.get('/patient/:patientId', ctrl.listByPatient);
router.get('/:id', ctrl.getById);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);

export default router;
