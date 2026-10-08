import { successResponse } from '../utils/Response.js';
import * as planService from '../services/PlanService.js';

export const listPlans = async (req, res, next) => {
    try {
        const plans = await planService.getActivePlans();
        return successResponse(res, 200, 'Plans fetched successfully', plans);
    } catch (error) {
        next(error);
    }
};

export const getPlanById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const plan = await planService.getPlanById(id);
        return successResponse(res, 200, 'Plan fetched successfully', plan);
    } catch (error) {
        next(error);
    }
};

export const createPlan = async (req, res, next) => {
    try {
        // Admin only creation
        const plan = await planService.createPlan(req.body);
        return successResponse(res, 201, 'Plan created successfully', plan);
    } catch (error) {
        next(error);
    }
};
