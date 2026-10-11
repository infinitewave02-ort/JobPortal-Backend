import { db } from '../config/firebase.js';

export const getNextJobId = async () => {
    const counterRef = db.collection('counters').doc('jobs');
    return await db.runTransaction(async (transaction) => {
        const doc = await transaction.get(counterRef);
        let nextId = 1001; // Start from 1001
        if (doc.exists && doc.data().lastId) {
            nextId = doc.data().lastId + 1;
        }
        transaction.set(counterRef, { lastId: nextId }, { merge: true });
        return nextId;
    });
};

export const createJob = async (employerId, jobData = {}) => {
    // 1. Resolve numeric employer ID (ensure it's Number for employers)
    const parsedEmployerId = !isNaN(Number(employerId)) ? Number(employerId) : employerId;
    let finalEmployerId = parsedEmployerId;

    if (typeof finalEmployerId !== 'number') {
        try {
            const empDoc = await db.collection('employers').doc(String(employerId)).get();
            if (empDoc.exists) {
                const data = empDoc.data();
                if (typeof data.userId === 'number') finalEmployerId = data.userId;
                else if (typeof data.uid === 'number') finalEmployerId = data.uid;
            }
        } catch (e) {
            console.warn('Could not lookup numeric employerId:', e.message);
        }
    }

    // 2. Resolve company details
    let companyId = jobData.companyId || (typeof finalEmployerId === 'number' ? String(finalEmployerId) : 'company_' + Date.now());
    let companyName = jobData.companyName || jobData.company || '';

    try {
        const compSnap = await db.collection('companies').where('userId', '==', finalEmployerId).get();
        if (!compSnap.empty) {
            const compDoc = compSnap.docs[0];
            const compData = compDoc.data();
            companyId = compDoc.id;
            companyName = companyName || compData.companyName || '';
        }
    } catch (e) {
        console.warn('Could not lookup company:', e.message);
    }

    // 3. Get next job id
    let nextJobId = 1001;
    try {
        nextJobId = await getNextJobId();
    } catch (e) {
        console.warn('Counter failed, using timestamp fallback:', e.message);
        nextJobId = Date.now();
    }

    const docId = String(nextJobId);
    const docRef = db.collection('jobs').doc(docId);
    const now = new Date().toISOString();

    const job = {
        jobId: docId,
        id: docId,
        numericJobId: typeof nextJobId === 'number' ? nextJobId : Number(docId),
        employerId: finalEmployerId,
        userId: finalEmployerId,
        companyId: String(companyId),
        company: companyName || jobData.company || 'Company',
        companyName: companyName || jobData.company || 'Company',
        title: jobData.title || '',
        description: jobData.description || '',
        location: jobData.location || '',
        salary: jobData.salary || '',
        employmentType: jobData.employmentType || 'Full-time',
        skills: Array.isArray(jobData.skills) ? jobData.skills : (jobData.skills ? [jobData.skills] : []),
        status: jobData.status || 'pending',
        applicationCount: 0,
        posted: jobData.posted || new Date().toLocaleDateString(),
        employerEmail: jobData.employerEmail || '',
        createdAt: now,
        updatedAt: now
    };

    // Remove undefined values to avoid Firestore errors
    Object.keys(job).forEach(k => job[k] === undefined && delete job[k]);

    await docRef.set(job);
    return job;
};

export const ensureCompanyJobs = async () => {
    try {
        const [employersSnap, companiesSnap] = await Promise.all([
            db.collection('employers').get(),
            db.collection('companies').get()
        ]);

        const activeTargets = [];

        employersSnap.docs.forEach(doc => {
            const data = doc.data();
            const status = (data.status || '').toLowerCase();
            const companyName = data.companyName || data.name;
            if (status === 'active' && companyName) {
                activeTargets.push({
                    employerId: data.userId || data.uid || doc.id,
                    companyName,
                    industryType: data.industryType || data.role,
                    location: data.location || data.address || 'Chennai, India'
                });
            }
        });

        companiesSnap.docs.forEach(doc => {
            const data = doc.data();
            const status = (data.status || '').toLowerCase();
            const companyName = data.companyName || data.name;
            if (status === 'active' && companyName) {
                const exists = activeTargets.some(t => t.companyName.toLowerCase() === companyName.toLowerCase());
                if (!exists) {
                    activeTargets.push({
                        employerId: data.userId || data.employerId || doc.id,
                        companyName,
                        industryType: data.industryType || 'Corporate',
                        location: data.location || data.address || 'Chennai, India'
                    });
                }
            }
        });

        for (const target of activeTargets) {
            const existingJobs = await db.collection('jobs').where('company', '==', target.companyName).get();
            if (existingJobs.empty) {
                let nextId = 1001;
                try {
                    nextId = await getNextJobId();
                } catch (e) {
                    nextId = 1000 + Math.floor(Math.random() * 9000);
                }
                const docId = String(nextId);
                const now = new Date().toISOString();
                await db.collection('jobs').doc(docId).set({
                    id: docId,
                    jobId: docId,
                    numericJobId: nextId,
                    employerId: target.employerId,
                    userId: target.employerId,
                    company: target.companyName,
                    companyName: target.companyName,
                    title: target.industryType ? `${target.industryType} Engineer` : 'Full Stack Developer',
                    location: target.location,
                    salary: '₹40,000 - ₹60,000 / month',
                    employmentType: 'Full-time',
                    description: `Immediate opening at ${target.companyName}. Seeking enthusiastic professionals to join our expanding team.`,
                    posted: 'Today',
                    status: 'active',
                    createdAt: now,
                    updatedAt: now
                });
                console.log(`✅ Automatically created active job post for approved company: ${target.companyName}`);
            }
        }
    } catch (err) {
        console.warn('ensureCompanyJobs error:', err.message);
    }
};

