import { errorResponse } from '../utils/Response.js';

export const errorHandler = (err, req, res, next) => {
    console.error('API Error:', err.stack || err.message);
    
    let statusCode = err.statusCode || 500;
    let message = err.message || 'An unexpected error occurred';
    
    // Check if it's a firebase auth error
    if (err.code && typeof err.code === 'string' && err.code.startsWith('auth/')) {
        statusCode = 400;
    }
    
    // Use 400 for explicit bad requests
    if (err.statusCode === 400) {
        statusCode = 400;
    }

    // Avoid exposing internal stack traces in production
    const isDev = process.env.NODE_ENV === 'development';
    return errorResponse(res, statusCode, message, isDev ? err.stack : null);
};
