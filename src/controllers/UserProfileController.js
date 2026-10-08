import { successResponse, errorResponse } from '../utils/Response.js';
import * as userProfileService from '../services/UserProfileService.js';
import { validateProfileUpdate } from '../validators/ProfileValidator.js';

/**
 * GET /api/users/profile
 * Returns the authenticated user's full profile from Firestore.
 */
export const getProfile = async (req, res, next) => {
    try {
        const { uid } = req.user;
        const profile = await userProfileService.getUserProfile(String(uid));
        return successResponse(res, 200, 'User profile fetched successfully', profile);
    } catch (error) {
        if (error.message === 'User not found') {
            return errorResponse(res, 404, 'User profile not found');
        }
        next(error);
    }
};

/**
 * PUT /api/users/profile
 * Updates the authenticated user's profile fields in Firestore.
 * Validates all fields before saving, auto-sets updatedAt,
 * and returns the latest full profile after update.
 */
export const updateProfile = async (req, res, next) => {
    try {
        const { uid } = req.user;
        const data = req.body;

        // Validate incoming fields
        const validationError = validateProfileUpdate(data);
        if (validationError) {
            return errorResponse(res, 400, validationError);
        }

        const updatedProfile = await userProfileService.updateUserProfile(String(uid), data);
        return successResponse(res, 200, 'Profile updated successfully', updatedProfile);
    } catch (error) {
        if (error.message === 'User not found') {
            return errorResponse(res, 404, 'User profile not found');
        }
        next(error);
    }
};

/**
 * PUT /api/users/profile/image
 * Uploads a profile image to Firebase Storage and saves the URL in Firestore.
 */
export const uploadProfileImage = async (req, res, next) => {
    try {
        const { uid } = req.user;

        if (!req.file) {
            return errorResponse(res, 400, 'No image file provided');
        }

        const imageUrl = await userProfileService.uploadProfileImage(
            String(uid),
            req.file.buffer,
            req.file.mimetype
        );

        return successResponse(res, 200, 'Profile image uploaded successfully', { profileImage: imageUrl });
    } catch (error) {
        next(error);
    }
};