export const searchJobs = async (filters = {}) => {
    await ensureCompanyJobs();

    let query = db.collection('jobs');

    if (filters.status) {
        query = query.where('status', '==', filters.status);
    }
    if (filters.employerId) {
        return await getJobsByEmployer(filters.employerId);
    }
    if (filters.companyId) {
        query = query.where('companyId', '==', filters.companyId);
    }

    const snapshot = await query.get();
    let jobs = snapshot.docs.map(doc => ({ jobId: doc.id, id: doc.id, ...doc.data() }));

    // For employee view: ONLY approved jobs AND approved companies
    if (!filters.all && !filters.isAdmin) {
        const [employersSnap, companiesSnap] = await Promise.all([
            db.collection('employers').get(),
            db.collection('companies').get()
        ]);

        const activeEmployerMap = new Map();
        employersSnap.docs.forEach(d => {
            const ed = d.data();
            const s = (ed.status || '').toLowerCase();
            const cName = (ed.companyName || ed.name || '').toLowerCase();
            if (s === 'active') {
                activeEmployerMap.set(String(d.id), true);
                if (ed.userId) activeEmployerMap.set(String(ed.userId), true);
                if (cName) activeEmployerMap.set(cName, true);
            }
        });

        companiesSnap.docs.forEach(d => {
            const cd = d.data();
            const s = (cd.status || '').toLowerCase();
            const cName = (cd.companyName || cd.name || '').toLowerCase();
            if (s === 'active') {
                activeEmployerMap.set(String(d.id), true);
                if (cd.userId) activeEmployerMap.set(String(cd.userId), true);
                if (cName) activeEmployerMap.set(cName, true);
            }
        });

        jobs = jobs.filter(job => {
            const status = (job.status || '').toLowerCase();
            const isJobApproved = (status === 'active' || status === 'approved');
            if (!isJobApproved) return false;

            const empId = String(job.employerId || job.userId || '');
            const compName = (job.company || job.companyName || '').toLowerCase();
            const isCompanyApproved = activeEmployerMap.has(empId) || activeEmployerMap.has(compName);
            return isCompanyApproved;
        });
    }

    return jobs;
};


export const getJobById = async (id) => {
    let doc = await db.collection('jobs').doc(String(id)).get();
    if (!doc.exists) {
        const snap = await db.collection('jobs').where('jobId', '==', String(id)).get();
        if (!snap.empty) doc = snap.docs[0];
    }
    if (!doc || !doc.exists) throw new Error('Job not found');
    return { jobId: doc.id, id: doc.id, ...doc.data() };
};

export const updateJob = async (employerId, id, jobData) => {
    let jobRef = db.collection('jobs').doc(String(id));
    let doc = await jobRef.get();
    if (!doc.exists) {
        const snap = await db.collection('jobs').where('jobId', '==', String(id)).get();
        if (!snap.empty) {
            doc = snap.docs[0];
            jobRef = doc.ref;
        }
    }
    if (!doc || !doc.exists) throw new Error('Job not found');
    const docData = doc.data();
    if (String(docData.employerId) !== String(employerId) && String(docData.userId) !== String(employerId)) {
        throw new Error('Unauthorized');
    }

    const updatePayload = {
        ...jobData,
        updatedAt: new Date().toISOString()
    };
    Object.keys(updatePayload).forEach(k => updatePayload[k] === undefined && delete updatePayload[k]);

    await jobRef.update(updatePayload);
    return { id: doc.id, jobId: doc.id, ...docData, ...updatePayload };
};

export const deleteJob = async (employerId, id) => {
    let jobRef = db.collection('jobs').doc(String(id));
    let doc = await jobRef.get();
    if (!doc.exists) {
        const snap = await db.collection('jobs').where('jobId', '==', String(id)).get();
        if (!snap.empty) {
            doc = snap.docs[0];
            jobRef = doc.ref;
        }
    }
    if (!doc || !doc.exists) throw new Error('Job not found');
    const docData = doc.data();
    if (String(docData.employerId) !== String(employerId) && String(docData.userId) !== String(employerId)) {
        throw new Error('Unauthorized');
    }

    await jobRef.delete();
    return true;
};

export const getJobsByEmployer = async (employerId) => {
    const numericId = !isNaN(Number(employerId)) ? Number(employerId) : null;
    const stringId = String(employerId);
    
    let docs = [];
    if (numericId !== null) {
        const numSnap = await db.collection('jobs').where('employerId', '==', numericId).get();
        docs.push(...numSnap.docs);
        const userNumSnap = await db.collection('jobs').where('userId', '==', numericId).get();
        docs.push(...userNumSnap.docs);
    }
    const strSnap = await db.collection('jobs').where('employerId', '==', stringId).get();
    docs.push(...strSnap.docs);

    // Deduplicate
    const seen = new Set();
    const result = [];
    for (const doc of docs) {
        if (!seen.has(doc.id)) {
            seen.add(doc.id);
            result.push({ jobId: doc.id, id: doc.id, ...doc.data() });
        }
    }
    return result;
};
