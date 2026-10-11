import { db, auth } from '../config/firebase.js';

export const ensureDefaultAdmin = async () => {
    try {
        const snap = await db.collection('admin').get();
        if (!snap.empty) {
            return;
        }

        console.log('⚡ Initializing default admin credentials...');
        const defaultEmail = 'admin@jobportal.com';
        const defaultPassword = 'Jobportal@44';
        const defaultUsername = 'Jobportaladmin';

        let uid = 'admin_super';
        try {
            const existingUser = await auth.getUserByEmail(defaultEmail);
            uid = existingUser.uid;
            await auth.updateUser(uid, { password: defaultPassword, displayName: defaultUsername });
        } catch (err) {
            if (err.code === 'auth/user-not-found') {
                const created = await auth.createUser({
                    email: defaultEmail,
                    password: defaultPassword,
                    displayName: defaultUsername
                });
                uid = created.uid;
            } else {
                throw err;
            }
        }

        const now = new Date().toISOString();
        await db.collection('admin').doc(uid).set({
            uid,
            username: defaultUsername,
            email: defaultEmail,
            password: defaultPassword,
            role: 'admin',
            createdAt: now,
            updatedAt: now
        }, { merge: true });

        console.log(`✅ Default admin initialized with UID: ${uid}`);
    } catch (error) {
        console.error('Error ensuring default admin:', error.message);
    }
};

export const loginAdmin = async ({ username, email, password }) => {
    if (!password) {
        throw new Error('Password is required.');
    }
    if (!username && !email) {
        throw new Error('Username or email is required.');
    }

    const snap = await db.collection('admin').get();
    if (snap.empty) {
        await ensureDefaultAdmin();
    }

    const reloadedSnap = await db.collection('admin').get();
    let adminMatch = null;

    const trimmedUser = username ? username.trim().toLowerCase() : '';
    const trimmedEmail = email ? email.trim().toLowerCase() : '';

    for (const doc of reloadedSnap.docs) {
        const data = doc.data();
        const docUser = (data.username || '').trim().toLowerCase();
        const docEmail = (data.email || '').trim().toLowerCase();

        if (trimmedUser && trimmedEmail && trimmedUser !== trimmedEmail) {
            if (docUser === trimmedUser && docEmail === trimmedEmail) {
                adminMatch = { id: doc.id, ...data };
                break;
            }
        } else {
            const query = trimmedUser || trimmedEmail;
            if (query && (docUser === query || docEmail === query)) {
                adminMatch = { id: doc.id, ...data };
                break;
            }
        }

    }

    if (!adminMatch) {
        throw new Error('Invalid admin credentials. Only authorized admin data can access.');
    }

    if (adminMatch.password !== password) {
        throw new Error('Invalid password. Only authorized admin data can access.');
    }

    // Generate Firebase custom token for client authentication
    const customToken = await auth.createCustomToken(adminMatch.uid || adminMatch.id, { role: 'admin' });

    return {
        uid: adminMatch.uid || adminMatch.id,
        username: adminMatch.username,
        email: adminMatch.email,
        role: 'admin',
        token: customToken
    };
};

export const getAdminProfile = async (adminId) => {
    let doc = await db.collection('admin').doc(String(adminId)).get();
    if (!doc.exists) {
        const snap = await db.collection('admin').get();
        if (!snap.empty) {
            doc = snap.docs[0];
        } else {
            throw new Error('Admin account not found.');
        }
    }

    const data = doc.data();
    return {
        uid: doc.id,
        username: data.username || 'Jobportaladmin',
        email: data.email || 'admin@jobportal.com',
        role: 'admin'
    };
};

