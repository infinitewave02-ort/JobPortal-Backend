import { db } from '../config/firebase.js';

export const getDashboardMetrics = async () => {
    // Simplified count logic for dashboard metrics
    return { totalEmployees: 0, totalEmployers: 0, activeJobPosts: 0, openToWork: 0 };
};

export const listUsers = async (filters) => {
    return [];
};

export const updateUserStatus = async (id, status) => {
    await db.collection('users').doc(id).update({ status, updatedAt: new Date().toISOString() });
    return { id, status };
};

export const updateEmployerStatus = async (id, status) => {
    await db.collection('employers').doc(id).update({ status, updatedAt: new Date().toISOString() });
    return { id, status };
};
