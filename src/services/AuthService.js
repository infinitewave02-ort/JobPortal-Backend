import { db, auth } from '../config/firebase.js';

export const getNextUserId = async () => {
    const counterRef = db.collection('counters').doc('users');
    let nextId = await db.runTransaction(async (transaction) => {
        const doc = await transaction.get(counterRef);
        let id = 131;
        if (doc.exists && typeof doc.data().lastId === 'number') {
            id = Math.max(doc.data().lastId + 1, 131);
        }
        transaction.set(counterRef, { lastId: id }, { merge: true });
        return id;
    });

    // Ensure UID does not collide with existing user in Firebase Auth
    let userExists = true;
    while (userExists) {
        try {
            await auth.getUser(String(nextId));
            // User exists, increment and update counter
            nextId++;
            await counterRef.set({ lastId: nextId }, { merge: true });
        } catch (err) {
            if (err.code === 'auth/user-not-found') {
                userExists = false;
            } else {
                throw err;
            }
        }
    }

    return nextId;
};

export const syncUserWithFirestore = async (uid, userData) => {
    const docId = String(uid);
    const role = userData.role || 'employee';
    const now = new Date().toISOString();

    let employerNumericId = null;
    if (role === 'employer') {
        const asNumber = Number(docId);
        if (!isNaN(asNumber)) {
            employerNumericId = asNumber;
        } else {
            // docId is alphanumeric string - check if employers or users doc already has a numeric ID
            const existingEmp = await db.collection('employers').doc(docId).get();
            if (existingEmp.exists) {
                const d = existingEmp.data();
                if (typeof d.userId === 'number') employerNumericId = d.userId;
                else if (typeof d.uid === 'number') employerNumericId = d.uid;
            }
            if (!employerNumericId) {
                const existingUser = await db.collection('users').doc(docId).get();
                if (existingUser.exists) {
                    const ud = existingUser.data();
                    if (typeof ud.userId === 'number') employerNumericId = ud.userId;
                    else if (typeof ud.uid === 'number') employerNumericId = ud.uid;
                }
            }
            if (!employerNumericId) {
                employerNumericId = await getNextUserId();
            }
        }
    }

    const parsedUid = employerNumericId !== null 
        ? employerNumericId 
        : (isNaN(Number(docId)) ? docId : Number(docId));

    // 1. Save to users/ collection
    const userRef = db.collection('users').doc(docId);
    const resolvedAddress = userData.address || userData.companyAddress || '';
    const baseUser = {
        uid: parsedUid,
        userId: parsedUid,
        email: userData.email,
        name: userData.fullName || userData.name || userData.contactPerson,
        phone: userData.phone || userData.contactNumber,
        profileImage: userData.profileImage,
        address: resolvedAddress,
        createdAt: now,
        updatedAt: now
    };
    Object.keys(baseUser).forEach(key => (baseUser[key] === undefined || baseUser[key] === '') && delete baseUser[key]);
    if (resolvedAddress) baseUser.address = resolvedAddress;

    const batch = db.batch();
    batch.set(userRef, baseUser, { merge: true });

    // 2. Save to role-specific collection
    if (role === 'employee') {
        const empRef = db.collection('employees').doc(docId);
        const empData = {
            uid: parsedUid,
            userId: parsedUid,
            name: baseUser.name,
            email: baseUser.email,
            phone: baseUser.phone,
            profileImage: baseUser.profileImage,
            jobTitle: userData.jobTitle,
            skills: userData.skills,
            education: userData.education,
            experience: userData.experience,
            location: userData.currentLocation || userData.location || '',
            expectedSalary: userData.expectedSalary,
            noticePeriod: userData.noticePeriod,
            createdAt: now,
            updatedAt: now
        };
        Object.keys(empData).forEach(key => empData[key] === undefined && delete empData[key]);
        batch.set(empRef, empData, { merge: true });
    } else if (role === 'employer') {
        const emplRef = db.collection('employers').doc(docId);
        const emplData = {
            uid: employerNumericId, // Number only for employer
            userId: employerNumericId, // Number only for employer
            name: baseUser.name || userData.contactPerson,
            phone: baseUser.phone || userData.contactNumber,
            companyName: userData.companyName,
            companyEmail: userData.companyEmail || userData.email,
            contactPerson: userData.contactPerson || baseUser.name,
            contactNumber: userData.contactNumber || baseUser.phone,
            industryType: userData.industryType,
            address: resolvedAddress,
            ...(userData.location ? { location: userData.location } : {}),
            website: userData.website,
            status: userData.status || 'active',
            createdAt: now,
            updatedAt: now
        };
        // Ensure companyAddress is never saved
        delete emplData.companyAddress;
        Object.keys(emplData).forEach(key => emplData[key] === undefined && delete emplData[key]);
        batch.set(emplRef, emplData, { merge: true });
    } else if (role === 'admin') {
        const adminRef = db.collection('admin').doc(docId);
        const adminData = {
            uid: parsedUid,
            email: baseUser.email,
            name: baseUser.name,
            phone: baseUser.phone,
            profileImage: baseUser.profileImage,
            createdAt: now,
            updatedAt: now
        };
        Object.keys(adminData).forEach(key => adminData[key] === undefined && delete adminData[key]);
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

    return { 
        uid: parsedUid,
        userId: parsedUid,
        ...baseUser, 
        role,
        companyName: userData.companyName,
        industryType: userData.industryType,
        contactPerson: userData.contactPerson,
        contactNumber: userData.contactNumber,
        address: resolvedAddress,
        location: userData.location || '',
        website: userData.website
    };
};

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
    const emplDoc = await db.collection('employers').doc(String(uid)).get();
    if (emplDoc.exists) {
        let employerData = emplDoc.data();
        const numericUid = typeof employerData.userId === 'number'
            ? employerData.userId
            : (typeof employerData.uid === 'number' 
                ? employerData.uid 
                : (!isNaN(Number(uid)) ? Number(uid) : null));

        let companySnap = { empty: true };
        if (numericUid !== null) {
            companySnap = await db.collection('companies').where('userId', '==', numericUid).get();
        }
        if (companySnap.empty) {
            companySnap = await db.collection('companies').where('userId', '==', String(uid)).get();
        }
        if (companySnap.empty) {
            companySnap = await db.collection('companies').where('employerId', '==', uid).get();
        }
        if (!companySnap.empty) {
            employerData = { ...employerData, ...companySnap.docs[0].data() };
        }
        
        const finalNumericId = numericUid !== null 
            ? numericUid 
            : (typeof employerData.userId === 'number' ? employerData.userId : Number(employerData.userId || employerData.uid || uid));
        
        const resolvedAddress = employerData.address || employerData.companyAddress || userData.address || '';
        const resolvedLocation = employerData.location || userData.location || '';
        
        delete employerData.companyAddress;
        delete userData.companyAddress;

        return { 
            ...userData, 
            ...employerData,
            uid: finalNumericId,
            userId: finalNumericId,
            address: resolvedAddress,
            location: resolvedLocation
        };
    }
    
    const resolvedAddress = userData.address || userData.companyAddress || '';
    const resolvedLocation = userData.location || '';
    delete userData.companyAddress;
    return { uid, ...userData, address: resolvedAddress, location: resolvedLocation };
};
