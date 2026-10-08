import { errorResponse } from '../utils/Response.js';

// Generic validation middleware that accepts a schema validation function
export const validate = (schemaValidator) => {
    return (req, res, next) => {
        const errors = schemaValidator(req.body);
        if (errors && errors.length > 0) {
            return errorResponse(res, 400, 'Validation failed', errors);
        }
        next();
    };
};
