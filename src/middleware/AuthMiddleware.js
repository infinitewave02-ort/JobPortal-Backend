import { auth, db } from '../config/firebase.js';

export const verifyToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split('Bearer ')[1];
        if (!token) {
            return res.status(401).json({ error: 'No authentication token provided' });
        }

        const decodedToken = await auth.verifyIdToken(token);
        req.user = { uid: decodedToken.uid };
        
        // Fetch user role and status from Firestore and attach to req.user
        const userDoc = await db.collection('users').doc(decodedToken.uid).get();
        if (userDoc.exists) {
            req.user.role = userDoc.data().role;
            req.user.status = userDoc.data().status;
        }

        next();
    } catch (error) {
        console.error('Auth Middleware Error:', error);
        res.status(401).json({ error: 'Unauthorized', details: error.message });
    }
};
