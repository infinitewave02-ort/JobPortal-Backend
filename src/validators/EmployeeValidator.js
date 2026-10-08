import { validate } from '../middleware/ValidationMiddleware.js';

export const validateBasicProfile = validate((data) => {
    const errors = [];
    if (!data.name) errors.push('name is required');
    if (!data.phone) errors.push('phone is required');
    return errors;
});

export const validateProfessionalProfile = validate((data) => {
    const errors = [];
    if (data.skills && !Array.isArray(data.skills)) errors.push('skills must be an array');
    if (data.experience && typeof data.experience !== 'number') errors.push('experience must be a number');
    return errors;
});
