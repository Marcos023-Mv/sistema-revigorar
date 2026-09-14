import { Router } from 'express';
import * as ctrl from '../controllers/settings.controller';

const router = Router();
router.get('/settings/institution', ctrl.getInstitution);
router.put('/settings/institution', ctrl.updateInstitution);

router.get('/users', ctrl.listUsers);
router.post('/users', ctrl.createUser);
router.put('/users/:id', ctrl.updateUser);
router.delete('/users/:id', ctrl.deleteUser);

router.get('/settings/integrations', ctrl.listIntegrations);
router.patch('/settings/integrations/:name', ctrl.toggleIntegration);

router.put('/settings/security', ctrl.updateSecurity);

router.get('/settings/backup', ctrl.getBackupInfo);
router.post('/settings/backup/run', ctrl.runBackup);
router.put('/settings/backup/frequency', ctrl.updateBackupFrequency);

export default router;
