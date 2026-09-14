import { Router } from 'express';
import * as ctrl from '../controllers/auth.controller';
import { authGuard } from '../middleware/auth';

const router = Router();

router.post('/register', ctrl.register);
router.post('/login', ctrl.login);
router.get('/profile', authGuard, ctrl.profile);
router.put('/profile', authGuard, ctrl.updateProfile);

export default router;
