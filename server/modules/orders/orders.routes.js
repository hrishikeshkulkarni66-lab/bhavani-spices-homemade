const express = require('express');
const { z } = require('zod');
const { supabase } = require('../../config/db');
const { AppError } = require('../../middleware/errorHandler');
const { authenticate, optionalAuth, requireAdmin } = require('../../middleware/auth');
const { orderLimiter } = require('../../middleware/rateLimiter');
const { INITIAL_PRODUCTS } = require('../products/products.routes');
const { logAudit } = require('../audit/audit.service');

const router = express.Router();

const orderItemSchema = z.object({
    id: z.string(),
    quantity: z.number().int().positive('Quantity must be a positive integer')
});

const createOrderSchema = z.object({
    customerName: z.string().min(2, 'Customer name is required'),
    customerEmail: z.string().email('Valid email address is required'),
    customerAddress: z.string().min(5, 'Shipping address is required'),
    customerCity: z.string().min(2, 'City is required'),
    customerPostal: z.string().min(3, 'Postal code is required'),
    paymentMethod: z.string().optional().default('UPI'),
    items: z.array(orderItemSchema).min(1, 'Order must contain at least one item')
});

// Allowed Order State Machine Transitions
const ALLOWED_TRANSITIONS = {
    'PENDING': ['PAYMENT_PENDING', 'PAID', 'CANCELLED'],
    'PAYMENT_PENDING': ['PAID', 'PAYMENT_FAILED', 'CANCELLED'],
    'PAID': ['CONFIRMED', 'CANCELLED', 'REFUNDED'],
    'CONFIRMED': ['PROCESSING', 'CANCELLED'],
    'PROCESSING': ['SHIPPED', 'CANCELLED'],
    'SHIPPED': ['DELIVERED', 'CANCELLED'],
    'DELIVERED': ['REFUNDED'],
    'CANCELLED': [],
    'REFUNDED': []
};

// 1. CREATE ORDER (CUSTOMER / GUEST CHECKOUT)
router.post('/orders', orderLimiter, optionalAuth, async (req, res, next) => {
    try {
        const body = createOrderSchema.parse(req.body);
        const userEmail = req.user ? req.user.email.toLowerCase() : body.customerEmail.toLowerCase();

        // 1. Fetch current live products from Supabase to verify pricing and stock
        const { data: dbProducts } = await supabase.from('products').select('*');
        const allProducts = (dbProducts && dbProducts.length > 0) ? dbProducts : INITIAL_PRODUCTS;

        // 2. Validate items & calculate total server-side
        let calculatedSubtotal = 0;
        const verifiedOrderItems = [];

        for (const item of body.items) {
            const product = allProducts.find(p => p.id === item.id);
            
            if (!product) {
                throw new AppError(`Product '${item.id}' is no longer available in our catalog.`, 400, 'PRODUCT_NOT_FOUND');
            }

            if (product.stock_status === 'out-of-stock') {
                throw new AppError(`Sorry, '${product.name}' is currently out of stock. Please remove it from your cart.`, 400, 'OUT_OF_STOCK');
            }

            const itemTotalPrice = product.price * item.quantity;
            calculatedSubtotal += itemTotalPrice;

            verifiedOrderItems.push({
                product_id: product.id,
                product_name: product.name,
                unit_price: product.price,
                quantity: item.quantity,
                total_price: itemTotalPrice
            });
        }

        const shippingFee = 0.00; // Free shipping
        const calculatedTotal = calculatedSubtotal + shippingFee;

        // Generate Server-Side Order ID
        const orderId = `#MC-${Math.floor(100000 + Math.random() * 900000)}`;

        const orderData = {
            id: orderId,
            order_id: orderId,
            user_id: req.user ? req.user.id : null,
            user_email: userEmail,
            customer_name: body.customerName,
            customer_address: body.customerAddress,
            customer_city: body.customerCity,
            customer_postal: body.customerPostal,
            items: verifiedOrderItems,
            subtotal: calculatedSubtotal,
            shipping_fee: shippingFee,
            total: calculatedTotal,
            status: 'CONFIRMED', // Set to confirmed for instant store order placement
            payment_method: body.paymentMethod || 'UPI',
            payment_status: 'PAID',
            created_at: new Date().toISOString()
        };

        // Insert order to database
        const { data: createdOrder, error } = await supabase
            .from('orders')
            .insert([orderData])
            .select()
            .single();

        if (error) {
            console.warn('Supabase order insert warning:', error.message);
        }

        res.status(201).json({
            success: true,
            data: createdOrder || orderData
        });
    } catch (err) {
        if (err instanceof z.ZodError) {
            return next(new AppError('Invalid order data', 400, 'VALIDATION_ERROR', err.errors));
        }
        next(err);
    }
});

