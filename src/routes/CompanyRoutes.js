import express from 'express';
import * as CompanyController from '../controllers/CompanyController.js';
import { verifyToken } from '../middleware/AuthMiddleware.js';
import { isEmployer } from '../middleware/EmployerMiddleware.js';
import { uploadImage } from '../middleware/UploadMiddleware.js';

const router = express.Router();

router.use(verifyToken);
router.get('/', isEmployer, CompanyController.getCompanyProfile);
router.put('/', isEmployer, CompanyController.updateCompanyProfile);
router.post('/logo', isEmployer, uploadImage.single('logo'), CompanyController.uploadCompanyLogo);
router.get('/:id', CompanyController.getCompanyById);

export default router;
