import { db } from '../config/firebase.js';

const getSkillsText = (skills) => {
    if (Array.isArray(skills)) return skills.join(' ');
    if (typeof skills === 'string') return skills;
    return '';
};

export const searchCandidates = async (filters = {}) => {
    const snapshot = await db.collection('employees').get();
    let candidates = snapshot.docs.map(doc => ({ id: doc.id, uid: doc.id, ...doc.data() }));

    if (filters.name) {
        const nameQuery = String(filters.name).toLowerCase();
        candidates = candidates.filter(c => (c.fullName || c.name || '').toLowerCase().includes(nameQuery));
    }
    if (filters.skills) {
        const skillsQuery = String(filters.skills).toLowerCase();
        candidates = candidates.filter(c => getSkillsText(c.skills).toLowerCase().includes(skillsQuery));
    }
    if (filters.location) {
        const locQuery = String(filters.location).toLowerCase();
        candidates = candidates.filter(c => (c.currentLocation || c.location || '').toLowerCase().includes(locQuery));
    }
    if (filters.experience) {
        const expQuery = String(filters.experience).toLowerCase();
        candidates = candidates.filter(c => String(c.experience || c.exp || '').toLowerCase().includes(expQuery));
    }
    if (filters.jobTitle) {
        const jobQuery = String(filters.jobTitle).toLowerCase();
        candidates = candidates.filter(c => (c.jobTitle || c.role || '').toLowerCase().includes(jobQuery));
    }
    if (filters.q) {
        const q = String(filters.q).toLowerCase().trim();
        candidates = candidates.filter(c => 
            (c.fullName || c.name || '').toLowerCase().includes(q) ||
            getSkillsText(c.skills).toLowerCase().includes(q) ||
            (c.jobTitle || c.role || '').toLowerCase().includes(q) ||
            (c.currentLocation || c.location || '').toLowerCase().includes(q) ||
            (c.qualification || c.education || '').toLowerCase().includes(q)
        );
    }

    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 20;
    const startIndex = (page - 1) * limit;
    const paginated = candidates.slice(startIndex, startIndex + limit);

    return {
        candidates: paginated,
        total: candidates.length,
        page,
        limit,
        totalPages: Math.ceil(candidates.length / limit)
    };
};

export const getCandidateById = async (id) => {
    const doc = await db.collection('employees').doc(id).get();
    if (!doc.exists) throw new Error('Candidate not found');
    return { id: doc.id, uid: doc.id, ...doc.data() };
};

export const getOpenToWorkCandidates = async () => {
    const snapshot = await db.collection('employees').where('openToWork', '==', true).get();
    return snapshot.docs.map(doc => ({ id: doc.id, uid: doc.id, ...doc.data() }));
};
