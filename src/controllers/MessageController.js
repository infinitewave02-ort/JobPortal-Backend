import { successResponse } from '../utils/Response.js';
// import * as messageService from '../services/MessageService.js';

export const sendMessage = async (req, res, next) => {
    try {
        const senderId = req.user.uid;
        // const message = await messageService.sendMessage(senderId, req.body);
        return successResponse(res, 201, 'Message sent successfully', { senderId });
    } catch (error) {
        next(error);
    }
};

export const getMessages = async (req, res, next) => {
    try {
        const userId = req.user.uid;
        const { userId: otherUserId } = req.params; // If fetching conversation
        // const messages = await messageService.getMessages(userId, otherUserId);
        return successResponse(res, 200, 'Messages fetched successfully', []);
    } catch (error) {
        next(error);
    }
};

export const markAsRead = async (req, res, next) => {
    try {
        const { id } = req.params;
        // await messageService.markAsRead(id);
        return successResponse(res, 200, 'Message marked as read', { id });
    } catch (error) {
        next(error);
    }
};
