import { db } from '../config/firebase.js';

/**
 * Firestore Collection Paths
 * Top-level collections based on the database structure.
 */

// Users
export const usersCol = () => db.collection('users');
export const adminCol = () => db.collection('admin');

// Employee Domain
export const employeesCol = () => db.collection('employees');
export const resumesCol = () => db.collection('resumes');
export const applicationsCol = () => db.collection('applications');

// Employer Domain
export const employersCol = () => db.collection('employers');
export const companiesCol = () => db.collection('companies');
export const jobsCol = () => db.collection('jobs');

// System / General
export const messagesCol = () => db.collection('messages');
export const notificationsCol = () => db.collection('notifications');
export const plansCol = () => db.collection('plans');
export const paymentsCol = () => db.collection('payments');
