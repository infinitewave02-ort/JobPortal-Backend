import express from 'express';
import * as ApplicationController from '../controllers/ApplicationController.js';
import { verifyToken } from '../middleware/AuthMiddleware.js';
import { isEmployee } from '../middleware/EmployeeMiddleware.js';
import { isEmployer } from '../middleware/EmployerMiddleware.js';

const router = express.Router();

router.use(verifyToken);
router.post('/', isEmployee, ApplicationController.submitApplication);
router.patch('/:id/status', isEmployer, ApplicationController.updateStatus);

export default router;
