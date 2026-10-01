import { successResponse } from '../utils/Response.js';
import * as adminService from '../services/AdminService.js';

export const getDashboardMetrics = async (req, res, next) => {
    try {
        const metrics = await adminService.getDashboardMetrics();
        return successResponse(res, 200, 'Dashboard metrics fetched successfully', {
            totalEmployees: 0, totalEmployers: 0, activeJobPosts: 0, openToWork: 0
        });
    } catch (error) {
        next(error);
    }
};

export const listUsers = async (req, res, next) => {
    try {
        // const users = await adminService.listUsers(req.query);
        return successResponse(res, 200, 'Users fetched successfully', []);
    } catch (error) {
        next(error);
    }
};

export const updateUserStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        // const result = await adminService.updateUserStatus(id, status);
        return successResponse(res, 200, 'User status updated successfully', { id, status });
    } catch (error) {
        next(error);
    }
};

export const updateEmployerStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        // const result = await adminService.updateEmployerStatus(id, status);
        return successResponse(res, 200, 'Employer status updated successfully', { id, status });
    } catch (error) {
        next(error);
    }
};
