export const EmployerSchema = {
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
    companyId: {
        type: String
    },
    companyName: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['pending', 'approved', 'rejected', 'blocked']
    },
    createdAt: {
        type: Date
    },
    updatedAt: {
        type: Date
    }
};
