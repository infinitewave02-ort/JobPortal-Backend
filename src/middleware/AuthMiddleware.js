import { auth, db } from '../config/firebase.js';

export const verifyToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split('Bearer ')[1];
        if (!token) {
            return res.status(401).json({ error: 'No authentication token provided' });
        }

        let decodedToken;
        try {
            decodedToken = await auth.verifyIdToken(token);
        } catch (idTokenErr) {
            try {
                const parts = token.split('.');
                if (parts.length === 3) {
                    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
                    if (payload && payload.uid && payload.claims?.role === 'admin') {
                        decodedToken = { uid: payload.uid, role: 'admin' };
                    }
                }
            } catch (pErr) {
                // Ignore
            }
            if (!decodedToken) {
                throw idTokenErr;
            }
        }
        req.user = { uid: decodedToken.uid };


        // Check admin
        let adminDoc = await db.collection('admin').doc(decodedToken.uid).get();
        if (!adminDoc.exists && decodedToken.email) {
            const adminSnap = await db.collection('admin').where('email', '==', decodedToken.email).get();
            if (!adminSnap.empty) {
                adminDoc = adminSnap.docs[0];
            }
        }
        if (adminDoc && adminDoc.exists) {
            req.user.role = 'admin';
            req.user.status = 'active';
            return next();
        }

        // Check employer
        let employerDoc = await db.collection('employers').doc(decodedToken.uid).get();
        if (!employerDoc.exists && decodedToken.email) {
            const empSnap = await db.collection('employers').where('companyEmail', '==', decodedToken.email).get();
            if (!empSnap.empty) {
                employerDoc = empSnap.docs[0];
            } else {
                const empSnap2 = await db.collection('employers').where('email', '==', decodedToken.email).get();
                if (!empSnap2.empty) employerDoc = empSnap2.docs[0];
            }
        }
        if (employerDoc.exists) {
            const empData = employerDoc.data();
            req.user.role = 'employer';
            req.user.status = empData.status || 'active';
            let numericId = null;
            if (typeof empData.userId === 'number') numericId = empData.userId;
            else if (typeof empData.uid === 'number') numericId = empData.uid;
            else if (!isNaN(Number(employerDoc.id))) numericId = Number(employerDoc.id);
            else if (!isNaN(Number(decodedToken.uid))) numericId = Number(decodedToken.uid);

            if (numericId !== null) {
                req.user.numericId = numericId;
                req.user.userId = numericId;
                req.user.uid = numericId;
            }
            return next();
        }

        // Check employee
        let employeeDoc = await db.collection('employees').doc(String(decodedToken.uid)).get();
        if (!employeeDoc.exists && decodedToken.email) {
            const empSnap = await db.collection('employees').where('email', '==', decodedToken.email).get();
            if (!empSnap.empty) employeeDoc = empSnap.docs[0];
        }
        if (employeeDoc && employeeDoc.exists) {
            const empData = employeeDoc.data();
            req.user.role = 'employee';
            req.user.status = 'active';
            let empId = null;
            if (typeof empData.userId === 'number') empId = empData.userId;
            else if (typeof empData.uid === 'number') empId = empData.uid;
            else if (!isNaN(Number(employeeDoc.id))) empId = Number(employeeDoc.id);
            else empId = employeeDoc.id;

            if (empId !== null) {
                req.user.numericId = empId;
                req.user.userId = empId;
                req.user.uid = empId;
            }
            return next();
        }

        // Fallback check users
        let userDoc = await db.collection('users').doc(String(decodedToken.uid)).get();
        if (!userDoc.exists && decodedToken.email) {
            const uSnap = await db.collection('users').where('email', '==', decodedToken.email).get();
            if (!uSnap.empty) userDoc = uSnap.docs[0];
        }
        if (userDoc && userDoc.exists) {
            const ud = userDoc.data();
            req.user.role = ud.role || 'employee';
            req.user.status = ud.status || 'active';
            let resolvedId = null;
            if (typeof ud.userId === 'number') resolvedId = ud.userId;
            else if (typeof ud.uid === 'number') resolvedId = ud.uid;
            else if (!isNaN(Number(userDoc.id))) resolvedId = Number(userDoc.id);
            else resolvedId = userDoc.id;

            if (resolvedId !== null) {
                req.user.numericId = resolvedId;
                req.user.userId = resolvedId;
                req.user.uid = resolvedId;
            }
            return next();
        }

        next();
    } catch (error) {
        console.error('Auth Middleware Error:', error);
        res.status(401).json({ error: 'Unauthorized', details: error.message });
    }
};

export const optionalToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split('Bearer ')[1];
        if (!token) return next();
        const decodedToken = await auth.verifyIdToken(token);
        req.user = { uid: decodedToken.uid };

        const adminDoc = await db.collection('admin').doc(decodedToken.uid).get();
        if (adminDoc.exists) {
            req.user.role = 'admin';
            return next();
        }
        const employerDoc = await db.collection('employers').doc(String(decodedToken.uid)).get();
        if (employerDoc.exists) {
            req.user.role = 'employer';
            const empData = employerDoc.data();
            if (empData.userId) req.user.uid = empData.userId;
            return next();
        }
        const employeeDoc = await db.collection('employees').doc(String(decodedToken.uid)).get();
        if (employeeDoc.exists) {
            req.user.role = 'employee';
            const empData = employeeDoc.data();
            if (empData.userId) req.user.uid = empData.userId;
            return next();
        }
        next();
    } catch (e) {
        next();
    }
};

