/**
 * Validate profile update payload.
 * Returns an error message string if validation fails, or null if valid.
 */
export const validateProfileUpdate = (data) => {
    if (!data || typeof data !== 'object') {
        return 'Request body must be a valid object';
    }

    // At least one field should be provided
    const allowedFields = [
        'fullName', 'email', 'jobTitle', 'experience',
        'currentLocation', 'preferredLocation', 'qualification',
        'expectedSalary', 'noticePeriod', 'gender', 'skills',
        'profileImage', 'phone'
    ];

    const providedFields = Object.keys(data).filter(key => allowedFields.includes(key));
    if (providedFields.length === 0) {
        return 'At least one profile field must be provided for update';
    }

    // Validate fullName if provided
    if (data.fullName !== undefined) {
        if (typeof data.fullName !== 'string' || data.fullName.trim().length < 2) {
            return 'Full name must be at least 2 characters long';
        }
        if (data.fullName.trim().length > 100) {
            return 'Full name must not exceed 100 characters';
        }
    }

    // Validate email if provided
    if (data.email !== undefined) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (typeof data.email !== 'string' || !emailRegex.test(data.email)) {
            return 'Please provide a valid email address';
        }
    }

    // Validate jobTitle if provided
    if (data.jobTitle !== undefined) {
        if (typeof data.jobTitle !== 'string' || data.jobTitle.trim().length > 100) {
            return 'Job title must not exceed 100 characters';
        }
    }

    // Validate experience if provided
    if (data.experience !== undefined) {
        if (typeof data.experience !== 'string') {
            return 'Experience must be a string value';
        }
    }

    // Validate gender if provided
    if (data.gender !== undefined) {
        const validGenders = ['Male', 'Female', 'Other', ''];
        if (!validGenders.includes(data.gender)) {
            return 'Gender must be Male, Female, or Other';
        }
    }

    // Validate skills if provided
    if (data.skills !== undefined) {
        if (typeof data.skills !== 'string' && !Array.isArray(data.skills)) {
            return 'Skills must be a string or an array';
        }
    }

    // Validate expectedSalary if provided
    if (data.expectedSalary !== undefined) {
        if (typeof data.expectedSalary !== 'string' && typeof data.expectedSalary !== 'number') {
            return 'Expected salary must be a string or number';
        }
    }

    // Validate noticePeriod if provided
    if (data.noticePeriod !== undefined) {
        if (typeof data.noticePeriod !== 'string') {
            return 'Notice period must be a string';
        }
    }

    // Validate phone if provided
    if (data.phone !== undefined) {
        if (typeof data.phone !== 'string') {
            return 'Phone number must be a string';
        }
    }

    return null; // All validations passed
};
