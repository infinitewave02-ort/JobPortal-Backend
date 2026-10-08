import { db, FieldValue } from '../config/firebase.js';

export const createApplication = async (employeeId, applicationData) => {
    const jobRef = db.collection('jobs').doc(applicationData.jobId);
    const jobDoc = await jobRef.get();
    if (!jobDoc.exists || jobDoc.data().status !== 'active') throw new Error('Job is not active');

    const appRef = db.collection('applications').doc();
    const now = new Date().toISOString();
    const application = {
        applicationId: appRef.id,
        jobId: applicationData.jobId,
        employerId: jobDoc.data().employerId,
        companyId: jobDoc.data().companyId,
        resumeId: applicationData.resumeId,
        coverLetter: applicationData.coverLetter || '',
        status: 'applied',
        appliedAt: now,
        updatedAt: now
    };

    const batch = db.batch();
    batch.set(appRef, application);
    batch.update(jobRef, { applicationCount: FieldValue.increment(1) });
    await batch.commit();

    return application;
};

export const updateApplicationStatus = async (employerId, applicationId, status) => {
    const appRef = db.collection('applications').doc(applicationId);
    const doc = await appRef.get();
    if (!doc.exists) throw new Error('Application not found');
    if (doc.data().employerId !== employerId) throw new Error('Unauthorized');

    await appRef.update({ status, updatedAt: new Date().toISOString() });
    return { applicationId, status };
};

export const getApplicationsByEmployee = async (employeeId) => {
    const snapshot = await db.collection('applications').where('employeeId', '==', employeeId).get();
    return snapshot.docs.map(doc => ({ applicationId: doc.id, ...doc.data() }));
};

export const getApplicationsByJob = async (jobId) => {
    const snapshot = await db.collection('applications').where('jobId', '==', jobId).get();
    return snapshot.docs.map(doc => ({ applicationId: doc.id, ...doc.data() }));
};
