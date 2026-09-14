import { Router } from 'express';
import * as ctrl from '../controllers/document.controller';
import { uploadDocument } from '../config/upload';

const router = Router();
router.get('/patients/:patientId/documents', ctrl.list);
router.post('/patients/:patientId/documents', uploadDocument.single('document'), ctrl.add);
router.get('/patients/:patientId/documents/:name/download', ctrl.download);

export default router;
