export const ApplicationSchema = {
    applicationId: {
        type: String,
        required: true
    },
    jobId: {
        type: String,
        required: true
    },
    employerId: {
        type: String,
        required: true
    },
    companyId: {
        type: String,
        required: true
    },
    resumeId: {
        type: String,
        required: true
    },
    coverLetter: {
        type: String
    },
    status: {
        type: String,
        required: true,
        enum: ['applied', 'shortlisted', 'interview', 'selected', 'rejected']
    },
    appliedAt: {
        type: Date
    },
    updatedAt: {
        type: Date
    }
};
