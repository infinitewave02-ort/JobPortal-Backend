import express from 'express';
import * as paymentController from '../controllers/PaymentController.js';
import { verifyToken } from '../middleware/AdminMiddleware.js';

const router = express.Router();

// Require user to be authenticated
router.use(verifyToken);

router.post('/create', paymentController.createPayment);
router.post('/verify', paymentController.verifyPayment);

export default router;
