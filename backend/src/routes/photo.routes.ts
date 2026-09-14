import { Router } from 'express';
import * as ctrl from '../controllers/photo.controller';
import { uploadPhoto } from '../config/upload';

const router = Router();
router.get('/photos', ctrl.listPatientsWithPhotos);
router.get('/patients/:patientId/photos', ctrl.getPatientPhotos);
router.post('/patients/:patientId/photos', uploadPhoto.single('photo'), ctrl.uploadPatientPhoto);

export default router;
