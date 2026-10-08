import { db } from '../config/firebase.js';

export const searchCandidates = async (filters) => {
    let query = db.collection('employees');

    if (filters.skills) {
        query = query.where('skills', 'array-contains', filters.skills);
    }
    if (filters.location) {
        query = query.where('location', '==', filters.location);
    }

    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
};

export const getCandidateById = async (id) => {
    const doc = await db.collection('employees').doc(id).get();
    if (!doc.exists) throw new Error('Candidate not found');
    return { uid: doc.id, ...doc.data() };
};

export const getOpenToWorkCandidates = async () => {
    const snapshot = await db.collection('employees').where('openToWork', '==', true).get();
    return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
};
