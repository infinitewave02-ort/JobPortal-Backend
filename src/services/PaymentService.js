import { db } from '../config/firebase.js';

export const createPayment = async (userId, paymentData) => {
    const planDoc = await db.collection('plans').doc(paymentData.planId).get();
    if (!planDoc.exists || !planDoc.data().active) throw new Error('Invalid plan');
    
    const paymentRef = db.collection('payments').doc();
    const paymentRecord = { paymentId: paymentRef.id, userId, planId: paymentData.planId, amount: planDoc.data().price, status: 'pending', createdAt: new Date().toISOString() };
    await paymentRef.set(paymentRecord);
    return paymentRecord;
};

export const verifyPayment = async (userId, verificationData) => {
    const { paymentId, transactionId } = verificationData;
    const paymentRef = db.collection('payments').doc(paymentId);
    await paymentRef.update({ status: 'successful', transactionId, paymentDate: new Date().toISOString(), updatedAt: new Date().toISOString() });
    return { paymentId, status: 'successful' };
};
