const { logger } = require('./logger');

class AppError extends Error {
    constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details = null) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        Error.captureStackTrace(this, this.constructor);
    }
}

function errorHandler(err, req, res, next) {
    const requestId = req.id || 'unknown';
    const statusCode = err.statusCode || 500;
    const code = err.code || 'INTERNAL_ERROR';

    logger.error({
        requestId,
        code,
        statusCode,
        message: err.message,
        details: err.details,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    }, `Error [${code}]: ${err.message}`);

    const clientMessage = statusCode === 500 && process.env.NODE_ENV === 'production' 
        ? 'An internal server error occurred.' 
        : err.message;

    res.status(statusCode).json({
        success: false,
        error: {
            code,
            message: clientMessage,
            requestId,
            ...(err.details ? { details: err.details } : {})
        }
    });
}

module.exports = {
    AppError,
    errorHandler
};
