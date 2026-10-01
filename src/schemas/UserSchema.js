export const UserSchema = {
    uid: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String
    },
    role: {
        type: String,
        required: true,
        enum: ['employee', 'employer', 'admin']
    },
    status: {
        type: String,
        required: true,
        enum: ['active', 'blocked', 'pending']
    },
    profileImage: {
        type: String
    },
    createdAt: {
        type: Date
    },
    updatedAt: {
        type: Date
    }
};
