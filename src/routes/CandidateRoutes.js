import express from 'express';
import * as CandidateController from '../controllers/CandidateController.js';
import { verifyToken } from '../middleware/AuthMiddleware.js';
import { isEmployer } from '../middleware/EmployerMiddleware.js';

const router = express.Router();

router.use(verifyToken, isEmployer);
router.get('/', CandidateController.searchCandidates);
router.get('/open-to-work', CandidateController.getOpenToWorkCandidates);
router.get('/:id', CandidateController.getCandidateById);

export default router;
