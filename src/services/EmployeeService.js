import { db } from '../config/firebase.js';

export const getProfile = async (uid) => {
    const doc = await db.collection('employees').doc(uid).get();
    if (!doc.exists) throw new Error('Profile not found');
    return doc.data();
};

export const updateProfile = async (uid, data) => {
    await db.collection('employees').doc(uid).set(
        { ...data, updatedAt: new Date().toISOString() },
        { merge: true }
    );
    return { uid, ...data };
};

export const getAllEmployees = async () => {
    const snapshot = await db.collection('employees').get();
    return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
};
