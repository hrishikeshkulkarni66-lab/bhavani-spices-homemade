const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const config = require('../../config/env');
const { supabase } = require('../../config/db');
const { AppError } = require('../../middleware/errorHandler');
const { authenticate } = require('../../middleware/auth');
const { authLimiter } = require('../../middleware/rateLimiter');

const router = express.Router();

// Server-side user & profile repository fallback
const SERVER_USER_STORE = new Map();
const SERVER_PROFILE_STORE = new Map();

// Initialize Master Admin User in server store
(async () => {
    const adminHash = await bcrypt.hash('Bhavani123!', 10);
    SERVER_USER_STORE.set(config.adminEmail, {
        id: 'usr_admin',
        name: 'Bhavani Admin',
        email: config.adminEmail,
        password_hash: adminHash,
        role: 'ADMIN',
        created_at: new Date().toISOString()
    });
})();

// Validation Schemas
const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters')
});

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required')
});

// 1. REGISTER
router.post('/register', authLimiter, async (req, res, next) => {
    try {
        const body = registerSchema.parse(req.body);
        const emailLower = body.email.toLowerCase();

        if (SERVER_USER_STORE.has(emailLower)) {
            throw new AppError('An account with this email address already exists.', 409, 'CONFLICT');
        }

        const passwordHash = await bcrypt.hash(body.password, 10);
        const isMasterAdmin = emailLower === config.adminEmail;
        const role = isMasterAdmin ? 'ADMIN' : 'CUSTOMER';
        const userId = `usr_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

        const newRecord = {
            id: userId,
            name: body.name,
            email: emailLower,
            password_hash: passwordHash,
            role: role,
            created_at: new Date().toISOString()
        };

        SERVER_USER_STORE.set(emailLower, newRecord);

        // Try persisting to Supabase
        try {
            await supabase
                .from('profiles')
                .insert([{
                    name: body.name,
                    email: emailLower,
                    password: passwordHash,
                    role: role,
                    created_at: newRecord.created_at
                }]);
        } catch (err) {
            // DB fallback handled in server memory
        }

        const token = jwt.sign(
            { id: userId, email: emailLower, name: body.name, role: role },
            config.jwtSecret,
            { expiresIn: config.jwtExpiresIn }
        );

        res.status(201).json({
            success: true,
            data: {
                user: {
                    id: userId,
                    name: body.name,
                    email: emailLower,
                    role: role
                },
                token
            }
        });
    } catch (err) {
        if (err instanceof z.ZodError) {
            return next(new AppError('Invalid registration data', 400, 'VALIDATION_ERROR', err.errors));
        }
        next(err);
    }
});

// 2. LOGIN
router.post('/login', authLimiter, async (req, res, next) => {
    try {
        const body = loginSchema.parse(req.body);
        const emailLower = body.email.toLowerCase();

        let userRecord = SERVER_USER_STORE.get(emailLower);

        // Fallback to Supabase check
        if (!userRecord) {
            const { data: dbUser } = await supabase
                .from('profiles')
                .select('*')
                .eq('email', emailLower)
                .maybeSingle();

            if (dbUser) {
                userRecord = {
                    id: dbUser.id || dbUser.email,
                    name: dbUser.name,
                    email: dbUser.email,
                    password_hash: dbUser.password,
                    role: (emailLower === config.adminEmail ? 'ADMIN' : (dbUser.role || 'CUSTOMER'))
                };
                SERVER_USER_STORE.set(emailLower, userRecord);
            }
        }

        if (!userRecord) {
            throw new AppError('Invalid email or password.', 401, 'UNAUTHORIZED');
        }

        // Verify password hash
        let isMatch = false;
        if (userRecord.password_hash.startsWith('$2a$') || userRecord.password_hash.startsWith('$2b$')) {
            isMatch = await bcrypt.compare(body.password, userRecord.password_hash);
        } else {
            isMatch = (userRecord.password_hash === body.password);
            if (isMatch) {
                userRecord.password_hash = await bcrypt.hash(body.password, 10);
            }
        }

        if (!isMatch) {
            throw new AppError('Invalid email or password.', 401, 'UNAUTHORIZED');
        }

        const token = jwt.sign(
            { id: userRecord.id, email: userRecord.email, name: userRecord.name, role: userRecord.role },
            config.jwtSecret,
            { expiresIn: config.jwtExpiresIn }
        );

        res.json({
            success: true,
            data: {
                user: {
                    id: userRecord.id,
                    name: userRecord.name,
                    email: userRecord.email,
                    role: userRecord.role
                },
                token
            }
        });
    } catch (err) {
        if (err instanceof z.ZodError) {
            return next(new AppError('Invalid login credentials', 400, 'VALIDATION_ERROR', err.errors));
        }
        next(err);
    }
});

// 3. ME
router.get('/me', authenticate, async (req, res, next) => {
    try {
        const userEmail = req.user.email.toLowerCase();
        const userRecord = SERVER_USER_STORE.get(userEmail) || req.user;

        res.json({
            success: true,
            data: {
                user: {
                    id: userRecord.id,
                    name: userRecord.name,
                    email: userRecord.email,
                    role: userRecord.role
                }
            }
        });
    } catch (err) {
        next(err);
    }
});

// 4. GET USER PROFILE (SERVER-SIDE USER DETAILS, ADDRESS, PAYMENT PREFERENCES)
router.get('/profile', authenticate, async (req, res, next) => {
    try {
        const userEmail = req.user.email.toLowerCase();
        const profileData = SERVER_PROFILE_STORE.get(userEmail) || {
            address: {},
            payment: {}
        };
        const userRecord = SERVER_USER_STORE.get(userEmail) || req.user;

        res.json({
            success: true,
            data: {
                name: userRecord.name,
                email: userRecord.email,
                role: userRecord.role,
                address: profileData.address,
                payment: profileData.payment
            }
        });
    } catch (err) {
        next(err);
    }
});

// 5. UPDATE USER PROFILE (SAVED SERVER-SIDE)
router.put('/profile', authenticate, async (req, res, next) => {
    try {
        const userEmail = req.user.email.toLowerCase();
        const { name, address, payment } = req.body;

        if (name) {
            const userRecord = SERVER_USER_STORE.get(userEmail);
            if (userRecord) userRecord.name = name;
        }

        const currentProfile = SERVER_PROFILE_STORE.get(userEmail) || { address: {}, payment: {} };
        if (address) currentProfile.address = { ...currentProfile.address, ...address };
        if (payment) currentProfile.payment = { ...currentProfile.payment, ...payment };

        SERVER_PROFILE_STORE.set(userEmail, currentProfile);

        res.json({
            success: true,
            message: 'Server-side profile updated successfully.',
            data: {
                name: name || (req.user ? req.user.name : ''),
                email: userEmail,
                address: currentProfile.address,
                payment: currentProfile.payment
            }
        });
    } catch (err) {
        next(err);
    }
});

// 6. LOGOUT
router.post('/logout', (req, res) => {
    res.json({
        success: true,
        message: 'Logged out successfully.'
    });
});

module.exports = router;
