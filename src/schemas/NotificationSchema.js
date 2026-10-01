export const NotificationSchema = {
    notificationId: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    title: {
        type: String
    },
    message: {
        type: String,
        required: true
    },
    referenceId: {
        type: String
    },
    referenceType: {
        type: String
    },
    read: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date
    }
};
