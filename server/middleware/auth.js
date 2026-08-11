const jwt = require('jsonwebtoken');
const config = require('../config/env');
const { AppError } = require('./errorHandler');

function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    let token = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
    } else if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }

    if (!token) {
        return next(new AppError('Authentication required. Please sign in.', 401, 'UNAUTHORIZED'));
    }

    try {
        const decoded = jwt.verify(token, config.jwtSecret);
        req.user = decoded;
        next();
    } catch (err) {
        return next(new AppError('Invalid or expired authentication token.', 401, 'UNAUTHORIZED'));
    }
}

function optionalAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    let token = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
    } else if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }

    if (token) {
        try {
            const decoded = jwt.verify(token, config.jwtSecret);
            req.user = decoded;
        } catch (err) {
            // Ignore invalid tokens for optional auth
        }
    }
    next();
}

function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.user) {
            return next(new AppError('Authentication required.', 401, 'UNAUTHORIZED'));
        }

        const userRole = (req.user.role || 'CUSTOMER').toUpperCase();
        const userEmail = (req.user.email || '').toLowerCase();

        const isMasterAdmin = userEmail === config.adminEmail;
        const hasRole = roles.map(r => r.toUpperCase()).includes(userRole);

        if (!hasRole && !isMasterAdmin) {
            return next(new AppError(`Access Denied: Requires one of [${roles.join(', ')}] role.`, 403, 'FORBIDDEN'));
        }

        next();
    };
}

const requireAdmin = [authenticate, requireRole('ADMIN', 'SUPER_ADMIN')];

module.exports = {
    authenticate,
    optionalAuth,
    requireRole,
    requireAdmin
};
