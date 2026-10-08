import express from 'express';
import * as AdminController from '../controllers/AdminController.js';
import { verifyToken } from '../middleware/AuthMiddleware.js';
import { isAdmin } from '../middleware/AdminMiddleware.js';

const router = express.Router();

router.use(verifyToken, isAdmin);

// Dashboard
router.get('/dashboard', AdminController.getDashboardMetrics);
router.post('/dashboard/refresh', AdminController.refreshDashboardStats);

// User management
router.get('/users', AdminController.listUsers);
router.patch('/users/:id/status', AdminController.updateUserStatus);

// Management subcollections
router.get('/management/employees', AdminController.listEmployees);
router.get('/management/employers', AdminController.listEmployers);
router.get('/management/jobs', AdminController.listAllJobs);
router.get('/management/payments', AdminController.listAllPayments);

// Employer approval/rejection
router.patch('/employers/:id/status', AdminController.updateEmployerStatus);

export default router;
