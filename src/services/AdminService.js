import { db } from '../config/firebase.js';

export const getDashboardMetrics = async (adminId) => {
    const statsRef = db.collection('admin').doc(adminId).collection('dashboard').doc('statistics');
    const doc = await statsRef.get();

    if (doc.exists) {
        return doc.data();
    }

    return await refreshDashboardStats(adminId);
};

export const refreshDashboardStats = async (adminId) => {
    const [employeesSnap, employersSnap, jobsSnap, resumesSnap, paymentsSnap] = await Promise.all([
        db.collection('employees').get(),
        db.collection('employers').get(),
        db.collection('jobs').get(),
        db.collection('resumes').get(),
        db.collection('payments').get()
    ]);

    const stats = {
        totalEmployees: employeesSnap.size,
        totalEmployers: employersSnap.size,
        totalJobs: jobsSnap.size,
        totalResumes: resumesSnap.size,
        totalPayments: paymentsSnap.size
    };

    await db.collection('admin').doc(adminId).collection('dashboard').doc('statistics').set(stats, { merge: true });
    return stats;
};

export const listUsers = async (filters) => {
    const snapshot = await db.collection('users').get();
    return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
};

export const listEmployees = async () => {
    const snapshot = await db.collection('employees').get();
    return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
};

export const listEmployers = async () => {
    const snapshot = await db.collection('employers').get();
    return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
};

export const listAllJobs = async () => {
    const snapshot = await db.collection('jobs').get();
    return snapshot.docs.map(doc => ({ jobId: doc.id, ...doc.data() }));
};

export const listAllPayments = async () => {
    const snapshot = await db.collection('payments').get();
    return snapshot.docs.map(doc => ({ paymentId: doc.id, ...doc.data() }));
};

export const updateUserStatus = async (id, status) => {
    await db.collection('users').doc(id).update({ status, updatedAt: new Date().toISOString() });
    return { id, status };
};

export const updateEmployerStatus = async (id, status) => {
    await db.collection('employers').doc(id).update({ status, updatedAt: new Date().toISOString() });
    return { id, status };
};
