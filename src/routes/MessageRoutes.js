import express from 'express';
import * as MessageController from '../controllers/MessageController.js';
import { verifyToken } from '../middleware/AuthMiddleware.js';

const router = express.Router();

router.use(verifyToken);
router.post('/', MessageController.sendMessage);
router.get('/:userId', MessageController.getMessages);
router.patch('/:id/read', MessageController.markAsRead);

export default router;
