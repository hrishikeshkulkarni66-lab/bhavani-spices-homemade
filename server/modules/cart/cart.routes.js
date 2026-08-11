const express = require('express');
const { optionalAuth } = require('../../middleware/auth');
const { supabase } = require('../../config/db');

const router = express.Router();

// In-memory server cart fallback store per user email/session
const SERVER_CARTS = new Map();

// GET USER CART FROM SERVER
router.get('/cart', optionalAuth, async (req, res, next) => {
    try {
        const userEmail = req.user ? req.user.email.toLowerCase() : (req.query.sessionId || 'guest');
        
        let cartItems = [];
        if (SERVER_CARTS.has(userEmail)) {
            cartItems = SERVER_CARTS.get(userEmail);
        } else {
            const { data } = await supabase
                .from('carts')
                .select('*')
                .eq('user_email', userEmail)
                .maybeSingle();
            if (data && data.items) cartItems = data.items;
        }

        res.json({
            success: true,
            data: cartItems
        });
    } catch (err) {
        next(err);
    }
});

// SAVE USER CART TO SERVER
router.post('/cart', optionalAuth, async (req, res, next) => {
    try {
        const userEmail = req.user ? req.user.email.toLowerCase() : (req.body.sessionId || 'guest');
        const items = req.body.items || [];

        SERVER_CARTS.set(userEmail, items);

        try {
            await supabase
                .from('carts')
                .upsert([{ user_email: userEmail, items, updated_at: new Date().toISOString() }]);
        } catch (err) {
            // DB fallback handled in memory
        }

        res.json({
            success: true,
            data: items
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
