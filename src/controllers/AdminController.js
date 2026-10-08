import { successResponse } from '../utils/Response.js';
import * as adminService from '../services/AdminService.js';

export const getDashboardMetrics = async (req, res, next) => {
    try {
        const adminId = req.user.uid;
        const metrics = await adminService.getDashboardMetrics(adminId);
        return successResponse(res, 200, 'Dashboard metrics fetched successfully', metrics);
    } catch (error) {
        next(error);
    }
};

export const refreshDashboardStats = async (req, res, next) => {
    try {
        const adminId = req.user.uid;
        const stats = await adminService.refreshDashboardStats(adminId);
        return successResponse(res, 200, 'Dashboard stats refreshed successfully', stats);
    } catch (error) {
        next(error);
    }
};

export const listUsers = async (req, res, next) => {
    try {
        const users = await adminService.listUsers(req.query);
        return successResponse(res, 200, 'Users fetched successfully', users);
    } catch (error) {
        next(error);
    }
};

export const listEmployees = async (req, res, next) => {
    try {
        const employees = await adminService.listEmployees();
        return successResponse(res, 200, 'Employees fetched successfully', employees);
    } catch (error) {
        next(error);
    }
};

export const listEmployers = async (req, res, next) => {
    try {
        const employers = await adminService.listEmployers();
        return successResponse(res, 200, 'Employers fetched successfully', employers);
    } catch (error) {
        next(error);
    }
};

export const listAllJobs = async (req, res, next) => {
    try {
        const jobs = await adminService.listAllJobs();
        return successResponse(res, 200, 'Jobs fetched successfully', jobs);
    } catch (error) {
        next(error);
    }
};

export const listAllPayments = async (req, res, next) => {
    try {
        const payments = await adminService.listAllPayments();
        return successResponse(res, 200, 'Payments fetched successfully', payments);
    } catch (error) {
        next(error);
    }
};

export const updateUserStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const result = await adminService.updateUserStatus(id, status);
        return successResponse(res, 200, 'User status updated successfully', result);
    } catch (error) {
        next(error);
    }
};

export const updateEmployerStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const result = await adminService.updateEmployerStatus(id, status);
        return successResponse(res, 200, 'Employer status updated successfully', result);
    } catch (error) {
        next(error);
    }
};
