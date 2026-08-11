const pino = require('pino');
const crypto = require('crypto');

const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    base: {
        env: process.env.NODE_ENV || 'development',
        service: 'bhavani-spices-api'
    },
    redact: ['password', 'token', 'authorization', 'credit_card', 'card_number', 'cvv']
});

function requestLogger(req, res, next) {
    req.id = req.headers['x-request-id'] || `req_${Date.now()}_${crypto.randomUUID().substr(0, 8)}`;
    res.setHeader('X-Request-ID', req.id);

    const startTime = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - startTime;
        logger.info({
            requestId: req.id,
            method: req.method,
            path: req.originalUrl,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            userId: req.user ? req.user.id : undefined,
            ip: req.ip
        }, `${req.method} ${req.originalUrl} ${res.statusCode} in ${duration}ms`);
    });

    next();
}

module.exports = {
    logger,
    requestLogger
};
