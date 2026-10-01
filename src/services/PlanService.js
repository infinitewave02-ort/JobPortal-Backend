import { db } from '../config/firebase.js';

export const getActivePlans = async () => {
    const snapshot = await db.collection('plans').where('active', '==', true).get();
    return snapshot.docs.map(doc => doc.data());
};

export const getPlanById = async (id) => {
    const doc = await db.collection('plans').doc(id).get();
    if (!doc.exists) throw new Error('Plan not found');
    return doc.data();
};

export const createPlan = async (planData) => {
    const planRef = db.collection('plans').doc();
    const plan = { planId: planRef.id, ...planData, active: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    await planRef.set(plan);
    return plan;
};
