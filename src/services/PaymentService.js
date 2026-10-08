import { db } from '../config/firebase.js';

/**
 * Payment Service
 * Collection: payments/{paymentId}
 * Fields: userId, planId, amount, status, paymentMethod, transactionId, createdAt, updatedAt
 */

export const createPayment = async (userId, paymentData) => {
    const planDoc = await db.collection('plans').doc(paymentData.planId).get();
    if (!planDoc.exists || planDoc.data().status !== 'active') throw new Error('Invalid plan');

    const paymentRef = db.collection('payments').doc();
    const now = new Date().toISOString();
    const paymentRecord = {
        userId,
        planId: paymentData.planId,
        amount: planDoc.data().price,
        status: 'pending',
        paymentMethod: paymentData.paymentMethod || '',
        transactionId: '',
        createdAt: now,
        updatedAt: now
    };
    await paymentRef.set(paymentRecord);
    return { paymentId: paymentRef.id, ...paymentRecord };
};

export const verifyPayment = async (userId, verificationData) => {
    const { paymentId, transactionId } = verificationData;
    const paymentRef = db.collection('payments').doc(paymentId);
    const doc = await paymentRef.get();
    if (!doc.exists) throw new Error('Payment not found');
    if (doc.data().userId !== userId) throw new Error('Unauthorized');

    const now = new Date().toISOString();
    await paymentRef.update({
        status: 'successful',
        transactionId,
        updatedAt: now
    });
    return { paymentId, status: 'successful' };
};

export const getPaymentsByUser = async (userId) => {
    const snapshot = await db.collection('payments')
        .where('userId', '==', userId)
        .get();
    return snapshot.docs.map(doc => ({ paymentId: doc.id, ...doc.data() }));
};

export const getPaymentById = async (paymentId) => {
    const doc = await db.collection('payments').doc(paymentId).get();
    if (!doc.exists) throw new Error('Payment not found');
    return { paymentId: doc.id, ...doc.data() };
};