export const updateAdminProfile = async (adminId, { username, email, password }) => {
    let adminRef = db.collection('admin').doc(String(adminId));
    let doc = await adminRef.get();
    if (!doc.exists) {
        const snap = await db.collection('admin').get();
        if (!snap.empty) {
            adminRef = snap.docs[0].ref;
            doc = snap.docs[0];
        } else {
            throw new Error('Admin document not found.');
        }
    }

    const currentData = doc.data();
    const updates = { updatedAt: new Date().toISOString() };
    const authUpdates = {};

    if (username && username.trim()) {
        updates.username = username.trim();
        authUpdates.displayName = username.trim();
    }

    if (email && email.trim()) {
        const cleanEmail = email.trim().toLowerCase();
        updates.email = cleanEmail;
        authUpdates.email = cleanEmail;
    }

    if (password && password.trim()) {
        updates.password = password.trim();
        authUpdates.password = password.trim();
    }

    if (Object.keys(authUpdates).length > 0) {
        try {
            await auth.updateUser(currentData.uid || doc.id, authUpdates);
        } catch (authErr) {
            if (authErr.code === 'auth/email-already-exists') {
                throw new Error('This email is already in use.');
            }
            console.warn('Firebase Auth update warning:', authErr.message);
        }
    }

    await adminRef.set(updates, { merge: true });

    const updatedDoc = await adminRef.get();
    const finalData = updatedDoc.data();

    return {
        uid: finalData.uid || doc.id,
        username: finalData.username,
        email: finalData.email,
        role: 'admin'
    };
};


export const getDashboardMetrics = async (adminId) => {
    return await refreshDashboardStats(adminId);
};

