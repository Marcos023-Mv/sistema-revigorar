import { Router } from 'express';
import * as ctrl from '../controllers/dashboard.controller';

const router = Router();
router.get('/dashboard/stats', ctrl.stats);
router.get('/dashboard/weekly-series', ctrl.weeklySeries);
router.get('/dashboard/distribution', ctrl.distribution);

export default router;
