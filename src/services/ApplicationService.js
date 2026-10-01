import { db, FieldValue } from '../config/firebase.js';

export const createApplication = async (employeeId, applicationData) => {
    const jobRef = db.collection('jobs').doc(applicationData.jobId);
    const jobDoc = await jobRef.get();
    if (!jobDoc.exists || jobDoc.data().status !== 'active') throw new Error('Job is not active');

    const appRef = db.collection('applications').doc();
    const application = {
        applicationId: appRef.id,
        jobId: applicationData.jobId,
        employeeId,
        employerId: jobDoc.data().employerId,
        companyId: jobDoc.data().companyId,
        resumeId: applicationData.resumeId,
        status: 'applied',
        appliedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    const batch = db.batch();
    batch.set(appRef, application);
    batch.update(jobRef, { applicationCount: FieldValue.increment(1) });
    await batch.commit();

    return application;
};

export const updateApplicationStatus = async (employerId, applicationId, status) => {
    const appRef = db.collection('applications').doc(applicationId);
    await appRef.update({ status, updatedAt: new Date().toISOString() });
    return { applicationId, status };
};
