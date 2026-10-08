import { validate } from '../middleware/ValidationMiddleware.js';

export const validateCreateApplication = validate((data) => {
    const errors = [];
    if (!data.jobId) errors.push('jobId is required');
    if (!data.resumeId) errors.push('resumeId is required');
    return errors;
});

export const validateUpdateApplicationStatus = validate((data) => {
    const errors = [];
    const validStatuses = ['applied', 'shortlisted', 'interview', 'selected', 'rejected'];
    if (!data.status) errors.push('status is required');
    else if (!validStatuses.includes(data.status)) errors.push('Invalid status value');
    return errors;
});
