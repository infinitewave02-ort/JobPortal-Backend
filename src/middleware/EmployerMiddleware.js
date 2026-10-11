export const isEmployer = (req, res, next) => {
    if (!req.user || req.user.role !== 'employer') {
        return res.status(403).json({ error: 'Access denied: Employer privileges required.' });
    }
    if (req.user.status === 'blocked') {
        return res.status(403).json({ error: 'Access denied: Your account has been blocked.' });
    }
    // Allow active and pending employers
    next();
};

export const isEmployerApproved = (req, res, next) => {
    if (!req.user || req.user.role !== 'employer') {
        return res.status(403).json({ error: 'Access denied: Employer privileges required.' });
    }
    if (req.user.status === 'blocked') {
        return res.status(403).json({ error: 'Access denied: Your account has been blocked.' });
    }
    if (req.user.status === 'rejected') {
        return res.status(403).json({ error: 'Access denied: Your employer account has been rejected.' });
    }
    next();
};
