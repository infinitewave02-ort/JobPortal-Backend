import { db } from '../config/firebase.js';
import { uploadFileToStorage, deleteFileFromStorage } from '../utils/Storage.js';

export const uploadResume = async (employeeId, file) => {
    const ext = file.originalname.split('.').pop() || 'pdf';
    const uniqueId = Date.now().toString();
    const bucketPath = `resumes/${employeeId}/${uniqueId}.${ext}`;

    const fileUrl = await uploadFileToStorage(bucketPath, file.buffer, file.mimetype);

    const docRef = db.collection('resumes').doc();
    const now = new Date().toISOString();
    const resumeData = {
        resumeId: docRef.id,
        employeeId: String(employeeId),
        fileName: file.originalname,
        fileType: file.mimetype,
        fileSize: file.size,
        storagePath: bucketPath,
        downloadUrl: fileUrl,
        uploadedAt: now,
        updatedAt: now
    };

    await docRef.set(resumeData);

    await db.collection('users').doc(String(employeeId)).set(
        { resumeFile: fileUrl, updatedAt: now },
        { merge: true }
    );

    return { id: docRef.id, ...resumeData };
};

export const listResumes = async (employeeId) => {
    const snapshot = await db.collection('resumes')
        .where('employeeId', '==', String(employeeId))
        .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const deleteResume = async (employeeId, id) => {
    const docRef = db.collection('resumes').doc(id);
    const doc = await docRef.get();

    if (doc.exists && doc.data().employeeId === String(employeeId)) {
        const data = doc.data();

        if (data.storagePath) {
            await deleteFileFromStorage(data.storagePath);
        }

        await docRef.delete();
        return true;
    }

    throw new Error('Resume not found or unauthorized');
};
