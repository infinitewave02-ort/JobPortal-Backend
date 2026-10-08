import { successResponse } from '../utils/Response.js';
import * as authService from '../services/AuthService.js';
import { auth } from '../config/firebase.js';

export const syncUser = async (req, res, next) => {
    try {
        const { uid } = req.user;
        const userData = req.body;
        const user = await authService.syncUserWithFirestore(String(uid), userData);
        return res.status(200).json({ success: true, user });
    } catch (error) {
        next(error);
    }
};

export const getMe = async (req, res, next) => {
    try {
        const { uid } = req.user;
        const profile = await authService.getUserProfile(String(uid));
        return res.status(200).json({ success: true, user: profile });
    } catch (error) {
        next(error);
    }
};

export const registerEmployee = async (req, res, next) => {
    try {
        const {
            fullName, email, password,
            jobTitle, experience, qualification,
            currentLocation, preferredLocation,
            skills, expectedSalary, noticePeriod, gender, phone
        } = req.body;
        const role = req.body.role || 'employee';

        // Email and password are required for everyone
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and Password are required.' });
        }

        // fullName is only required for employees
        if (role === 'employee' && !fullName) {
            return res.status(400).json({ success: false, message: 'Full Name is required for employees.' });
        }

        // 1. Get next auto-incrementing ID
        const nextId = await authService.getNextUserId();
        const uid = String(nextId);

        // 2. Create user in Firebase Auth with custom ID
        const userRecord = await auth.createUser({
            uid,
            email,
            password,
            displayName: fullName,
        });

        // 2. Save user in Firestore
        const userData = {
            fullName,
            email,
            role,
            jobTitle,
            experience,
            qualification,
            currentLocation,
            preferredLocation,
            skills,
            expectedSalary,
            noticePeriod,
            gender,
            phone
        };

        // Remove undefined properties to avoid Firestore errors
        Object.keys(userData).forEach(key => {
            if (userData[key] === undefined) {
                delete userData[key];
            }
        });
        const user = await authService.syncUserWithFirestore(userRecord.uid, userData);
        console.log(`User saved successfully for ${role}: ${userRecord.uid}`);

        // Capitalize the first letter of the role for the success message
        const roleName = role.charAt(0).toUpperCase() + role.slice(1);
        return successResponse(res, 201, `${roleName} registered successfully`, user);
    } catch (error) {
        next(error);
    }
};

export const registerEmployer = async (req, res, next) => {
    try {
        const {
            email, password,
            companyName, industryType, contactPerson,
            companyEmail, contactNumber, companyAddress,
            role = 'employer'
        } = req.body;

        if (!companyName) {
            return res.status(400).json({ success: false, message: 'Company Name is required.' });
        }
        
        const finalEmail = email || companyEmail;

        if (!finalEmail || !password) {
            return res.status(400).json({ success: false, message: 'Email (or companyEmail) and Password are required.' });
        }

        // 1. Get next auto-incrementing ID
        const nextId = await authService.getNextUserId();
        const uid = String(nextId);

        // 2. Create user in Firebase Auth with custom ID
        const userRecord = await auth.createUser({
            uid,
            email: finalEmail,
            password,
            displayName: contactPerson || companyName,
        });

        // 3. Save user in Firestore
        const userData = {
            email: finalEmail,
            name: contactPerson || companyName,
            role,
            companyName,
            industryType,
            contactPerson,
            companyEmail,
            contactNumber,
            companyAddress
        };

        // Remove undefined properties
        Object.keys(userData).forEach(key => {
            if (userData[key] === undefined) {
                delete userData[key];
            }
        });

        const user = await authService.syncUserWithFirestore(userRecord.uid, userData);
        console.log(`User saved successfully for ${role}: ${userRecord.uid}`);

        return successResponse(res, 201, 'Employer registered successfully', user);
    } catch (error) {
        next(error);
    }
};

