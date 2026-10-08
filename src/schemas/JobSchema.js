export const JobSchema = {
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
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    skills: {
        type: [String],
        required: true
    },
    employmentType: {
        type: String,
        required: true
    },
    experience: {
        type: Number
    },
    salary: {
        type: Number
    },
    qualification: {
        type: String
    },
    responsibilities: {
        type: String
    },
    requirements: {
        type: String
    },
    status: {
        type: String,
        required: true,
        enum: ['active', 'closed']
    },
    applicationCount: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date
    },
    updatedAt: {
        type: Date
    }
};
