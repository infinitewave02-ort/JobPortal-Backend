import { db } from '../config/firebase.js';

export const createJob = async (employerId, jobData) => {
    const jobRef = db.collection('jobs').doc();
    const job = { jobId: jobRef.id, employerId, ...jobData, status: 'active', applicationCount: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    await jobRef.set(job);
    return job;
};

export const searchJobs = async (filters) => {
    return [];
};

export const getJobById = async (id) => {
    const doc = await db.collection('jobs').doc(id).get();
    if (!doc.exists) throw new Error('Job not found');
    return doc.data();
};

export const updateJob = async (employerId, id, jobData) => {
    const jobRef = db.collection('jobs').doc(id);
    await jobRef.update({ ...jobData, updatedAt: new Date().toISOString() });
    return { id, ...jobData };
};

export const deleteJob = async (employerId, id) => {
    await db.collection('jobs').doc(id).delete();
    return true;
};
