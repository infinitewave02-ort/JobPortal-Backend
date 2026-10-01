import express from 'express';
import * as EmployeeController from '../controllers/EmployeeController.js';
import { verifyToken } from '../middleware/AuthMiddleware.js';
import { isEmployee } from '../middleware/EmployeeMiddleware.js';

const router = express.Router();

router.use(verifyToken, isEmployee);
router.get('/', EmployeeController.getProfile);
router.put('/', EmployeeController.updateProfile);

export default router;
