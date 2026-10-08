import { errorResponse } from '../utils/Response.js';

export const notFoundHandler = (req, res, next) => {
    return errorResponse(res, 404, `API Route ${req.originalUrl} not found`);
};
