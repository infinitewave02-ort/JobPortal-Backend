import { db } from '../config/firebase.js';
import { uploadFileToStorage } from '../utils/Storage.js';

export const getUserProfile = async (uid) => {
    const doc = await db.collection('users').doc(uid).get();
    if (!doc.exists) throw new Error('User not found');
    
    const userData = doc.data();
    
    // Try to fetch employee data
    const empDoc = await db.collection('employees').doc(uid).get();
    if (empDoc.exists) {
        return { uid, ...userData, ...empDoc.data() };
    }
    
    // Try to fetch employer data
    const emplDoc = await db.collection('employers').doc(uid).get();
    if (emplDoc.exists) {
        return { uid, ...userData, ...emplDoc.data() };
    }
    
    return { uid, ...userData };
};

export const updateUserProfile = async (uid, data) => {
    const userRef = db.collection('users').doc(uid);
    const doc = await userRef.get();
    if (!doc.exists) throw new Error('User not found');

    const userFields = ['name', 'email', 'phone', 'profileImage'];
    const employeeFields = [
        'fullName', 'jobTitle', 'experience',
        'currentLocation', 'preferredLocation', 'qualification',
        'expectedSalary', 'noticePeriod', 'gender', 'skills', 'phone'
    ];

    const now = new Date().toISOString();
    const userPayload = {};
    const employeePayload = {};

    for (const [key, value] of Object.entries(data)) {
        if (value === undefined) continue;
        if (userFields.includes(key)) {
            userPayload[key] = value;
        }
        if (employeeFields.includes(key)) {
            employeePayload[key] = value;
        }
    }

    if (data.fullName) {
        userPayload.name = data.fullName;
        employeePayload.name = data.fullName;
    }

    if (Object.keys(userPayload).length > 0) {
        userPayload.updatedAt = now;
        await userRef.update(userPayload);
    }

    if (Object.keys(employeePayload).length > 0) {
        employeePayload.updatedAt = now;
        const empRef = db.collection('employees').doc(uid);
        const empDoc = await empRef.get();
        if (empDoc.exists) {
            await empRef.update(employeePayload);
        }
    }

    const updatedDoc = await userRef.get();
    return { uid, ...updatedDoc.data() };
};

export const uploadProfileImage = async (uid, fileBuffer, mimeType) => {
    const ext = mimeType.split('/')[1] || 'jpg';
    const bucketPath = `profile-images/${uid}/avatar.${ext}`;

    const imageUrl = await uploadFileToStorage(bucketPath, fileBuffer, mimeType);
    const now = new Date().toISOString();

    await db.collection('users').doc(uid).update({
        profileImage: imageUrl,
        updatedAt: now,
    });

    const empRef = db.collection('employees').doc(uid);
    const empDoc = await empRef.get();
    if (empDoc.exists) {
        await empRef.update({ profileImage: imageUrl, updatedAt: now });
    }

    return imageUrl;
};
