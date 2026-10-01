import { successResponse } from '../utils/Response.js';
import * as authService from '../services/AuthService.js';
import { auth } from '../config/firebase.js';

export const syncUser = async (req, res, next) => {
    try {
        const { uid } = req.user;
        const userData = req.body;
        // const user = await authService.syncUserWithFirestore(uid, userData);
        return successResponse(res, 200, 'User synced successfully', { uid, ...userData });
    } catch (error) {
        next(error);
    }
};

export const getMe = async (req, res, next) => {
    try {
        const { uid } = req.user;
        // const profile = await authService.getUserProfile(uid);
        return successResponse(res, 200, 'Profile fetched successfully', { uid });
    } catch (error) {
        next(error);
    }
};

export const registerEmployee = async (req, res, next) => {
    try {
        const { fullName, email, password } = req.body;
        
        if (!fullName || !email || !password) {
            return res.status(400).json({ success: false, message: 'Full Name, Email, and Password are required.' });
        }

        // 1. Create user in Firebase Auth
        const userRecord = await auth.createUser({
            email,
            password,
            displayName: fullName,
        });

        // 2. Save user in Firestore
        const userData = {
            fullName,
            email,
            role: 'employee'
        };
        const user = await authService.syncUserWithFirestore(userRecord.uid, userData);

        return successResponse(res, 201, 'Employee registered successfully', user);
    } catch (error) {
        next(error);
    }
};
