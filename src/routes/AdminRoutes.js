import express from 'express';
import * as AdminController from '../controllers/AdminController.js';
import { verifyToken } from '../middleware/AuthMiddleware.js';
import { isAdmin } from '../middleware/AdminMiddleware.js';

const router = express.Router();

router.use(verifyToken, isAdmin);

router.get('/dashboard', AdminController.getDashboardMetrics);
router.get('/users', AdminController.listUsers);
router.patch('/users/:id/status', AdminController.updateUserStatus);
router.patch('/employers/:id/status', AdminController.updateEmployerStatus);

export default router;
