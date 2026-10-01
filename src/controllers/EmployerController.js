import { successResponse } from '../utils/Response.js';
// import * as employerService from '../services/EmployerService.js';

export const getCompanyProfile = async (req, res, next) => {
    try {
        const { uid } = req.user;
        // const company = await employerService.getCompanyProfile(uid);
        return successResponse(res, 200, 'Company profile fetched successfully', { uid });
    } catch (error) {
        next(error);
    }
};

export const updateCompanyProfile = async (req, res, next) => {
    try {
        const { uid } = req.user;
        // const company = await employerService.updateCompanyProfile(uid, req.body);
        return successResponse(res, 200, 'Company profile updated successfully', { uid });
    } catch (error) {
        next(error);
    }
};

export const uploadCompanyLogo = async (req, res, next) => {
    try {
        const { uid } = req.user;
        const file = req.file;
        if (!file) throw new Error('No image file provided');
        
        // const logoUrl = await employerService.uploadCompanyLogo(uid, file);
        return successResponse(res, 200, 'Company logo uploaded successfully', { logoUrl: 'mock_url' });
    } catch (error) {
        next(error);
    }
};
