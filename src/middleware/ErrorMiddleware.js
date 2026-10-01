import { errorResponse } from '../utils/Response.js';

export const errorHandler = (err, req, res, next) => {
    console.error('API Error:', err.stack || err.message);
    
    const statusCode = err.statusCode || 400; // Default to 400 for validation logic
    const message = err.message || 'An unexpected error occurred';

    // Avoid exposing internal stack traces in production
    const isDev = process.env.NODE_ENV === 'development';
    return errorResponse(res, statusCode, message, isDev ? err.stack : null);
};
