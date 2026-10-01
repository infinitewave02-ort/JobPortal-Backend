import express from 'express';
import * as PlanController from '../controllers/PlanController.js';
import { verifyToken } from '../middleware/AuthMiddleware.js';
import { isAdmin } from '../middleware/AdminMiddleware.js';

const router = express.Router();

// Public
router.get('/', PlanController.listPlans);
router.get('/:id', PlanController.getPlanById);

// Admin
router.post('/', verifyToken, isAdmin, PlanController.createPlan);

export default router;
