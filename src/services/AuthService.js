import { db } from '../config/firebase.js';

export const getNextUserId = async () => {
    const counterRef = db.collection('counters').doc('users');
    return await db.runTransaction(async (transaction) => {
        const doc = await transaction.get(counterRef);
        let nextId = 101; // Start from 101 as requested
        if (doc.exists) {
            nextId = doc.data().lastId + 1;
        }
        transaction.set(counterRef, { lastId: nextId }, { merge: true });
        return nextId;
    });
};

export const syncUserWithFirestore = async (uid, userData) => {
    const docId = String(uid);
    const now = new Date().toISOString();

    // 1. Save to users/ collection
    const userRef = db.collection('users').doc(docId);
    const baseUser = {
        uid: docId,
        email: userData.email,
        name: userData.fullName || userData.name,
        phone: userData.phone || '',
        profileImage: userData.profileImage || '',
        createdAt: now,
        updatedAt: now
    };

    const batch = db.batch();
    batch.set(userRef, baseUser, { merge: true });

    // 2. Save to role-specific collection
    const role = userData.role || 'employee';

    if (role === 'employee') {
        const empRef = db.collection('employees').doc(docId);
        const empData = {
            uid: docId,
            userId: docId,
            name: baseUser.name,
            email: baseUser.email,
            phone: baseUser.phone,
            profileImage: baseUser.profileImage,
            jobTitle: userData.jobTitle || '',
            skills: userData.skills || [],
            education: userData.education || '',
            experience: userData.experience || '',
            location: userData.currentLocation || '',
            expectedSalary: userData.expectedSalary || 0,
            noticePeriod: userData.noticePeriod || '',
            createdAt: now,
            updatedAt: now
        };
        batch.set(empRef, empData, { merge: true });
    } else if (role === 'employer') {
        const emplRef = db.collection('employers').doc(docId);
        const emplData = {
            uid: docId,
            userId: docId,
            name: baseUser.name,
            phone: baseUser.phone,
            companyName: userData.companyName || '',
            companyEmail: userData.companyEmail || '',
            status: 'pending',
            createdAt: now,
            updatedAt: now
        };
        batch.set(emplRef, emplData, { merge: true });
    } else if (role === 'admin') {
        const adminRef = db.collection('admin').doc(docId);
        const adminData = {
            uid: docId,
            email: baseUser.email,
            name: baseUser.name,
            phone: baseUser.phone,
            profileImage: baseUser.profileImage,
            createdAt: now,
            updatedAt: now
        };
        batch.set(adminRef, adminData, { merge: true });

        // admin/{superadminId}/dashboard/statistics
        const statsRef = db.collection('admin').doc(docId).collection('dashboard').doc('statistics');
        batch.set(statsRef, {
            totalEmployees: 0,
            totalEmployers: 0,
            totalJobs: 0,
            totalResumes: 0,
            totalPayments: 0
        }, { merge: true });
    }

    await batch.commit();

    return { uid: docId, ...baseUser, role };
};

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
