export const PaymentSchema = {
    paymentId: {
        type: String,
        required: true
    },
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
    currency: {
        type: String,
        required: true
    },
    paymentProvider: {
        type: String,
        required: true
    },
    transactionId: {
        type: String
    },
    status: {
        type: String,
        required: true,
        enum: ['pending', 'successful', 'failed']
    },
    paymentDate: {
        type: Date
    },
    createdAt: {
        type: Date
    },
    updatedAt: {
        type: Date
    }
};
