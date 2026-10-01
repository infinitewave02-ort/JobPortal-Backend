import express from 'express';
import * as EmployeeProfileController from '../controllers/EmployeeProfileController.js';
import { verifyToken } from '../middleware/AuthMiddleware.js';
import { isEmployee } from '../middleware/EmployeeMiddleware.js';

const router = express.Router();

router.use(verifyToken, isEmployee);
router.get('/', EmployeeProfileController.getProfile);
router.put('/basic', EmployeeProfileController.updateBasicProfile);
router.put('/professional', EmployeeProfileController.updateProfessionalProfile);
router.patch('/open-to-work', EmployeeProfileController.setOpenToWork);

export default router;
