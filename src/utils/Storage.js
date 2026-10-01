import { storage } from '../config/firebase.js';

export const uploadFileToStorage = async (bucketPath, fileBuffer, mimeType) => {
    const bucket = storage.bucket();
    const file = bucket.file(bucketPath);
    
    await file.save(fileBuffer, {
        metadata: { contentType: mimeType }
    });
    
    await file.makePublic();
    
    return `https://storage.googleapis.com/${bucket.name}/${bucketPath}`;
};

export const deleteFileFromStorage = async (bucketPath) => {
    try {
        const bucket = storage.bucket();
        const file = bucket.file(bucketPath);
        await file.delete();
        return true;
    } catch (error) {
        console.error('Error deleting file:', error);
        return false;
    }
};
