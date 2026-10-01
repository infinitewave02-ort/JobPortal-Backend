import multer from 'multer';

// Use memory storage so we can upload the buffer directly to Firebase Storage
const storage = multer.memoryStorage();

export const uploadResume = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5 MB max per PDF spec
    },
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = [
            'application/pdf', 
            'application/msword', 
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDF, DOC, and DOCX resumes are allowed.'));
        }
    }
});

export const uploadImage = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5 MB max
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only images are allowed.'));
        }
    }
});
