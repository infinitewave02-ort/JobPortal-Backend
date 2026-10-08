import { db } from '../config/firebase.js';

/**
 * Message Service
 * Collection: messages/{messageId}
 * Fields: senderId, receiverId, message, type, createdAt, updatedAt
 */

export const sendMessage = async (senderId, data) => {
    const msgRef = db.collection('messages').doc();
    const now = new Date().toISOString();
    const message = {
        senderId,
        receiverId: data.receiverId,
        message: data.message,
        type: data.type || 'text',
        createdAt: now,
        updatedAt: now
    };
    await msgRef.set(message);
    return { messageId: msgRef.id, ...message };
};

export const getMessages = async (userId, otherUserId) => {
    // Get messages where user is sender or receiver with the other user
    const sentSnapshot = await db.collection('messages')
        .where('senderId', '==', userId)
        .where('receiverId', '==', otherUserId)
        .get();

    const receivedSnapshot = await db.collection('messages')
        .where('senderId', '==', otherUserId)
        .where('receiverId', '==', userId)
        .get();

    const messages = [
        ...sentSnapshot.docs.map(doc => ({ messageId: doc.id, ...doc.data() })),
        ...receivedSnapshot.docs.map(doc => ({ messageId: doc.id, ...doc.data() }))
    ];

    // Sort by createdAt
    messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    return messages;
};

export const getConversations = async (userId) => {
    // Get all messages where user is involved
    const sentSnapshot = await db.collection('messages')
        .where('senderId', '==', userId)
        .get();

    const receivedSnapshot = await db.collection('messages')
        .where('receiverId', '==', userId)
        .get();

    const allMessages = [
        ...sentSnapshot.docs.map(doc => ({ messageId: doc.id, ...doc.data() })),
        ...receivedSnapshot.docs.map(doc => ({ messageId: doc.id, ...doc.data() }))
    ];

    return allMessages;
};

export const deleteMessage = async (messageId) => {
    await db.collection('messages').doc(messageId).delete();
    return true;
};
