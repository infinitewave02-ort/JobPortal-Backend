import express from 'express';
import adminRoutes from './AdminRoutes.js';
import applicationRoutes from './ApplicationRoutes.js';
import authRoutes from './AuthRoutes.js';
import candidateRoutes from './CandidateRoutes.js';
import companyRoutes from './CompanyRoutes.js';
import employeeRoutes from './EmployeeRoutes.js';
import employerRoutes from './EmployerRoutes.js';
import jobRoutes from './JobRoutes.js';
import messageRoutes from './MessageRoutes.js';
import notificationRoutes from './NotificationRoutes.js';
import paymentRoutes from './PaymentRoutes.js';
import planRoutes from './PlanRoutes.js';
import profileRoutes from './ProfileRoutes.js';
import resumeRoutes from './ResumeRoutes.js';
import testRoutes from './TestRoutes.js';
import userProfileRoutes from './UserProfileRoutes.js';

const router = express.Router();

router.use('/users', userProfileRoutes);
router.use('/admin', adminRoutes);
router.use('/applications', applicationRoutes);
router.use('/auth', authRoutes);
router.use('/candidates', candidateRoutes);
router.use('/company', companyRoutes);
router.use('/employees', employeeRoutes);
router.use('/employers', employerRoutes);
router.use('/jobs', jobRoutes);
router.use('/messages', messageRoutes);
router.use('/notifications', notificationRoutes);
router.use('/payments', paymentRoutes);
router.use('/plans', planRoutes);
router.use('/profile', profileRoutes);
router.use('/resumes', resumeRoutes);
router.use('/test', testRoutes);

export default router;
