export const PlanSchema = {
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    description: {
        type: String
    },
    features: {
        type: [String]
    },
    status: {
        type: String,
        required: true,
        enum: ['active', 'inactive']
    },
    createdAt: {
        type: Date
    },
    updatedAt: {
        type: Date
    }
};
