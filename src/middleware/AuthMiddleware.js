import { auth, db } from '../config/firebase.js';

export const verifyToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split('Bearer ')[1];
        if (!token) {
            return res.status(401).json({ error: 'No authentication token provided' });
        }

        const decodedToken = await auth.verifyIdToken(token);
        req.user = { uid: decodedToken.uid };

        // Check admin
        const adminDoc = await db.collection('admin').doc(decodedToken.uid).get();
        if (adminDoc.exists) {
            req.user.role = 'admin';
            req.user.status = 'active';
            return next();
        }

        // Check employer
        const employerDoc = await db.collection('employers').doc(decodedToken.uid).get();
        if (employerDoc.exists) {
            req.user.role = 'employer';
            req.user.status = employerDoc.data().status || 'active';
            return next();
        }

        // Check employee
        const employeeDoc = await db.collection('employees').doc(decodedToken.uid).get();
        if (employeeDoc.exists) {
            req.user.role = 'employee';
            req.user.status = 'active';
            return next();
        }

        // Fallback check users
        const userDoc = await db.collection('users').doc(decodedToken.uid).get();
        if (userDoc.exists) {
            req.user.role = userDoc.data().role || 'employee';
            req.user.status = userDoc.data().status || 'active';
        }

        next();
    } catch (error) {
        console.error('Auth Middleware Error:', error);
        res.status(401).json({ error: 'Unauthorized', details: error.message });
    }
};
