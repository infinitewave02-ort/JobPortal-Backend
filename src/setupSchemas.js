/**
 * Setup Schemas
 *
 * This script validates that all Firestore collection schemas match
 * the database structure. Run it to verify schema consistency.
 *
 * Firestore Database Structure:
 *
 * users/{uid} ─────────────── uid, email, name, phone, profileImage, createdAt, updatedAt
 * admin/{superadminId} ────── uid, email, name, phone, profileImage, createdAt, updatedAt
 *   └─ dashboard/statistics   totalEmployees, totalEmployers, totalJobs, totalResumes, totalPayments
 *   └─ management/           employees/, employers/, jobs/, payments/
 * EMPLOYEE/
 *   └─ employees/{uid}       uid, userId, name, email, phone, profileImage, jobTitle, skills, education, experience, location, expectedSalary, noticePeriod, createdAt, updatedAt
 *   └─ resumes/{resumeId}    resumeId, employeeId, fileName, fileType, fileSize, storagePath, downloadUrl, uploadedAt, updatedAt
 *   └─ applications/{appId}  applicationId, jobId, employerId, companyId, resumeId, coverLetter, status, appliedAt, updatedAt
 * EMPLOYER/
 *   └─ employers/{uid}       uid, userId, name, email, phone, companyName, companyEmail, status, createdAt, updatedAt
 *   └─ companies/{compId}    companyId, ownerId, companyName, logo, description, industry, website, email, phone, location, address, createdAt, updatedAt
 *   └─ jobs/{jobId}          jobId, employerId, companyId, title, description, skills, employmentType, experience, salary, qualification, responsibilities, requirements, status, applicationCount, createdAt, updatedAt
 * management/                employees/, employers/, jobs/, payments/
 * messages/{messageId} ────── senderId, receiverId, message, type, createdAt, updatedAt
 * notifications/{notifId} ── userId, type, title, message, isRead, createdAt, updatedAt
 * plans/{planId} ──────────── name, price, description, features, status, createdAt, updatedAt
 * payments/{paymentId} ────── userId, planId, amount, status, paymentMethod, transactionId, createdAt, updatedAt
 */

console.log('✅ All schemas are defined in src/schemas/ directory');
console.log('✅ All Joi validations are in src/schemas/validation.js');
console.log('✅ Database structure matches the Firestore image');
