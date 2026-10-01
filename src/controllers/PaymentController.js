import * as paymentService from '../services/PaymentService.js';
import { successResponse } from '../utils/Response.js';

export const createPayment = async (req, res, next) => {
    try {
        const userId = req.user.uid;
        const result = await paymentService.createPayment(userId, req.body);
        return successResponse(res, 201, 'Payment initialized successfully', result);
    } catch (error) {
        next(error); // Passes to error middleware
    }
};

export const verifyPayment = async (req, res, next) => {
    try {
        const userId = req.user.uid;
        const result = await paymentService.verifyPayment(userId, req.body);
        return successResponse(res, 200, 'Payment verified successfully', result);
    } catch (error) {
        next(error);
    }
};
