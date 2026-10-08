export const CompanySchema = {
    companyId: {
        type: String,
        required: true
    },
    ownerId: {
        type: String,
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
