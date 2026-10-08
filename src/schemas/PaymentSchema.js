export const PaymentSchema = {
    userId: {
        type: String,
        required: true
    },
    planId: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        required: true,
        enum: ['pending', 'successful', 'failed']
    },
    paymentMethod: {
        type: String,
        required: true
    },
    transactionId: {
        type: String
    },
    createdAt: {
        type: Date
    },
    updatedAt: {
        type: Date
    }
};
