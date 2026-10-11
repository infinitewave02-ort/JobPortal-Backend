export const CompanySchema = {
    companyId: {
        type: Number,
        required: true
    },
    userId: {
        type: Number,
        required: true
    },
    companyName: {
        type: String,
        required: true
    },
    logo: {
        type: String
    },
    description: {
        type: String
    },
    industry: {
        type: String,
        required: true
    },
    website: {
        type: String
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String
    },
    location: {
        type: String
    },
    address: {
        type: String
    },
    createdAt: {
        type: Date
    },
    updatedAt: {
        type: Date
    }
};
