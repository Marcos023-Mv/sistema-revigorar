import { Router } from 'express';
import * as ctrl from '../controllers/report.controller';

const router = Router();
router.get('/reports', ctrl.listReports);
router.get('/reports/weekdays', ctrl.weekdays);
router.get('/reports/distribution', ctrl.distribution);

export default router;
