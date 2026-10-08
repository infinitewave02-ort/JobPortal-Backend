import { validate } from '../middleware/ValidationMiddleware.js';

export const validateJob = validate((data) => {
    const errors = [];
    if (!data.title) errors.push('title is required');
    if (!data.description) errors.push('description is required');
    if (!data.skills || !Array.isArray(data.skills)) errors.push('skills must be an array');
    if (!data.location) errors.push('location is required');
    if (!data.employmentType) errors.push('employmentType is required');
    return errors;
});
