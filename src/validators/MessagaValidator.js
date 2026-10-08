import { validate } from '../middleware/ValidationMiddleware.js';

export const validateMessage = validate((data) => {
    const errors = [];
    if (!data.receiverId) errors.push('receiverId is required');
    if (!data.message) errors.push('message is required');
    if (!data.type) errors.push('type is required');
    return errors;
});
