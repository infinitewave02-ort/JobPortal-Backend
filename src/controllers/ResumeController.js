import { successResponse } from '../utils/Response.js';
import * as resumeService from '../services/ResumeService.js';

export const uploadResume = async (req, res, next) => {
    try {
        const employeeId = req.user.uid;
        const file = req.file;
        if (!file) throw new Error('No resume file provided');

        const resume = await resumeService.uploadResume(employeeId, file);
        return successResponse(res, 201, 'Resume uploaded successfully', resume);
    } catch (error) {
        next(error);
    }
};

export const listResumes = async (req, res, next) => {
    try {
        const employeeId = req.user.uid;
        const resumes = await resumeService.listResumes(employeeId);
        return successResponse(res, 200, 'Resumes fetched successfully', resumes);
    } catch (error) {
        next(error);
    }
};

export const deleteResume = async (req, res, next) => {
    try {
        const employeeId = req.user.uid;
        const { id } = req.params;
        await resumeService.deleteResume(employeeId, id);
        return successResponse(res, 200, 'Resume deleted successfully', { id });
    } catch (error) {
        next(error);
    }
};
