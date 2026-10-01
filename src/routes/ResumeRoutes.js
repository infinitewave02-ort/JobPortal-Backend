import express from 'express';
import * as ResumeController from '../controllers/ResumeController.js';
import { verifyToken } from '../middleware/AuthMiddleware.js';
import { isEmployee } from '../middleware/EmployeeMiddleware.js';
import { uploadResume } from '../middleware/UploadMiddleware.js';

const router = express.Router();

router.use(verifyToken, isEmployee);
router.get('/', ResumeController.listResumes);
router.post('/upload', uploadResume.single('resume'), ResumeController.uploadResume);
router.delete('/:id', ResumeController.deleteResume);

export default router;
