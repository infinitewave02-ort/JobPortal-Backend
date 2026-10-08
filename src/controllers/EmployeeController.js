import { successResponse } from '../utils/Response.js';
import * as employeeService from '../services/EmployeeService.js';

export const getProfile = async (req, res, next) => {
    try {
        const { uid } = req.user;
        const profile = await employeeService.getProfile(uid);
        return successResponse(res, 200, 'Employee profile fetched successfully', profile);
    } catch (error) {
        next(error);
    }
};

export const updateProfile = async (req, res, next) => {
    try {
        const { uid } = req.user;
        const profile = await employeeService.updateProfile(uid, req.body);
        return successResponse(res, 200, 'Employee profile updated successfully', profile);
    } catch (error) {
        next(error);
    }
};

export const updateBasicProfile = async (req, res, next) => {
    try {
        const { uid } = req.user;
        const profile = await employeeService.updateProfile(uid, req.body);
        return successResponse(res, 200, 'Basic profile updated successfully', profile);
    } catch (error) {
        next(error);
    }
};

export const updateProfessionalProfile = async (req, res, next) => {
    try {
        const { uid } = req.user;
        const profile = await employeeService.updateProfile(uid, req.body);
        return successResponse(res, 200, 'Professional profile updated successfully', profile);
    } catch (error) {
        next(error);
    }
};
