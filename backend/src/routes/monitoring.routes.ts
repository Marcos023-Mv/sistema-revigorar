import { Router } from 'express';
import * as ctrl from '../controllers/monitoring.controller';

const router = Router();
router.get('/patients/:patientId/monitoring/messages', ctrl.getMessages);
router.post('/patients/:patientId/monitoring/messages', ctrl.sendMessage);
router.post('/patients/:patientId/monitoring/request-photo', ctrl.requestPhoto);
router.get('/patients/:patientId/monitoring/status', ctrl.getStatus);

export default router;