export const refreshDashboardStats = async (adminId) => {
    // 1. Ensure any approved active company has live job posts in DB
    const { ensureCompanyJobs } = await import('./JobService.js');
    await ensureCompanyJobs();

    // 2. Fetch all collections in parallel from Firestore
    const [employeesSnap, employersSnap, jobsSnap, resumesSnap, paymentsSnap] = await Promise.all([
        db.collection('employees').get(),
        db.collection('employers').get(),
        db.collection('jobs').get(),
        db.collection('resumes').get(),
        db.collection('payments').get()
    ]);

    // Format Employees
    const employees = employeesSnap.docs.map(doc => {
        const d = doc.data();
        const hasResume = d.resumeFile || d.resumeUrl;
        return {
            id: doc.id,
            uid: d.uid || doc.id,
            name: d.fullName || d.name || 'Candidate',
            fullName: d.fullName || d.name || 'Candidate',
            role: d.jobTitle || d.role || 'Job Seeker',
            jobTitle: d.jobTitle || d.role || 'Job Seeker',
            email: d.email || '',
            phone: d.phone || '',
            location: d.currentLocation || d.location || '',
            status: d.status || 'Active',
            openToWork: d.openToWork !== false, // default true for candidates
            resumeFile: hasResume ? (typeof d.resumeFile === 'object' && d.resumeFile !== null ? d.resumeFile : { name: `${d.fullName || d.name || 'Candidate'}_Resume.pdf`, uri: (typeof d.resumeFile === 'string' ? d.resumeFile : (d.resumeUrl || '')) }) : null,
            createdAt: d.createdAt || ''
        };
    });

    // Check resumes collection to also attach to matching employee if not marked
    const resumeDocs = resumesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    resumeDocs.forEach(r => {
        const fileUri = r.downloadUrl || r.fileUrl || r.resumeUrl || '';
        const fileName = r.fileName || 'Resume.pdf';
        const emp = employees.find(e => (r.email && e.email === r.email) || String(e.id) === String(r.employeeId || r.userId || r.uid));
        if (emp) {
            if (!emp.resumeFile || (typeof emp.resumeFile === 'object' && !emp.resumeFile.uri && fileUri)) {
                emp.resumeFile = { name: fileName, uri: fileUri, size: r.fileSize };
            }
        }
    });

    // Format Employers
    const employers = employersSnap.docs.map(doc => {
        const d = doc.data();
        const companyName = d.companyName || d.name || 'Company';
        return {
            id: doc.id,
            uid: d.userId || d.uid || doc.id,
            userId: d.userId || d.uid || doc.id,
            name: companyName,
            companyName: companyName,
            role: d.industryType || d.role || 'Corporate',
            industryType: d.industryType || d.role || 'Corporate',
            contactPerson: d.contactPerson || d.name || companyName,
            contactNumber: d.contactNumber || d.phone || '',
            email: d.companyEmail || d.email || '',
            companyEmail: d.companyEmail || d.email || '',
            address: d.address || d.companyAddress || '',
            location: d.location || '',
            status: (d.status && d.status.toLowerCase() === 'active') ? 'Active' : (d.status || 'Pending'),
            createdAt: d.createdAt || ''
        };
    });

    // Format Jobs
    const jobs = jobsSnap.docs.map(doc => {
        const d = doc.data();
        return {
            id: doc.id,
            jobId: doc.id,
            title: d.title || d.jobTitle || 'Open Position',
            company: d.company || d.companyName || 'Company',
            companyName: d.company || d.companyName || 'Company',
            location: d.location || 'Remote',
            salary: d.salary || 'Best in Industry',
            status: d.status ? (d.status.charAt(0).toUpperCase() + d.status.slice(1)) : 'Active',
            posted: d.posted || 'Recently',
            description: d.description || '',
            employmentType: d.employmentType || 'Full-time'
        };
    });

    const openToWorkCount = employees.filter(e => e.openToWork).length;
    const resumesCount = Math.max(resumesSnap.size, employees.filter(e => e.resumeFile).length);
    const activeJobsCount = jobs.filter(j => j.status?.toLowerCase() === 'active').length;
    // Calculate and format Payment Transactions (Completed & Pending)
    const paymentList = [];
    const employerMap = new Map();
    employers.forEach(emp => {
        employerMap.set(String(emp.id), emp);
        if (emp.uid) employerMap.set(String(emp.uid), emp);
    });

    // 1. Process explicit records from payments collection
    paymentsSnap.docs.forEach(doc => {
        const d = doc.data();
        const emp = employerMap.get(String(d.userId)) || employerMap.get(String(d.employerId));
        const status = (d.status || 'successful').toLowerCase();
        paymentList.push({
            id: doc.id,
            paymentId: d.paymentId || doc.id,
            userId: d.userId || (emp ? emp.id : ''),
            companyName: emp ? (emp.companyName || emp.name) : (d.companyName || 'Corporate Client'),
            contactPerson: emp ? (emp.contactPerson || emp.name) : (d.contactPerson || 'Employer'),
            contactNumber: emp ? (emp.contactNumber || emp.phone) : (d.contactNumber || ''),
            email: emp ? emp.email : (d.email || ''),
            amount: Number(d.amount) || 4000,
            planName: d.planName || (d.planId ? `Plan (${d.planId})` : '3-Month Standard Hiring Plan'),
            status: (status === 'successful' || status === 'completed') ? 'completed' : 'pending',
            paymentMethod: d.paymentMethod || 'UPI / Online Transfer',
            transactionId: d.transactionId || `TXN${doc.id.substring(0, 8).toUpperCase()}`,
            createdAt: d.createdAt || new Date().toISOString(),
            updatedAt: d.updatedAt || d.createdAt || new Date().toISOString()
        });
    });

    // 2. Process employers subscription status (synthesize payment record if none exists)
    employers.forEach(emp => {
        const hasRecord = paymentList.some(p => String(p.userId) === String(emp.id) || (emp.uid && String(p.userId) === String(emp.uid)));
        if (!hasRecord) {
            const isPending = emp.status && emp.status.toLowerCase() === 'pending';
            paymentList.push({
                id: `pay-emp-${emp.id}`,
                paymentId: `PAY-${emp.id}`,
                userId: emp.id,
                companyName: emp.companyName || emp.name || 'Company',
                contactPerson: emp.contactPerson || emp.name || 'Employer',
                contactNumber: emp.contactNumber || emp.phone || '',
                email: emp.email || '',
                amount: 4000,
                planName: '3-Month Standard Hiring Plan',
                status: isPending ? 'pending' : 'completed',
                paymentMethod: isPending ? 'Awaiting Payment' : 'UPI / Online Transfer',
                transactionId: isPending ? 'PENDING' : `TXN${emp.id}8921`,
                createdAt: emp.createdAt || new Date().toISOString(),
                updatedAt: emp.createdAt || new Date().toISOString()
            });
        }
    });

    const completedPaymentsAmount = paymentList
        .filter(p => p.status === 'completed' || p.status === 'successful')
        .reduce((acc, p) => acc + p.amount, 0);

    const pendingPaymentsAmount = paymentList
        .filter(p => p.status === 'pending')
        .reduce((acc, p) => acc + p.amount, 0);

    const completedPaymentsCount = paymentList.filter(p => p.status === 'completed' || p.status === 'successful').length;
    const pendingPaymentsCount = paymentList.filter(p => p.status === 'pending').length;

    const stats = {
        totalEmployees: employees.length,
        totalEmployers: employers.length,
        openToWork: openToWorkCount,
        totalResumes: resumesCount,
        totalJobs: jobs.length,
        activeJobs: activeJobsCount,
        totalPayments: completedPaymentsAmount,
        pendingPayments: pendingPaymentsAmount,
        completedPaymentsCount: completedPaymentsCount,
        pendingPaymentsCount: pendingPaymentsCount,
        employees,
        employers,
        jobs,
        resumes: resumeDocs,
        payments: paymentList
    };

    if (adminId && adminId !== 'default_admin') {
        await db.collection('admin').doc(String(adminId)).collection('dashboard').doc('statistics').set({
            totalEmployees: employees.length,
            totalEmployers: employers.length,
            openToWork: openToWorkCount,
            totalResumes: resumesCount,
            totalJobs: jobs.length,
            totalPayments: completedPaymentsAmount,
            pendingPayments: pendingPaymentsAmount,
            updatedAt: new Date().toISOString()
        }, { merge: true }).catch(() => {});
    }

    return stats;
};

