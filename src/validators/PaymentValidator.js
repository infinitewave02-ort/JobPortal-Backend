import { validate } from '../middleware/ValidationMiddleware.js';

export const validateCreatePayment = validate((data) => {
    const errors = [];
    if (!data.planId) errors.push('planId is required');
    if (!data.paymentMethod) errors.push('paymentMethod is required');
    return errors;
});

export const validateVerifyPayment = validate((data) => {
    const errors = [];
    if (!data.paymentId) errors.push('paymentId is required');
    if (!data.transactionId) errors.push('transactionId is required');
    return errors;
});
