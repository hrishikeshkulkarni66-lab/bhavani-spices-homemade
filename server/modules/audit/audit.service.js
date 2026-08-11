const { supabase } = require('../../config/db');
const { logger } = require('../../middleware/logger');

async function logAudit({ actor, action, entity, entityId, oldValue = null, newValue = null, requestId = null, ip = null }) {
    const actorEmail = actor ? (actor.email || 'system') : 'system';
    const actorId = actor ? (actor.id || null) : null;

    const logEntry = {
        actor_email: actorEmail,
        action,
        entity,
        entity_id: String(entityId),
        old_value: oldValue,
        new_value: newValue,
        request_id: requestId,
        ip_address: ip,
        created_at: new Date().toISOString()
    };

    logger.info({ audit: logEntry }, `[AUDIT LOG] ${actorEmail} performed ${action} on ${entity}:${entityId}`);

    try {
        await supabase
            .from('audit_logs')
            .insert([logEntry]);
    } catch (err) {
        logger.warn({ error: err.message }, 'Failed to persist audit log to Supabase');
    }
}

async function getAuditLogs(limit = 50) {
    try {
        const { data, error } = await supabase
            .from('audit_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data || [];
    } catch (err) {
        logger.warn({ error: err.message }, 'Error fetching audit logs');
        return [];
    }
}

module.exports = {
    logAudit,
    getAuditLogs
};
