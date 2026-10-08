import { db } from '../config/firebase.js';

export const updateBasicProfile = async (uid, data) => {
    await db.collection('employees').doc(uid).set(
        { ...data, updatedAt: new Date().toISOString() },
        { merge: true }
    );
    return { uid, ...data };
};

export const updateProfessionalProfile = async (uid, data) => {
    await db.collection('employees').doc(uid).set(
        { ...data, updatedAt: new Date().toISOString() },
        { merge: true }
    );
    return { uid, ...data };
};

export const setOpenToWork = async (uid, openToWork) => {
    await db.collection('employees').doc(uid).set(
        { openToWork, updatedAt: new Date().toISOString() },
        { merge: true }
    );
    return { uid, openToWork };
};
