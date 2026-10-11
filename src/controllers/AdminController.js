import { successResponse } from '../utils/Response.js';
import * as adminService from '../services/AdminService.js';

export const login = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        const result = await adminService.loginAdmin({ username, email, password });
        return successResponse(res, 200, 'Admin logged in successfully', result);
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: error.message || 'Invalid admin credentials'
        });
    }
};

export const getProfile = async (req, res, next) => {
    try {
        const profile = await adminService.getAdminProfile(req.user.uid);
        return successResponse(res, 200, 'Admin profile fetched successfully', profile);
    } catch (error) {
        next(error);
    }
};

export const updateProfile = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        const result = await adminService.updateAdminProfile(req.user.uid, { username, email, password });
        return successResponse(res, 200, 'Admin profile updated successfully', result);
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || 'Failed to update admin profile'
        });
    }
};


export const getDashboardMetrics = async (req, res, next) => {
    try {
        const adminId = req.user?.uid || 'default_admin';
        const metrics = await adminService.getDashboardMetrics(adminId);
        return successResponse(res, 200, 'Dashboard metrics fetched successfully', metrics);
    } catch (error) {
        next(error);
    }
};

export const refreshDashboardStats = async (req, res, next) => {
    try {
        const adminId = req.user?.uid || 'default_admin';
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

export const approveEmployer = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await adminService.updateEmployerStatus(id, 'Active');
        return successResponse(res, 200, 'Employer approved successfully', result);
    } catch (error) {
        next(error);
    }
};

export const deleteEmployer = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await adminService.deleteEmployer(id);
        return successResponse(res, 200, 'Employer deleted successfully', result);
    } catch (error) {
        next(error);
    }
};

export const deleteEmployee = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await adminService.deleteEmployee(id);
        return successResponse(res, 200, 'Employee deleted successfully', result);
    } catch (error) {
        next(error);
    }
};

export const deleteJob = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await adminService.deleteJob(id);
        return successResponse(res, 200, 'Job deleted successfully', result);
    } catch (error) {
        next(error);
    }
};

export const getJobDetails = async (req, res, next) => {
    try {
        const { id } = req.params;
        const job = await adminService.getJobDetails(id);
        return successResponse(res, 200, 'Job details fetched successfully', job);
    } catch (error) {
        next(error);
    }
};

export const updateJobStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const result = await adminService.updateJobStatus(id, status);
        return successResponse(res, 200, 'Job status updated successfully', result);
    } catch (error) {
        next(error);
    }
};

export const approveJob = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await adminService.approveJob(id);
        return successResponse(res, 200, 'Job approved successfully', result);
    } catch (error) {
        next(error);
    }
};

export const updatePaymentStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const result = await adminService.updatePaymentStatus(id, status);
        return successResponse(res, 200, 'Payment status updated successfully', result);
    } catch (error) {
        next(error);
    }
};

