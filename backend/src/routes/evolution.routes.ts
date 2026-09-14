import { Router } from 'express';
import * as ctrl from '../controllers/evolution.controller';

const router = Router();
router.get('/evolutions/feed', ctrl.feed);
router.get('/patients/:patientId/records', ctrl.records);
router.get('/patients/:patientId/evolution-timeline', ctrl.timeline);

export default router;
