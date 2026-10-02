import { db } from '../config/firebase.js';

export const getNextUserId = async () => {
    const counterRef = db.collection('counters').doc('users');
    return await db.runTransaction(async (transaction) => {
        const doc = await transaction.get(counterRef);
        let nextId = 101; // Start from 101 as requested
        if (doc.exists) {
            nextId = doc.data().lastId + 1;
        }
        transaction.set(counterRef, { lastId: nextId }, { merge: true });
        return nextId;
    });
};

export const syncUserWithFirestore = async (uid, userData) => {
    const docId = String(uid);
    const numericUid = Number(uid);
    const userRef = db.collection('users').doc(docId);
    const doc = await userRef.get();
    
    if (!doc.exists) {
        const newUser = { uid: numericUid, ...userData, status: 'active', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        await userRef.set(newUser);
        return newUser;
    }
    
    await userRef.update({ ...userData, updatedAt: new Date().toISOString() });
    return { uid: numericUid, ...userData };
};

export const getUserProfile = async (uid) => {
    const doc = await db.collection('users').doc(uid).get();
    if (!doc.exists) throw new Error('User not found');
    return doc.data();
};
