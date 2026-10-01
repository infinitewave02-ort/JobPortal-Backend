import { db } from '../config/firebase.js';

export const getNotifications = async (userId) => {
    return [];
};

export const markAsRead = async (userId, id) => {
    await db.collection('notifications').doc(id).update({ read: true });
};

export const markAllAsRead = async (userId) => {
    // Requires batched writes
};

export const deleteNotification = async (userId, id) => {
    await db.collection('notifications').doc(id).delete();
};
