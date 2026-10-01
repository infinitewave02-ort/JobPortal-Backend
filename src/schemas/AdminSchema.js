export const AdminSchema = {
    status: {
        type: String,
        required: true,
        enum: ['active', 'blocked', 'pending', 'approved', 'rejected']
    }
};
