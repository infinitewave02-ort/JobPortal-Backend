import express from 'express';
import * as MessageController from '../controllers/MessageController.js';
import { verifyToken } from '../middleware/AuthMiddleware.js';

const router = express.Router();

router.use(verifyToken);
router.post('/', MessageController.sendMessage);
router.get('/conversations', MessageController.getConversations);
router.get('/:userId', MessageController.getMessages);
router.delete('/:id', MessageController.deleteMessage);

export default router;
