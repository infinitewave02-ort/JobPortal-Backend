import { successResponse } from '../utils/Response.js';
import * as notificationService from '../services/NotificationService.js';

export const getNotifications = async (req, res, next) => {
    try {
        const userId = req.user.uid;
        const notifications = await notificationService.getNotifications(userId);
        return successResponse(res, 200, 'Notifications fetched successfully', notifications);
    } catch (error) {
        next(error);
    }
};

export const markAsRead = async (req, res, next) => {
    try {
        const userId = req.user.uid;
        const { id } = req.params;
        const result = await notificationService.markAsRead(userId, id);
        return successResponse(res, 200, 'Notification marked as read', result);
    } catch (error) {
        next(error);
    }
};

export const markAllAsRead = async (req, res, next) => {
    try {
        const userId = req.user.uid;
        const result = await notificationService.markAllAsRead(userId);
        return successResponse(res, 200, 'All notifications marked as read', result);
    } catch (error) {
        next(error);
    }
};

export const deleteNotification = async (req, res, next) => {
    try {
        const userId = req.user.uid;
        const { id } = req.params;
        await notificationService.deleteNotification(userId, id);
        return successResponse(res, 200, 'Notification deleted successfully', { id });
    } catch (error) {
        next(error);
    }
};
