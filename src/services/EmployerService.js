import { db } from '../config/firebase.js';

export const getEmployer = async (uid) => {
    const doc = await db.collection('employers').doc(uid).get();
    if (!doc.exists) throw new Error('Employer not found');
    return doc.data();
};

export const registerEmployer = async (uid, data) => {
    const status = data?.status || 'active';
    await db.collection('employers').doc(uid).set({
        ...data,
        uid,
        userId: uid,
        status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    });
    return { uid, status };
};

export const getCompanyProfile = async (uid) => {
    let profileData = {};
    const numericUid = !isNaN(Number(uid)) ? Number(uid) : null;
    
    // Get employer base data
    const employerDoc = await db.collection('employers').doc(String(uid)).get();
    if (employerDoc.exists) {
        profileData = { ...employerDoc.data() };
    }

    // Get company specific data
    let snapshot = { empty: true };
    if (numericUid !== null) {
        snapshot = await db.collection('companies').where('userId', '==', numericUid).get();
    }
    if (snapshot.empty && profileData.userId && typeof profileData.userId === 'number') {
        snapshot = await db.collection('companies').where('userId', '==', profileData.userId).get();
    }
    if (snapshot.empty) {
        snapshot = await db.collection('companies').where('userId', '==', String(uid)).get();
    }
    if (snapshot.empty) {
        snapshot = await db.collection('companies').where('employerId', '==', uid).get();
    }
    if (!snapshot.empty) {
        profileData = { ...profileData, ...snapshot.docs[0].data() };
    }

    // If neither exists, check users doc or throw
    if (!employerDoc.exists && snapshot.empty) {
        const userDoc = await db.collection('users').doc(String(uid)).get();
        if (userDoc.exists) {
            profileData = { ...userDoc.data(), ...profileData };
        } else {
            throw new Error('Employer/Company not found');
        }
    }

    const resolvedAddress = profileData.address || profileData.companyAddress || '';
    const resolvedLocation = profileData.location || '';
    profileData.address = resolvedAddress;
    profileData.location = resolvedLocation;
    delete profileData.companyAddress;

    // Ensure numeric uid & userId for employer
    const finalNumericId = typeof profileData.userId === 'number'
        ? profileData.userId
        : (typeof profileData.uid === 'number' ? profileData.uid : (numericUid !== null ? numericUid : null));
    if (finalNumericId !== null) {
        profileData.uid = Number(finalNumericId);
        profileData.userId = Number(finalNumericId);
    }

    return profileData;
};

export const updateCompanyProfile = async (uid, data) => {
    const now = new Date().toISOString();
    
    // Determine numeric userId for employer
    let numericUserId = !isNaN(Number(uid)) ? Number(uid) : null;
    if (numericUserId === null) {
        const empDoc = await db.collection('employers').doc(String(uid)).get();
        if (empDoc.exists && typeof empDoc.data().userId === 'number') {
            numericUserId = empDoc.data().userId;
        } else if (empDoc.exists && typeof empDoc.data().uid === 'number') {
            numericUserId = empDoc.data().uid;
        } else {
            const userDoc = await db.collection('users').doc(String(uid)).get();
            if (userDoc.exists && typeof userDoc.data().userId === 'number') {
                numericUserId = userDoc.data().userId;
            } else {
                const { getNextUserId } = await import('./AuthService.js');
                numericUserId = await getNextUserId();
            }
        }
    }

    let snapshot = await db.collection('companies').where('userId', '==', numericUserId).get();
    if (snapshot.empty && String(uid) !== String(numericUserId)) {
        snapshot = await db.collection('companies').where('userId', '==', String(uid)).get();
    }
    if (snapshot.empty) {
        snapshot = await db.collection('companies').where('employerId', '==', uid).get();
    }

    const cleanData = { ...data };
    if (cleanData.companyAddress !== undefined) {
        if (!cleanData.address) cleanData.address = cleanData.companyAddress;
        delete cleanData.companyAddress;
    }
    
    cleanData.userId = numericUserId;
    cleanData.uid = numericUserId;

    let companyId;
    if (snapshot.empty) {
        // Generate numeric companyId
        const counterRef = db.collection('counters').doc('companies');
        companyId = await db.runTransaction(async (transaction) => {
            const doc = await transaction.get(counterRef);
            let nextId = 1001; // Start from 1001 for companies
            if (doc.exists) {
                nextId = doc.data().lastId + 1;
            }
            transaction.set(counterRef, { lastId: nextId }, { merge: true });
            return nextId;
        });

        const docRef = db.collection('companies').doc(String(companyId));
        await docRef.set({
            companyId,
            userId: numericUserId,
            ...cleanData,
            createdAt: now,
            updatedAt: now
        });
    } else {
        companyId = snapshot.docs[0].data().companyId;
        await db.collection('companies').doc(snapshot.docs[0].id).update({
            ...cleanData,
            userId: numericUserId,
            updatedAt: now
        });
    }

    // Keep employers collection in sync with numeric uid and userId, and remove companyAddress
    try {
        const { FieldValue } = await import('../config/firebase.js');
        await db.collection('employers').doc(String(uid)).set({
            ...cleanData,
            uid: numericUserId,
            userId: numericUserId,
            companyAddress: FieldValue.delete(),
            updatedAt: now
        }, { merge: true });
    } catch (e) {
        console.warn('Could not sync employers collection in updateCompanyProfile:', e.message);
    }

    return { companyId, ...cleanData, uid: numericUserId, userId: numericUserId };
};
