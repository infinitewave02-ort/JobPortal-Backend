import { successResponse } from '../utils/Response.js';
import * as companyService from '../services/CompanyService.js';

export const getCompanyProfile = async (req, res, next) => {
    try {
        const employerId = req.user.uid;
        const company = await companyService.getCompanyProfileByEmployerId(employerId);
        return successResponse(res, 200, 'Company profile fetched successfully', company);
    } catch (error) {
        next(error);
    }
};

export const getCompanyById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const company = await companyService.getCompanyById(id);
        return successResponse(res, 200, 'Company fetched successfully', company);
    } catch (error) {
        next(error);
    }
};

export const updateCompanyProfile = async (req, res, next) => {
    try {
        const employerId = req.user.uid;
        const company = await companyService.updateCompanyProfile(employerId, req.body);
        return successResponse(res, 200, 'Company profile updated successfully', company);
    } catch (error) {
        next(error);
    }
};

export const uploadCompanyLogo = async (req, res, next) => {
    try {
        const employerId = req.user.uid;
        const file = req.file;
        if (!file) throw new Error('No image file provided');

        const logoUrl = await companyService.uploadCompanyLogo(employerId, file);
        return successResponse(res, 200, 'Company logo uploaded successfully', { logoUrl });
    } catch (error) {
        next(error);
    }
};
