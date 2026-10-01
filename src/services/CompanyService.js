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
    return companyData;
};

export const uploadCompanyLogo = async (employerId, file) => {
    return 'mock_url';
};