// 2. GET USER ORDERS (ISOLATED TO AUTHENTICATED USER OR EMAIL MATCH)
router.get('/orders', optionalAuth, async (req, res, next) => {
    try {
        const queryEmail = (req.query.email || (req.user ? req.user.email : '')).toLowerCase();

        if (!queryEmail) {
            return res.json({ success: true, data: [] });
        }

        // If authenticated as normal customer, enforce IDOR check
        if (req.user && req.user.role !== 'ADMIN' && req.user.email.toLowerCase() !== queryEmail) {
            throw new AppError('Access Denied: You can only view your own order history.', 403, 'FORBIDDEN');
        }

        const { data: dbOrders, error } = await supabase
            .from('orders')
            .select('*')
            .eq('user_email', queryEmail)
            .order('created_at', { ascending: false });

        res.json({
            success: true,
            data: dbOrders || []
        });
    } catch (err) {
        next(err);
    }
});

// 3. GET SINGLE ORDER DETAILS BY ID (ISOLATED TO OWNER OR ADMIN)
router.get('/orders/:id', optionalAuth, async (req, res, next) => {
    try {
        const { id } = req.params;

        const { data: order, error } = await supabase
            .from('orders')
            .select('*')
            .or(`id.eq.${id},order_id.eq.${id}`)
            .maybeSingle();

        if (!order) {
            throw new AppError(`Order '${id}' not found.`, 404, 'NOT_FOUND');
        }

        // IDOR Check: Ensure requester owns order or is Admin
        const requesterEmail = req.user ? req.user.email.toLowerCase() : (req.query.email || '').toLowerCase();
        const isAdmin = req.user && (req.user.role === 'ADMIN' || req.user.email === require('../../config/env').adminEmail);

        if (!isAdmin && order.user_email.toLowerCase() !== requesterEmail) {
            throw new AppError('Access Denied: Unauthorized to view this order.', 403, 'FORBIDDEN');
        }

        res.json({
            success: true,
            data: order
        });
    } catch (err) {
        next(err);
    }
});

// 4. ADMIN ONLY: LIST ALL STORE ORDERS
router.get('/admin/orders', requireAdmin, async (req, res, next) => {
    try {
        const { data: dbOrders, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        res.json({
            success: true,
            data: dbOrders || []
        });
    } catch (err) {
        next(err);
    }
});

// 5. ADMIN ONLY: UPDATE ORDER STATUS (ENFORCING STATE MACHINE & AUDIT)
router.patch('/admin/orders/:id/status', requireAdmin, async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            throw new AppError('Target order status is required.', 400, 'VALIDATION_ERROR');
        }

        const uppercaseStatus = status.toUpperCase();

        // Fetch current order status
        const { data: currentOrder } = await supabase
            .from('orders')
            .select('*')
            .or(`id.eq.${id},order_id.eq.${id}`)
            .maybeSingle();

        if (!currentOrder) {
            throw new AppError(`Order '${id}' not found.`, 404, 'NOT_FOUND');
        }

        const currentStatus = (currentOrder.status || 'PENDING').toUpperCase();
        const allowedNext = ALLOWED_TRANSITIONS[currentStatus] || [];

        // Validate state transition
        if (!allowedNext.includes(uppercaseStatus) && currentStatus !== uppercaseStatus) {
            throw new AppError(`Invalid order state transition from '${currentStatus}' to '${uppercaseStatus}'.`, 400, 'INVALID_TRANSITION');
        }

        const { data: updatedOrder, error } = await supabase
            .from('orders')
            .update({
                status: uppercaseStatus,
                updated_at: new Date().toISOString()
            })
            .or(`id.eq.${id},order_id.eq.${id}`)
            .select()
            .maybeSingle();

        // Audit log
        await logAudit({
            actor: req.user,
            action: 'ORDER_STATUS_UPDATED',
            entity: 'order',
            entityId: id,
            oldValue: { status: currentStatus },
            newValue: { status: uppercaseStatus },
            requestId: req.id,
            ip: req.ip
        });

        res.json({
            success: true,
            data: updatedOrder || { ...currentOrder, status: uppercaseStatus }
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
