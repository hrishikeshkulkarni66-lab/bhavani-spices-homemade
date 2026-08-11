const express = require('express');
const { supabase } = require('../../config/db');

const router = express.Router();

router.get('/health', (req, res) => {
    res.status(200).json({
        status: 'UP',
        timestamp: new Date().toISOString(),
        service: 'bhavani-spices-api',
        version: '1.0.0'
    });
});

router.get('/ready', async (req, res) => {
    try {
        // Quick DB sanity check
        const { data, error } = await supabase.from('products').select('id').limit(1);

        if (error) {
            return res.status(503).json({
                status: 'NOT_READY',
                database: 'DISCONNECTED',
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }

        res.status(200).json({
            status: 'READY',
            database: 'CONNECTED',
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        res.status(503).json({
            status: 'NOT_READY',
            database: 'ERROR',
            error: err.message,
            timestamp: new Date().toISOString()
        });
    }
});

module.exports = router;
