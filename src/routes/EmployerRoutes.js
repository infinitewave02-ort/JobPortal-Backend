import express from 'express';
import * as EmployerController from '../controllers/EmployerController.js';
import { verifyToken } from '../middleware/AuthMiddleware.js';
import { isEmployer } from '../middleware/EmployerMiddleware.js';
import { uploadImage } from '../middleware/UploadMiddleware.js';

const router = express.Router();

router.use(verifyToken, isEmployer);

router.get('/profile', EmployerController.getCompanyProfile);
router.put('/profile', EmployerController.updateCompanyProfile);
router.post('/logo', uploadImage.single('logo'), EmployerController.uploadCompanyLogo);

export default router;
