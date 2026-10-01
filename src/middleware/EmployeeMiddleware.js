export const isEmployee = (req, res, next) => {
    if (!req.user || req.user.role !== 'employee') {
        return res.status(403).json({ error: 'Access denied: Employee privileges required.' });
    }
    if (req.user.status === 'blocked') {
        return res.status(403).json({ error: 'Access denied: Your account has been blocked.' });
    }
    next();
};
