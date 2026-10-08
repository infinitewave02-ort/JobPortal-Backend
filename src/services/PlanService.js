import { db } from '../config/firebase.js';

/**
 * Plan Service
 * Collection: plans/{planId}
 * Fields: name, price, description, features, status, createdAt, updatedAt
 */

export const getActivePlans = async () => {
    const snapshot = await db.collection('plans')
        .where('status', '==', 'active')
        .get();
    return snapshot.docs.map(doc => ({ planId: doc.id, ...doc.data() }));
};

export const getPlanById = async (id) => {
    const doc = await db.collection('plans').doc(id).get();
    if (!doc.exists) throw new Error('Plan not found');
    return { planId: doc.id, ...doc.data() };
};

export const createPlan = async (planData) => {
    const planRef = db.collection('plans').doc();
    const now = new Date().toISOString();
    const plan = {
        name: planData.name,
        price: planData.price,
        description: planData.description || '',
        features: planData.features || [],
        status: 'active',
        createdAt: now,
        updatedAt: now
    };
    await planRef.set(plan);
    return { planId: planRef.id, ...plan };
};

export const updatePlan = async (id, planData) => {
    const planRef = db.collection('plans').doc(id);
    const doc = await planRef.get();
    if (!doc.exists) throw new Error('Plan not found');

    await planRef.update({ ...planData, updatedAt: new Date().toISOString() });
    return { planId: id, ...planData };
};

export const deactivatePlan = async (id) => {
    const planRef = db.collection('plans').doc(id);
    await planRef.update({ status: 'inactive', updatedAt: new Date().toISOString() });
    return { planId: id, status: 'inactive' };
};
