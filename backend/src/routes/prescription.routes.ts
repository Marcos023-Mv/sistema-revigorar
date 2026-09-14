import { Router } from 'express';
import * as ctrl from '../controllers/prescription.controller';

const router = Router();
router.get('/dressing-catalog', ctrl.dressingCatalog);
router.get('/prescriptions', ctrl.listAll);
router.post('/prescriptions', ctrl.create);
router.put('/prescriptions/:id', ctrl.update);
router.delete('/prescriptions/:id', ctrl.remove);
router.get('/patients/:patientId/prescriptions', ctrl.listByPatient);
router.post('/patients/:patientId/prescriptions', ctrl.createForPatient);

export default router;
