import express from 'express';
import * as PaymentController from '../controllers/PaymentController.js';
import { verifyToken } from '../middleware/AuthMiddleware.js';

const router = express.Router();

router.use(verifyToken);
router.post('/create', PaymentController.createPayment);
router.post('/verify', PaymentController.verifyPayment);

export default router;
