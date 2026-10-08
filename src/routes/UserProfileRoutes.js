import express from 'express';
import * as UserProfileController from '../controllers/UserProfileController.js';
import { verifyToken } from '../middleware/AuthMiddleware.js';
import { uploadImage } from '../middleware/UploadMiddleware.js';

const router = express.Router();

// All routes require JWT authentication
router.use(verifyToken);

// GET /api/users/profile - Fetch authenticated user's profile
router.get('/profile', UserProfileController.getProfile);

// PUT /api/users/profile - Update authenticated user's profile
router.put('/profile', UserProfileController.updateProfile);

// PUT /api/users/profile/image - Upload profile image
router.put('/profile/image', uploadImage.single('profileImage'), UserProfileController.uploadProfileImage);

export default router;
