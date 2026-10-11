import express from 'express';
import * as CandidateController from '../controllers/CandidateController.js';
import { optionalToken } from '../middleware/AuthMiddleware.js';

const router = express.Router();

router.use(optionalToken);
router.get('/', CandidateController.searchCandidates);
router.get('/open-to-work', CandidateController.getOpenToWorkCandidates);
router.get('/:id', CandidateController.getCandidateById);

export default router;

