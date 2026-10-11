import { db } from '../config/firebase.js';

/**
 * Message Service
 * Collections:
 * - messages/{messageId}
 * - conversations/{conversationId}
 */

export const sendMessage = async (senderId, data) => {
    const sId = String(senderId);
    const rId = String(data.receiverId);
    const conversationId = [sId, rId].sort().join('_');
    const now = new Date().toISOString();

    const msgRef = db.collection('messages').doc();
    const message = {
        messageId: msgRef.id,
        conversationId,
        senderId: sId,
        receiverId: rId,
        message: data.message,
        type: data.type || 'text',
        senderName: data.senderName || '',
        receiverName: data.receiverName || '',
        senderRole: data.senderRole || '',
        receiverRole: data.receiverRole || '',
        senderAvatar: data.senderAvatar || '',
        receiverAvatar: data.receiverAvatar || '',
        read: false,
        createdAt: now,
        updatedAt: now
    };
    await msgRef.set(message);

    // Update conversation record for instant conversation listing
    try {
        const convRef = db.collection('conversations').doc(conversationId);
        const convDoc = await convRef.get();
        let unreadCount = 0;
        if (convDoc.exists) {
            unreadCount = convDoc.data()?.unreadCount?.[rId] || 0;
        }

        await convRef.set({
            conversationId,
            participants: [sId, rId],
            lastMessage: data.message,
            lastMessageTime: now,
            updatedAt: now,
            participantDetails: {
                [sId]: {
                    name: data.senderName || '',
                    role: data.senderRole || '',
                    avatar: data.senderAvatar || ''
                },
                [rId]: {
                    name: data.receiverName || '',
                    role: data.receiverRole || '',
                    avatar: data.receiverAvatar || ''
                }
            },
            unreadCount: {
                [rId]: unreadCount + 1,
                [sId]: 0
            }
        }, { merge: true });
    } catch (convErr) {
        console.warn('Error updating conversation document:', convErr?.message);
    }

    return message;
};

export const getMessages = async (userId, otherUserId) => {
    const u1 = String(userId);
    const u2 = String(otherUserId);
    const conversationId = [u1, u2].sort().join('_');

    // 1. Primary lookup by conversationId
    let snapshot = await db.collection('messages')
        .where('conversationId', '==', conversationId)
        .get();

    let messages = snapshot.docs.map(doc => ({ messageId: doc.id, ...doc.data() }));

    // 2. Fallback query if no messages with conversationId yet
    if (messages.length === 0) {
        const queryU1 = [u1];
        if (!isNaN(Number(u1))) queryU1.push(Number(u1));

        const sentSnapshot = await db.collection('messages')
            .where('senderId', 'in', queryU1)
            .get();

        const receivedSnapshot = await db.collection('messages')
            .where('receiverId', 'in', queryU1)
            .get();

        const combined = [
            ...sentSnapshot.docs.map(doc => ({ messageId: doc.id, ...doc.data() })),
            ...receivedSnapshot.docs.map(doc => ({ messageId: doc.id, ...doc.data() }))
        ];

        // Filter messages between u1 and u2
        messages = combined.filter(m =>
            (String(m.senderId) === u1 && String(m.receiverId) === u2) ||
            (String(m.senderId) === u2 && String(m.receiverId) === u1)
        );

        // Deduplicate
        const seen = new Set();
        messages = messages.filter(m => {
            if (seen.has(m.messageId)) return false;
            seen.add(m.messageId);
            return true;
        });
    }

    // Sort chronologically
    messages.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));

    // Mark unread messages received by u1 as read
    try {
        const batch = db.batch();
        let unreadFound = false;
        messages.forEach(msg => {
            if (String(msg.receiverId) === u1 && !msg.read) {
                const ref = db.collection('messages').doc(msg.messageId);
                batch.update(ref, { read: true, updatedAt: new Date().toISOString() });
                msg.read = true;
                unreadFound = true;
            }
        });

        if (unreadFound) {
            const convRef = db.collection('conversations').doc(conversationId);
            batch.set(convRef, {
                unreadCount: { [u1]: 0 }
            }, { merge: true });
            await batch.commit();
        }
    } catch (readErr) {
        console.warn('Error marking messages as read:', readErr?.message);
    }

    return messages;
};

export const getConversations = async (userId) => {
    const u1 = String(userId);
    const u1Num = !isNaN(Number(userId)) ? Number(userId) : null;

    // 1. Try querying conversations collection
    try {
        const convSnapshot = await db.collection('conversations')
            .where('participants', 'array-contains', u1)
            .get();

        if (!convSnapshot.empty) {
            const list = convSnapshot.docs.map(doc => {
                const data = doc.data();
                const otherId = (data.participants || []).find(p => String(p) !== u1) || '';
                const details = data.participantDetails?.[otherId] || {};
                const unread = data.unreadCount?.[u1] || 0;
                return {
                    id: doc.id,
                    conversationId: doc.id,
                    otherUserId: otherId,
                    name: details.name || 'User',
                    company: details.name || 'Company',
                    role: details.role || '',
                    avatar: details.avatar || '',
                    preview: data.lastMessage || '',
                    msg: data.lastMessage || '',
                    time: data.lastMessageTime ? new Date(data.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
                    unread: unread,
                    updatedAt: data.updatedAt || ''
                };
            });

            list.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
            return list;
        }
    } catch (e) {
        console.warn('Error querying conversations collection:', e?.message);
    }

    // 2. Fallback: Aggregate from messages collection
    const queryIds = u1Num !== null ? [u1, u1Num] : [u1];
    const sentSnapshot = await db.collection('messages')
        .where('senderId', 'in', queryIds)
        .get();

    const receivedSnapshot = await db.collection('messages')
        .where('receiverId', 'in', queryIds)
        .get();

    const allMessages = [
        ...sentSnapshot.docs.map(doc => ({ messageId: doc.id, ...doc.data() })),
        ...receivedSnapshot.docs.map(doc => ({ messageId: doc.id, ...doc.data() }))
    ];

    const convMap = new Map();
    allMessages.forEach(msg => {
        const isSender = String(msg.senderId) === u1;
        const otherId = String(isSender ? msg.receiverId : msg.senderId);
        const otherName = isSender ? (msg.receiverName || 'User') : (msg.senderName || 'User');
        const otherRole = isSender ? (msg.receiverRole || '') : (msg.senderRole || '');
        const msgTime = new Date(msg.createdAt || 0);

        const existing = convMap.get(otherId);
        if (!existing || msgTime > new Date(existing.rawTime || 0)) {
            convMap.set(otherId, {
                id: otherId,
                conversationId: [u1, otherId].sort().join('_'),
                otherUserId: otherId,
                name: otherName,
                company: otherName,
                role: otherRole,
                preview: msg.message || '',
                msg: msg.message || '',
                time: msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
                rawTime: msg.createdAt,
                unread: (!isSender && !msg.read) ? ((existing?.unread || 0) + 1) : (existing?.unread || 0),
                updatedAt: msg.createdAt
            });
        } else if (!isSender && !msg.read) {
            existing.unread = (existing.unread || 0) + 1;
        }
    });

    const list = Array.from(convMap.values());
    list.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
    return list;
};

export const deleteMessage = async (messageId) => {
    await db.collection('messages').doc(messageId).delete();
    return true;
};
