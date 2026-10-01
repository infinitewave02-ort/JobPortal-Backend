import { successResponse } from '../utils/Response.js';
// import * as jobService from '../services/JobService.js';

export const createJob = async (req, res, next) => {
    try {
        const employerId = req.user.uid;
        // const job = await jobService.createJob(employerId, req.body);
        return successResponse(res, 201, 'Job created successfully', { employerId, ...req.body });
    } catch (error) {
        next(error);
    }
};

export const listJobs = async (req, res, next) => {
    try {
        // const jobs = await jobService.searchJobs(req.query);
        return successResponse(res, 200, 'Jobs fetched successfully', []);
    } catch (error) {
        next(error);
    }
};

export const getJobById = async (req, res, next) => {
    try {
        const { id } = req.params;
        // const job = await jobService.getJobById(id);
        return successResponse(res, 200, 'Job details fetched successfully', { id });
    } catch (error) {
        next(error);
    }
};

export const updateJob = async (req, res, next) => {
    try {
        const employerId = req.user.uid;
        const { id } = req.params;
        // const job = await jobService.updateJob(employerId, id, req.body);
        return successResponse(res, 200, 'Job updated successfully', { id });
    } catch (error) {
        next(error);
    }
};

export const deleteJob = async (req, res, next) => {
    try {
        const employerId = req.user.uid;
        const { id } = req.params;
        // await jobService.deleteJob(employerId, id);
        return successResponse(res, 200, 'Job deleted successfully', { id });
    } catch (error) {
        next(error);
    }
};
