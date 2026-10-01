import { validate } from '../middleware/ValidationMiddleware.js';

export const validateSyncUser = validate((data) => {
    const errors = [];
    if (!data.email) errors.push('email is required');
    if (!data.role) errors.push('role is required');
    return errors;
});
