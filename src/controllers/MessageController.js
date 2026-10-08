import { successResponse } from '../utils/Response.js';
import * as messageService from '../services/MessageService.js';

export const sendMessage = async (req, res, next) => {
    try {
        const senderId = req.user.uid;
        const message = await messageService.sendMessage(senderId, req.body);
        return successResponse(res, 201, 'Message sent successfully', message);
    } catch (error) {
        next(error);
    }
};

export const getMessages = async (req, res, next) => {
    try {
        const userId = req.user.uid;
        const { userId: otherUserId } = req.params;
        const messages = await messageService.getMessages(userId, otherUserId);
        return successResponse(res, 200, 'Messages fetched successfully', messages);
    } catch (error) {
        next(error);
    }
};

export const getConversations = async (req, res, next) => {
    try {
        const userId = req.user.uid;
        const conversations = await messageService.getConversations(userId);
        return successResponse(res, 200, 'Conversations fetched successfully', conversations);
    } catch (error) {
        next(error);
    }
};

export const deleteMessage = async (req, res, next) => {
    try {
        const { id } = req.params;
        await messageService.deleteMessage(id);
        return successResponse(res, 200, 'Message deleted successfully', { id });
    } catch (error) {
        next(error);
    }
};
