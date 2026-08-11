const express = require('express');
const { requireAdmin } = require('../../middleware/auth');
const { getAuditLogs } = require('./audit.service');

const router = express.Router();

router.get('/admin/audit-logs', requireAdmin, async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit || '50', 10);
        const logs = await getAuditLogs(limit);

        res.json({
            success: true,
            data: logs
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
