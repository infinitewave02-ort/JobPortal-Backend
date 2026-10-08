import { db } from '../config/firebase.js';

export const createJob = async (employerId, jobData) => {
    const docRef = db.collection('jobs').doc();
    const now = new Date().toISOString();
    const job = {
        jobId: docRef.id,
        employerId,
        ...jobData,
        status: 'active',
        applicationCount: 0,
        createdAt: now,
        updatedAt: now
    };
    await docRef.set(job);
    return job;
};

export const searchJobs = async (filters) => {
    let query = db.collection('jobs');

    if (filters.status) {
        query = query.where('status', '==', filters.status);
    }
    if (filters.employerId) {
        query = query.where('employerId', '==', filters.employerId);
    }
    if (filters.companyId) {
        query = query.where('companyId', '==', filters.companyId);
    }

    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ jobId: doc.id, ...doc.data() }));
};

export const getJobById = async (id) => {
    const doc = await db.collection('jobs').doc(id).get();
    if (!doc.exists) throw new Error('Job not found');
    return doc.data();
};

export const updateJob = async (employerId, id, jobData) => {
    const jobRef = db.collection('jobs').doc(id);
    const doc = await jobRef.get();
    if (!doc.exists) throw new Error('Job not found');
    if (doc.data().employerId !== employerId) throw new Error('Unauthorized');

    await jobRef.update({ ...jobData, updatedAt: new Date().toISOString() });
    return { id, ...jobData };
};

export const deleteJob = async (employerId, id) => {
    const jobRef = db.collection('jobs').doc(id);
    const doc = await jobRef.get();
    if (!doc.exists) throw new Error('Job not found');
    if (doc.data().employerId !== employerId) throw new Error('Unauthorized');

    await jobRef.delete();
    return true;
};

export const getJobsByEmployer = async (employerId) => {
    const snapshot = await db.collection('jobs').where('employerId', '==', employerId).get();
    return snapshot.docs.map(doc => ({ jobId: doc.id, ...doc.data() }));
};
