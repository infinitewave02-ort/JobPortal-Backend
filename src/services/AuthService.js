import { db } from '../config/firebase.js';

export const syncUserWithFirestore = async (uid, userData) => {
    const userRef = db.collection('users').doc(uid);
    const doc = await userRef.get();
    
    if (!doc.exists) {
        const newUser = { uid, ...userData, status: 'active', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        await userRef.set(newUser);
        return newUser;
    }
    
    await userRef.update({ ...userData, updatedAt: new Date().toISOString() });
    return { uid, ...userData };
};

export const getUserProfile = async (uid) => {
    const doc = await db.collection('users').doc(uid).get();
    if (!doc.exists) throw new Error('User not found');
    return doc.data();
};
