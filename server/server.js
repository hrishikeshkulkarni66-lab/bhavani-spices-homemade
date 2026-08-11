const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const config = require('./config/env');
const { requestLogger, logger } = require('./middleware/logger');
const { errorHandler } = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

// Routes
const authRoutes = require('./modules/auth/auth.routes');
const { router: productRoutes } = require('./modules/products/products.routes');
const orderRoutes = require('./modules/orders/orders.routes');
const paymentRoutes = require('./modules/payments/payments.routes');
const auditRoutes = require('./modules/audit/audit.routes');
const healthRoutes = require('./modules/health/health.routes');

const cartRoutes = require('./modules/cart/cart.routes');

const app = express();

// Security & Parsing Middleware
app.use(helmet({
    contentSecurityPolicy: false // Allow static asset loading inline
}));
app.use(cors({
    origin: config.corsOrigin,
    credentials: true
}));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Logging & Rate Limiting
app.use(requestLogger);
app.use('/api/', apiLimiter);

// Health Checks
app.use('/', healthRoutes);

// API v1 Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1', productRoutes);
app.use('/api/v1', orderRoutes);
app.use('/api/v1', paymentRoutes);
app.use('/api/v1', auditRoutes);
app.use('/api/v1', cartRoutes);

// Static Asset & Storefront Frontend Serving
app.use(express.static(path.join(__dirname, '../')));

// SPA Fallback Route
app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api/') || req.originalUrl.startsWith('/health') || req.originalUrl.startsWith('/ready')) {
        return next();
    }
    res.sendFile(path.join(__dirname, '../index.html'));
});

// Central Error Handler
app.use(errorHandler);

// Start Server if executed directly
if (require.main === module) {
    app.listen(config.port, () => {
        logger.info(`🚀 Bhavani Homemade Spices Production API running on http://localhost:${config.port}`);
    });
}

module.exports = app;
