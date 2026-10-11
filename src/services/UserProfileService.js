import { db } from '../config/firebase.js';
import { uploadFileToStorage } from '../utils/Storage.js';

export const getUserProfile = async (uid) => {
    let userData = {};
    let doc = await db.collection('users').doc(String(uid)).get();
    if (!doc.exists) {
        const numericId = Number(uid);
        if (!isNaN(numericId)) {
            const snap = await db.collection('users').where('userId', '==', numericId).get();
            if (!snap.empty) doc = snap.docs[0];
        }
    }
    if (doc && doc.exists) {
        userData = doc.data();
    }
    
    // Try to fetch employee data
    let empDoc = await db.collection('employees').doc(String(uid)).get();
    if (!empDoc.exists) {
        const numericId = Number(uid);
        if (!isNaN(numericId)) {
            const snap = await db.collection('employees').where('userId', '==', numericId).get();
            if (!snap.empty) empDoc = snap.docs[0];
        }
    }
    if (!empDoc.exists && userData.email) {
        const snap = await db.collection('employees').where('email', '==', userData.email).get();
        if (!snap.empty) empDoc = snap.docs[0];
    }
    if (empDoc && empDoc.exists) {
        const empData = empDoc.data();
        const finalName = empData.fullName || empData.name || userData.fullName || userData.name || '';
        const finalLoc = empData.currentLocation || empData.location || userData.currentLocation || userData.location || '';
        const finalEdu = empData.qualification || empData.education || userData.qualification || userData.education || '';
        const finalExp = empData.experience || empData.exp || userData.experience || '';
        const finalRole = empData.jobTitle || empData.role || userData.jobTitle || '';
        return { 
            uid, 
            ...userData, 
            ...empData,
            fullName: finalName,
            name: finalName,
            currentLocation: finalLoc,
            location: finalLoc,
            qualification: finalEdu,
            education: finalEdu,
            experience: finalExp,
            jobTitle: finalRole,
            role: 'employee'
        };
    }
    
    // Try to fetch employer data
    let emplDoc = await db.collection('employers').doc(String(uid)).get();
    if (emplDoc.exists) {
        let employerData = emplDoc.data();
        try {
            const parsedUid = isNaN(Number(uid)) ? uid : Number(uid);
            let companySnap = await db.collection('companies').where('userId', '==', parsedUid).get();
            if (companySnap.empty && typeof parsedUid === 'number') {
                companySnap = await db.collection('companies').where('userId', '==', String(uid)).get();
            }
            if (companySnap.empty) {
                companySnap = await db.collection('companies').where('employerId', '==', uid).get();
            }
            if (!companySnap.empty) {
                employerData = { ...employerData, ...companySnap.docs[0].data() };
            }
        } catch (e) {
            console.error('Error fetching company profile:', e);
        }
        const resolvedAddress = employerData.address || employerData.companyAddress || userData.address || '';
        const resolvedLocation = employerData.location || userData.location || '';
        const numericUid = typeof employerData.userId === 'number'
            ? employerData.userId
            : (typeof employerData.uid === 'number' ? employerData.uid : (!isNaN(Number(uid)) ? Number(uid) : uid));

        delete employerData.companyAddress;
        delete userData.companyAddress;

        return { 
            ...userData, 
            ...employerData,
            uid: numericUid,
            userId: numericUid,
            address: resolvedAddress,
            location: resolvedLocation
        };
    }
    
    if (!doc || !doc.exists) throw new Error('User not found');
    const resolvedAddress = userData.address || userData.companyAddress || '';
    const resolvedLocation = userData.location || '';
    delete userData.companyAddress;
    return { uid, ...userData, address: resolvedAddress, location: resolvedLocation };
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
