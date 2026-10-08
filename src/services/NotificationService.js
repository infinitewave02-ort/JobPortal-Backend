import { db } from '../config/firebase.js';

/**
 * Notification Service
 * Collection: notifications/{notificationId}
 * Fields: userId, type, title, message, isRead, createdAt, updatedAt
 */

export const createNotification = async (notificationData) => {
    const notifRef = db.collection('notifications').doc();
    const now = new Date().toISOString();
    const notification = {
        userId: notificationData.userId,
        type: notificationData.type,
        title: notificationData.title || '',
        message: notificationData.message,
        isRead: false,
        createdAt: now,
        updatedAt: now
    };
    await notifRef.set(notification);
    return { notificationId: notifRef.id, ...notification };
};

export const getNotifications = async (userId) => {
    const snapshot = await db.collection('notifications')
        .where('userId', '==', userId)
        .get();
    return snapshot.docs.map(doc => ({ notificationId: doc.id, ...doc.data() }));
};

export const markAsRead = async (userId, id) => {
    const notifRef = db.collection('notifications').doc(id);
    const doc = await notifRef.get();
    if (!doc.exists || doc.data().userId !== userId) throw new Error('Notification not found');

    await notifRef.update({ isRead: true, updatedAt: new Date().toISOString() });
    return { notificationId: id, isRead: true };
};

export const markAllAsRead = async (userId) => {
    const snapshot = await db.collection('notifications')
        .where('userId', '==', userId)
        .where('isRead', '==', false)
        .get();

    const batch = db.batch();
    const now = new Date().toISOString();
    snapshot.docs.forEach(doc => {
        batch.update(doc.ref, { isRead: true, updatedAt: now });
    });
    await batch.commit();
    return { count: snapshot.size };
};

export const deleteNotification = async (userId, id) => {
    const notifRef = db.collection('notifications').doc(id);
    const doc = await notifRef.get();
    if (!doc.exists || doc.data().userId !== userId) throw new Error('Notification not found');

    await notifRef.delete();
    return true;
};
