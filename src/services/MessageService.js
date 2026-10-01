import { db } from '../config/firebase.js';

export const sendMessage = async (senderId, data) => {
    const msgRef = db.collection('messages').doc();
    const message = { messageId: msgRef.id, senderId, ...data, read: false, createdAt: new Date().toISOString() };
    await msgRef.set(message);
    return message;
};

export const getMessages = async (userId, otherUserId) => {
    return [];
};

export const markAsRead = async (id) => {
    await db.collection('messages').doc(id).update({ read: true });
    return true;
};
