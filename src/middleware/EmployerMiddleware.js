export const isEmployer = (req, res, next) => {
    if (!req.user || req.user.role !== 'employer') {
        return res.status(403).json({ error: 'Access denied: Employer privileges required.' });
    }
    if (req.user.status === 'blocked') {
        return res.status(403).json({ error: 'Access denied: Your account has been blocked.' });
    }
    if (req.user.status === 'pending') {
        return res.status(403).json({ error: 'Access denied: Your employer account is pending approval from Admin.' });
    }
    next();
};
