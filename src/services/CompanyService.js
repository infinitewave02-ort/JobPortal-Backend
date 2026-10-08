import { db } from '../config/firebase.js';

export const getCompanyProfileByEmployerId = async (employerId) => {
    const snapshot = await db.collection('companies').where('ownerId', '==', employerId).get();
    if (snapshot.empty) throw new Error('Company not found');
    return snapshot.docs[0].data();
};

export const getCompanyById = async (id) => {
    const doc = await db.collection('companies').doc(id).get();
    if (!doc.exists) throw new Error('Company not found');
    return doc.data();
};

export const updateCompanyProfile = async (employerId, companyData) => {
    const now = new Date().toISOString();
    const snapshot = await db.collection('companies').where('ownerId', '==', employerId).get();

    if (snapshot.empty) {
        const docRef = db.collection('companies').doc();
        const newCompany = {
            companyId: docRef.id,
            ownerId: employerId,
            ...companyData,
            createdAt: now,
            updatedAt: now
        };
        await docRef.set(newCompany);
        return newCompany;
    }

    const companyId = snapshot.docs[0].id;
    await db.collection('companies').doc(companyId).update({ ...companyData, updatedAt: now });
    return { companyId, ...companyData };
};

export const uploadCompanyLogo = async (employerId, file) => {
    return 'mock_url';
};
