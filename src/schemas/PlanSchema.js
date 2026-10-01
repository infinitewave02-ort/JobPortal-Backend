export const PlanSchema = {
    planId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    currency: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    features: {
        type: [String]
    },
    active: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date
    },
    updatedAt: {
        type: Date
    }
};
