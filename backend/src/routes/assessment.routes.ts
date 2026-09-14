import { Router } from 'express';
import * as ctrl from '../controllers/assessment.controller';

const router = Router();
router.get('/assessments', ctrl.listAssessments);
router.get('/patients/:patientId/wound-assessment', ctrl.getWoundAssessment);
router.put('/patients/:patientId/wound-assessment/:section', ctrl.saveWoundAssessmentSection);

export default router;
