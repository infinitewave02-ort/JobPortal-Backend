export const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(403).json({ error: 'Access denied: No role assigned to user' });
        }
        
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: `Access denied: Endpoint requires one of roles [${roles.join(', ')}]` });
        }
        
        if (req.user.status === 'blocked') {
            return res.status(403).json({ error: 'Access denied: Account has been blocked' });
        }

        next();
    };
};
