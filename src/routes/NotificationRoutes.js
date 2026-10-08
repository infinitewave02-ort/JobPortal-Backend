import express from 'express';
import * as NotificationController from '../controllers/NotificationController.js';
import { verifyToken } from '../middleware/AuthMiddleware.js';

const router = express.Router();

router.use(verifyToken);
router.get('/', NotificationController.getNotifications);
router.patch('/read-all', NotificationController.markAllAsRead);
router.patch('/:id/read', NotificationController.markAsRead);
router.delete('/:id', NotificationController.deleteNotification);

export default router;
