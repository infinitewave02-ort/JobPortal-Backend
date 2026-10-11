import { db } from '../config/firebase.js';

export const getCompanyProfileByEmployerId = async (employerId) => {
    const parsedId = isNaN(Number(employerId)) ? employerId : Number(employerId);
    let snapshot = await db.collection('companies').where('userId', '==', parsedId).get();
    if (snapshot.empty && typeof parsedId === 'number') {
        snapshot = await db.collection('companies').where('userId', '==', String(employerId)).get();
    }
    if (snapshot.empty) {
        snapshot = await db.collection('companies').where('employerId', '==', employerId).get();
    }
    if (snapshot.empty) throw new Error('Company not found');
    const data = snapshot.docs[0].data();
    const resolvedAddress = data.address || data.companyAddress || '';
    const resolvedLocation = data.location || '';
    const numericUserId = typeof data.userId === 'number' ? data.userId : (!isNaN(Number(data.userId)) ? Number(data.userId) : parsedId);
    
    delete data.companyAddress;
    return {
        ...data,
        userId: typeof numericUserId === 'number' ? numericUserId : data.userId,
        address: resolvedAddress,
        location: resolvedLocation
    };
};

export const getCompanyById = async (id) => {
    const parsedId = isNaN(Number(id)) ? id : Number(id);
    const doc = await db.collection('companies').doc(String(parsedId)).get();
    if (!doc.exists) throw new Error('Company not found');
    const data = doc.data();
    const resolvedAddress = data.address || data.companyAddress || '';
    const resolvedLocation = data.location || '';
    const numericUserId = typeof data.userId === 'number' ? data.userId : (!isNaN(Number(data.userId)) ? Number(data.userId) : null);
    
    delete data.companyAddress;
    return {
        ...data,
        ...(numericUserId !== null ? { userId: numericUserId } : {}),
        address: resolvedAddress,
        location: resolvedLocation
    };
};

export const updateCompanyProfile = async (employerId, companyData) => {
    const now = new Date().toISOString();
    
    let numericUserId = !isNaN(Number(employerId)) ? Number(employerId) : null;
    if (numericUserId === null && typeof companyData.userId === 'number') {
        numericUserId = companyData.userId;
    }
    if (numericUserId === null) {
        const empDoc = await db.collection('employers').doc(String(employerId)).get();
        if (empDoc.exists && typeof empDoc.data().userId === 'number') {
            numericUserId = empDoc.data().userId;
        } else {
            const userDoc = await db.collection('users').doc(String(employerId)).get();
            if (userDoc.exists && typeof userDoc.data().userId === 'number') {
                numericUserId = userDoc.data().userId;
            } else {
                const { getNextUserId } = await import('./AuthService.js');
                numericUserId = await getNextUserId();
            }
        }
    }

    let snapshot = await db.collection('companies').where('userId', '==', numericUserId).get();
    if (snapshot.empty && String(employerId) !== String(numericUserId)) {
        snapshot = await db.collection('companies').where('userId', '==', String(employerId)).get();
    }
    if (snapshot.empty) {
        snapshot = await db.collection('companies').where('employerId', '==', employerId).get();
    }

    const cleanData = { ...companyData };
    if (cleanData.companyAddress !== undefined) {
        if (!cleanData.address) cleanData.address = cleanData.companyAddress;
        delete cleanData.companyAddress;
    }
    cleanData.userId = numericUserId;

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
        const newCompany = {
            companyId,
            userId: numericUserId,
            ...cleanData,
            createdAt: now,
            updatedAt: now
        };
        await docRef.set(newCompany);
        
        try {
            const { FieldValue } = await import('../config/firebase.js');
            await db.collection('employers').doc(String(employerId)).set({
                ...cleanData,
                uid: numericUserId,
                userId: numericUserId,
                companyAddress: FieldValue.delete(),
                updatedAt: now
            }, { merge: true });
        } catch (e) {
            console.warn('Could not sync employers collection in updateCompanyProfile:', e.message);
        }

        return newCompany;
    }

    companyId = snapshot.docs[0].data().companyId;
    await db.collection('companies').doc(snapshot.docs[0].id).update({ 
        ...cleanData, 
        userId: numericUserId, 
        updatedAt: now 
    });

    try {
        const { FieldValue } = await import('../config/firebase.js');
        await db.collection('employers').doc(String(employerId)).set({
            ...cleanData,
            uid: numericUserId,
            userId: numericUserId,
            companyAddress: FieldValue.delete(),
            updatedAt: now
        }, { merge: true });
    } catch (e) {
        console.warn('Could not sync employers collection in updateCompanyProfile:', e.message);
    }

    return { companyId, ...cleanData, userId: numericUserId };
};

export const uploadCompanyLogo = async (employerId, file) => {
    return 'mock_url';
};
