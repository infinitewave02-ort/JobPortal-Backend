import express from 'express';
import * as JobController from '../controllers/JobController.js';
import { verifyToken } from '../middleware/AuthMiddleware.js';
import { isEmployer } from '../middleware/EmployerMiddleware.js';

const router = express.Router();

// Public / Semi-public listing
router.get('/', JobController.listJobs);
router.get('/:id', JobController.getJobById);

// Employer restricted
router.post('/', verifyToken, isEmployer, JobController.createJob);
router.get('/employer/my-jobs', verifyToken, isEmployer, JobController.getMyJobs);
router.put('/:id', verifyToken, isEmployer, JobController.updateJob);
router.delete('/:id', verifyToken, isEmployer, JobController.deleteJob);

export default router;
