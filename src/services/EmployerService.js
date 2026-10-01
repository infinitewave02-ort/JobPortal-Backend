import { db } from '../config/firebase.js';

export const getEmployer = async (uid) => {
    const doc = await db.collection('employers').doc(uid).get();
    if (!doc.exists) throw new Error('Employer not found');
    return doc.data();
};

export const registerEmployer = async (uid, data) => {
    await db.collection('employers').doc(uid).set({ ...data, status: 'pending', createdAt: new Date().toISOString() });
    return { uid, status: 'pending' };
};
