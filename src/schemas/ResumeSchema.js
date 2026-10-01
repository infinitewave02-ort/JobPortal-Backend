export const ResumeSchema = {
    resumeId: {
        type: String,
        required: true
    },
    employeeId: {
        type: String,
        required: true
    },
    fileName: {
        type: String,
        required: true
    },
    fileType: {
        type: String,
        required: true
    },
    fileSize: {
        type: Number,
        required: true
    },
    storagePath: {
        type: String,
        required: true
    },
    downloadUrl: {
        type: String,
        required: true
    },
    uploadedAt: {
        type: Date
    },
    updatedAt: {
        type: Date
    }
};
