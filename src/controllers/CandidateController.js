import { successResponse } from '../utils/Response.js';
import * as candidateService from '../services/CandidateService.js';

export const searchCandidates = async (req, res, next) => {
    try {
        const candidates = await candidateService.searchCandidates(req.query);
        return successResponse(res, 200, 'Candidates fetched successfully', candidates);
    } catch (error) {
        next(error);
    }
};

export const getCandidateById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const candidate = await candidateService.getCandidateById(id);
        return successResponse(res, 200, 'Candidate fetched successfully', candidate);
    } catch (error) {
        next(error);
    }
};

export const getOpenToWorkCandidates = async (req, res, next) => {
    try {
        const candidates = await candidateService.getOpenToWorkCandidates();
        return successResponse(res, 200, 'Open to work candidates fetched successfully', candidates);
    } catch (error) {
        next(error);
    }
};
