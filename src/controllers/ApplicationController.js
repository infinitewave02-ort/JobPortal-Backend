import * as applicationService from '../services/ApplicationService.js';

export const submitApplication = async (req, res) => {
    try {
        const employeeId = req.user.uid;
        const applicationData = req.body;
        
        const application = await applicationService.createApplication(employeeId, applicationData);
        
        res.status(201).json({
            status: 'success',
            data: application
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

export const updateStatus = async (req, res) => {
    try {
        const employerId = req.user.uid;
        const { id } = req.params;
        const { status } = req.body;
        
        const result = await applicationService.updateApplicationStatus(employerId, id, status);
        
        res.status(200).json({
            status: 'success',
            data: result
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};
