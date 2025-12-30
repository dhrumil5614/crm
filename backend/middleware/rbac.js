const User = require('../models/User');

/**
 * Middleware to check if user has specific permission
 * Usage: router.get('/', protect, checkPermission('LEAD_READ_ALL'), controller)
 */
const checkPermission = (requiredPermission) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({ success: false, message: 'Not authorized' });
            }

            // Admins always have access (Fail-safe, though permissions usually handle this)
            if (req.user.role === 'admin') {
                return next();
            }

            // Check if user has the permission
            if (req.user.permissions && req.user.permissions.includes(requiredPermission)) {
                return next();
            }

            return res.status(403).json({
                success: false,
                message: `Forbidden: Requires ${requiredPermission} permission`
            });

        } catch (error) {
            console.error('RBAC Error:', error);
            res.status(500).json({ success: false, message: 'Server error authorizing request' });
        }
    };
};

module.exports = { checkPermission };
