import { successResponse } from '../utils/Response.js';
// import * as employeeService from '../services/EmployeeService.js';

export const getProfile = async (req, res, next) => {
    try {
        const { uid } = req.user;
        // const profile = await employeeService.getProfile(uid);
        return successResponse(res, 200, 'Employee profile fetched successfully', { uid });
    } catch (error) {
        next(error);
    }
};

export const updateProfile = async (req, res, next) => {
    try {
        const { uid } = req.user;
        // const profile = await employeeService.updateProfile(uid, req.body);
        return successResponse(res, 200, 'Employee profile updated successfully', { uid, ...req.body });
    } catch (error) {
        next(error);
    }
};

export const updateBasicProfile = async (req, res, next) => {
    try {
        const { uid } = req.user;
        // const profile = await employeeService.updateBasicProfile(uid, req.body);
        return successResponse(res, 200, 'Basic profile updated successfully', { uid });
    } catch (error) {
        next(error);
    }
};

export const updateProfessionalProfile = async (req, res, next) => {
    try {
        const { uid } = req.user;
        // const profile = await employeeService.updateProfessionalProfile(uid, req.body);
        return successResponse(res, 200, 'Professional profile updated successfully', { uid });
    } catch (error) {
        next(error);
    }
};