export const listUsers = async (filters) => {
    const snapshot = await db.collection('users').get();
    return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
};

export const listEmployees = async () => {
    const stats = await refreshDashboardStats();
    return stats.employees;
};

export const listEmployers = async () => {
    const stats = await refreshDashboardStats();
    return stats.employers;
};

export const listAllJobs = async () => {
    const stats = await refreshDashboardStats();
    return stats.jobs;
};

export const listAllPayments = async () => {
    const stats = await refreshDashboardStats();
    return stats.payments || [];
};

export const updatePaymentStatus = async (paymentId, status) => {
    const normStatus = status.toLowerCase() === 'completed' || status.toLowerCase() === 'successful' ? 'successful' : 'pending';
    const paymentRef = db.collection('payments').doc(paymentId);
    const doc = await paymentRef.get();
    const now = new Date().toISOString();

    if (doc.exists) {
        await paymentRef.update({
            status: normStatus,
            updatedAt: now
        });
        const data = doc.data();
        if (data.userId && normStatus === 'successful') {
            await db.collection('employers').doc(String(data.userId)).set({
                status: 'active',
                updatedAt: now
            }, { merge: true }).catch(() => {});
        }
        return { paymentId, status: normStatus };
    } else {
        const empId = paymentId.replace('pay-emp-', '').replace('PAY-', '');
        const newDoc = db.collection('payments').doc();
        await newDoc.set({
            paymentId: newDoc.id,
            userId: empId,
            amount: 4000,
            status: normStatus,
            planId: 'plan_3m',
            paymentMethod: 'Manual Approval by Admin',
            transactionId: `ADM${Date.now().toString().slice(-6)}`,
            createdAt: now,
            updatedAt: now
        });
        if (normStatus === 'successful') {
            await db.collection('employers').doc(String(empId)).set({
                status: 'active',
                updatedAt: now
            }, { merge: true }).catch(() => {});
        }
        return { paymentId: newDoc.id, status: normStatus };
    }
};

