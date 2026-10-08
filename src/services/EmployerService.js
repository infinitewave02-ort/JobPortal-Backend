import { db } from '../config/firebase.js';

export const getEmployer = async (uid) => {
    const doc = await db.collection('employers').doc(uid).get();
    if (!doc.exists) throw new Error('Employer not found');
    return doc.data();
};

export const registerEmployer = async (uid, data) => {
    await db.collection('employers').doc(uid).set({
        ...data,
        uid,
        userId: uid,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    });
    return { uid, status: 'pending' };
};

export const getCompanyProfile = async (uid) => {
    const snapshot = await db.collection('companies').where('ownerId', '==', uid).get();
    if (snapshot.empty) throw new Error('Company not found');
    return snapshot.docs[0].data();
};

export const updateCompanyProfile = async (uid, data) => {
    const now = new Date().toISOString();
    const snapshot = await db.collection('companies').where('ownerId', '==', uid).get();
    
    let companyId;
    if (snapshot.empty) {
        const docRef = db.collection('companies').doc();
        companyId = docRef.id;
        await docRef.set({
            companyId,
            ownerId: uid,
            ...data,
            createdAt: now,
            updatedAt: now
        });
    } else {
        companyId = snapshot.docs[0].id;
        await db.collection('companies').doc(companyId).update({
            ...data,
            updatedAt: now
        });
    }

    return { companyId, ...data };
};
