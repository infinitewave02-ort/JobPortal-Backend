import { validate } from '../middleware/ValidationMiddleware.js';

export const validateEmployerRegistration = validate((data) => {
    const errors = [];
    if (!data.name) errors.push('name is required');
    if (!data.companyName) errors.push('companyName is required');
    return errors;
});

export const validateCompanyProfile = validate((data) => {
    const errors = [];
    if (!data.companyName) errors.push('companyName is required');
    if (!data.industry) errors.push('industry is required');
    if (!data.email) errors.push('email is required');
    return errors;
});
