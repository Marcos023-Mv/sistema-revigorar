import { Router } from 'express';
import * as ctrl from '../controllers/evaluation.controller';

const router = Router();

router.get('/wound/:woundId', ctrl.listByWound);
router.get('/:id', ctrl.getById);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);

export default router;
