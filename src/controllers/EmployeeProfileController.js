import { successResponse } from '../utils/Response.js';
import * as employeeProfileService from '../services/ProfileService.js';

export const getProfile = async (req, res, next) => {
    try {
        const employeeId = req.user.uid;
        // Profile is fetched from EMPLOYEE/employees/{uid}
        return successResponse(res, 200, 'Employee profile fetched successfully', { employeeId });
    } catch (error) {
        next(error);
    }
};

export const updateBasicProfile = async (req, res, next) => {
    try {
        const employeeId = req.user.uid;
        const profile = await employeeProfileService.updateBasicProfile(employeeId, req.body);
        return successResponse(res, 200, 'Basic profile updated successfully', profile);
    } catch (error) {
        next(error);
    }
};

export const updateProfessionalProfile = async (req, res, next) => {
    try {
        const employeeId = req.user.uid;
        const profile = await employeeProfileService.updateProfessionalProfile(employeeId, req.body);
        return successResponse(res, 200, 'Professional profile updated successfully', profile);
    } catch (error) {
        next(error);
    }
};

export const setOpenToWork = async (req, res, next) => {
    try {
        const employeeId = req.user.uid;
        const { openToWork } = req.body;
        const result = await employeeProfileService.setOpenToWork(employeeId, openToWork);
        return successResponse(res, 200, 'Open to work status updated successfully', result);
    } catch (error) {
        next(error);
    }
};
