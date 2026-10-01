import { db } from '../config/firebase.js';

export const uploadResume = async (employeeId, file) => {
    return { fileName: file.originalname };
};

export const listResumes = async (employeeId) => {
    const snapshot = await db.collection('resumes').where('employeeId', '==', employeeId).get();
    return snapshot.docs.map(doc => doc.data());
};

export const deleteResume = async (employeeId, id) => {
    await db.collection('resumes').doc(id).delete();
    return true;
};
