export const AdminSchema = {
    uid: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String
    },
    profileImage: {
        type: String
    },
    createdAt: {
        type: Date
    },
    updatedAt: {
        type: Date
    }
};

export const DashboardStatisticsSchema = {
    totalEmployees: {
        type: Number,
        default: 0
    },
    totalEmployers: {
        type: Number,
        default: 0
    },
    totalJobs: {
        type: Number,
        default: 0
    },
    totalResumes: {
        type: Number,
        default: 0
    },
    totalPayments: {
        type: Number,
        default: 0
    }
};
