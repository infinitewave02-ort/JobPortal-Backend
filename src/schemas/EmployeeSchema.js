export const EmployeeSchema = {
    uid: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String
    },
    profileImage: {
        type: String
    },
    jobTitle: {
        type: String
    },
    skills: {
        type: [String]
    },
    education: {
        type: String
    },
    experience: {
        type: Number
    },
    location: {
        type: String
    },
    expectedSalary: {
        type: Number
    },
    noticePeriod: {
        type: String
    },
    openToWork: {
        type: Boolean,
        default: false
    },
    resumeId: {
        type: String
    },
    createdAt: {
        type: Date
    },
    updatedAt: {
        type: Date
    }
};
