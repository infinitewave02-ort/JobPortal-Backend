import express from 'express';
import * as AdminController from '../controllers/AdminController.js';
import { verifyToken } from '../middleware/AuthMiddleware.js';
import { isAdmin } from '../middleware/AdminMiddleware.js';

const router = express.Router();

// Public & Management Endpoints
router.post('/login', AdminController.login);

// Dashboard
router.get('/dashboard', AdminController.getDashboardMetrics);
router.post('/dashboard/refresh', AdminController.refreshDashboardStats);

// Employees
router.get('/employees', AdminController.listEmployees);
router.get('/management/employees', AdminController.listEmployees);
router.delete('/employees/:id', AdminController.deleteEmployee);

// Employers & Approvals
router.get('/employers', AdminController.listEmployers);
router.get('/management/employers', AdminController.listEmployers);
router.patch('/employers/:id/approve', AdminController.approveEmployer);
router.put('/employers/:id/approve', AdminController.approveEmployer);
router.patch('/employers/:id/status', AdminController.updateEmployerStatus);
router.put('/employers/:id/status', AdminController.updateEmployerStatus);
router.delete('/employers/:id', AdminController.deleteEmployer);

// Jobs & Approvals
router.get('/jobs', AdminController.listAllJobs);
router.get('/management/jobs', AdminController.listAllJobs);
router.get('/jobs/:id', AdminController.getJobDetails);
router.put('/jobs/:id/approve', AdminController.approveJob);
router.patch('/jobs/:id/approve', AdminController.approveJob);
router.put('/jobs/:id/status', AdminController.updateJobStatus);
router.patch('/jobs/:id/status', AdminController.updateJobStatus);
router.delete('/jobs/:id', AdminController.deleteJob);

// Payments & Users
router.get('/payments', AdminController.listAllPayments);
router.get('/management/payments', AdminController.listAllPayments);
router.patch('/payments/:id/status', AdminController.updatePaymentStatus);
router.put('/payments/:id/status', AdminController.updatePaymentStatus);
router.get('/users', AdminController.listUsers);
router.patch('/users/:id/status', AdminController.updateUserStatus);

router.use(verifyToken, isAdmin);

// Admin Profile & Credentials Management (Protected)
router.get('/profile', AdminController.getProfile);
router.put('/profile', AdminController.updateProfile);
router.patch('/profile', AdminController.updateProfile);


export default router;