export const updateUserStatus = async (id, status) => {
    await db.collection('users').doc(String(id)).set({ status, updatedAt: new Date().toISOString() }, { merge: true });
    return { id, status };
};

export const updateEmployerStatus = async (id, status) => {
    const docId = String(id);
    const normalizedStatus = status.toLowerCase() === 'active' ? 'Active' : status;
    const now = new Date().toISOString();

    // 1. Update employer in employers collection
    await db.collection('employers').doc(docId).set({
        status: normalizedStatus.toLowerCase(),
        updatedAt: now
    }, { merge: true });

    // 2. Also update companies collection if present
    const numericId = Number(docId);
    let companyDocs = [];
    if (!isNaN(numericId)) {
        const snap = await db.collection('companies').where('userId', '==', numericId).get();
        companyDocs.push(...snap.docs);
    }
    const snap2 = await db.collection('companies').where('employerId', '==', docId).get();
    companyDocs.push(...snap2.docs);

    for (const cDoc of companyDocs) {
        await cDoc.ref.set({ status: normalizedStatus.toLowerCase(), updatedAt: now }, { merge: true });
    }

    // 3. Update users collection if present
    const userDoc = await db.collection('users').doc(docId).get();
    if (userDoc.exists) {
        await userDoc.ref.set({ status: normalizedStatus.toLowerCase(), updatedAt: now }, { merge: true });
    }

    // 4. If status is active, ensure company job post is created and live for employees
    if (normalizedStatus.toLowerCase() === 'active') {
        const { ensureCompanyJobs } = await import('./JobService.js');
        await ensureCompanyJobs();
    }

    return { id: docId, status: normalizedStatus };
};

export const deleteEmployer = async (id) => {
    const docId = String(id);
    await db.collection('employers').doc(docId).delete();
    return { id: docId, success: true };
};

export const deleteEmployee = async (id) => {
    const docId = String(id);
    await db.collection('employees').doc(docId).delete();
    return { id: docId, success: true };
};

export const deleteJob = async (id) => {
    const docId = String(id);
    await db.collection('jobs').doc(docId).delete();
    return { id: docId, success: true };
};

export const getJobDetails = async (id) => {
    const docId = String(id);
    let doc = await db.collection('jobs').doc(docId).get();
    if (!doc.exists) {
        const snap = await db.collection('jobs').where('jobId', '==', docId).get();
        if (!snap.empty) doc = snap.docs[0];
    }
    if (!doc || !doc.exists) {
        throw new Error('Job post not found');
    }
    const data = doc.data();
    return {
        id: doc.id,
        jobId: doc.id,
        ...data,
        status: data.status ? (data.status.charAt(0).toUpperCase() + data.status.slice(1).toLowerCase()) : 'Active'
    };
};

export const updateJobStatus = async (id, status) => {
    const docId = String(id);
    let jobRef = db.collection('jobs').doc(docId);
    let doc = await jobRef.get();
    if (!doc.exists) {
        const snap = await db.collection('jobs').where('jobId', '==', docId).get();
        if (!snap.empty) {
            doc = snap.docs[0];
            jobRef = doc.ref;
        }
    }
    if (!doc || !doc.exists) {
        throw new Error('Job post not found');
    }

    const normalizedStatus = (status || 'active').toLowerCase();
    const now = new Date().toISOString();
    await jobRef.set({
        status: normalizedStatus,
        updatedAt: now
    }, { merge: true });

    return {
        id: doc.id,
        jobId: doc.id,
        status: normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1)
    };
};

export const approveJob = async (id) => {
    return await updateJobStatus(id, 'active');
};

