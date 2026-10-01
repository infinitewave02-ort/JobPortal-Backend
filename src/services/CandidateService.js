import { db } from '../config/firebase.js';

export const searchCandidates = async (filters) => {
    return [];
};

export const getCandidateById = async (id) => {
    const doc = await db.collection('employees').doc(id).get();
    if (!doc.exists) throw new Error('Candidate not found');
    return doc.data();
};

export const getOpenToWorkCandidates = async () => {
    const snapshot = await db.collection('employees').where('openToWork', '==', true).get();
    return snapshot.docs.map(doc => doc.data());
};
