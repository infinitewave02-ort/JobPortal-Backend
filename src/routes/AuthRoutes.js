import express from 'express';
import * as AuthController from '../controllers/AuthController.js';
import { verifyToken } from '../middleware/AuthMiddleware.js';

const router = express.Router();

router.post('/register', AuthController.registerEmployee);
router.post('/sync', verifyToken, AuthController.syncUser);
router.get('/me', verifyToken, AuthController.getMe);

export default router;
