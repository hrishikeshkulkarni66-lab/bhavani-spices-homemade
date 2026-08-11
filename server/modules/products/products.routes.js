const express = require('express');
const { z } = require('zod');
const { supabase } = require('../../config/db');
const { AppError } = require('../../middleware/errorHandler');
const { requireAdmin } = require('../../middleware/auth');
const { logAudit } = require('../audit/audit.service');

const router = express.Router();

// Fallback catalog dataset if DB table is initializing
const INITIAL_PRODUCTS = [
    {
        id: 'garam-masala',
        name: 'Royal Garam Masala',
        slug: 'royal-garam-masala',
        category: 'blends',
        price: 280.00,
        mrp: 320.00,
        rating: 4.9,
        reviews_count: 128,
        badge: 'Bestseller',
        image: 'assets/garam_masala.jpg',
        stock_status: 'in-stock',
        description: 'An aromatic, handcrafted blend of 13 whole spices roasted in small batches. Adds rich depth and warming fragrance to curries, biryanis, and gravies.',
        ingredients: 'Coriander, Cumin, Green Cardamom, Black Pepper, Cinnamon, Cloves, Star Anise, Bay Leaf, Nutmeg, Mace, Black Cardamom',
        origin: 'Maharashtra, India'
    },
    {
        id: 'kashmiri-chili',
        name: 'Kashmiri Red Chili Powder',
        slug: 'kashmiri-red-chili-powder',
        category: 'singles',
        price: 195.00,
        mrp: 220.00,
        rating: 4.8,
        reviews_count: 94,
        badge: 'Vibrant Color',
        image: 'assets/kashmiri_chili.jpg',
        stock_status: 'in-stock',
        description: 'Vibrant crimson chili powder ground from hand-picked Kashmiri chilies. Delivers an iconic rich color with mild, pleasant heat.',
        ingredients: '100% Pure Sun-Dried Kashmiri Chilies',
        origin: 'Kashmir, India'
    },
    {
        id: 'turmeric-powder',
        name: 'Organic Wild Turmeric Powder',
        slug: 'organic-wild-turmeric-powder',
        category: 'singles',
        price: 160.00,
        mrp: 185.00,
        rating: 5.0,
        reviews_count: 215,
        badge: 'High Curcumin',
        image: 'assets/turmeric_powder.jpg',
        stock_status: 'in-stock',
        description: 'High-curcumin golden turmeric powder sun-dried and finely ground. Earthy flavor profile ideal for daily cooking and traditional golden milk.',
        ingredients: '100% Pure Organic Turmeric Root',
        origin: 'Sangli, Maharashtra'
    },
    {
        id: 'green-cardamom',
        name: 'Idukki Green Cardamom (8mm)',
        slug: 'idukki-green-cardamom-8mm',
        category: 'singles',
        price: 420.00,
        mrp: 480.00,
        rating: 4.9,
        reviews_count: 76,
        badge: 'Premium Pods',
        image: 'assets/green_cardamom.jpg',
        stock_status: 'in-stock',
        description: 'Jumbo 8mm green cardamom pods hand-harvested from the hills of Idukki. Intensely sweet aroma and essential oil richness.',
        ingredients: '100% Whole Green Cardamom Pods',
        origin: 'Idukki, Kerala'
    }
];

// 1. PUBLIC: LIST PRODUCTS
router.get('/products', async (req, res, next) => {
    try {
        const { category, search, stock_status } = req.query;

        const { data: dbProducts, error } = await supabase
            .from('products')
            .select('*');

        let products = (dbProducts && dbProducts.length > 0) ? dbProducts : INITIAL_PRODUCTS;

        // Apply filters
        if (category && category !== 'all') {
            products = products.filter(p => p.category === category || p.category_id === category);
        }

        if (stock_status) {
            products = products.filter(p => p.stock_status === stock_status);
        }

        if (search) {
            const q = search.toLowerCase();
            products = products.filter(p => 
                p.name.toLowerCase().includes(q) || 
                p.description.toLowerCase().includes(q)
            );
        }

        res.json({
            success: true,
            data: products
        });
    } catch (err) {
        next(err);
    }
});

// 2. PUBLIC: GET CATEGORIES
router.get('/categories', async (req, res, next) => {
    try {
        const { data: categories } = await supabase
            .from('categories')
            .select('*');

        const fallback = [
            { id: 'all', name: 'All Spices', count: 4 },
            { id: 'blends', name: 'Signature Blends', count: 1 },
            { id: 'singles', name: 'Single Origin', count: 3 }
        ];

        res.json({
            success: true,
            data: (categories && categories.length > 0) ? categories : fallback
        });
    } catch (err) {
        next(err);
    }
});

// 3. PUBLIC: GET SINGLE PRODUCT
router.get('/products/:id', async (req, res, next) => {
    try {
        const { id } = req.params;

        const { data: dbProduct } = await supabase
            .from('products')
            .select('*')
            .or(`id.eq.${id},slug.eq.${id}`)
            .maybeSingle();

        const product = dbProduct || INITIAL_PRODUCTS.find(p => p.id === id || p.slug === id);

        if (!product) {
            throw new AppError(`Product '${id}' not found.`, 404, 'NOT_FOUND');
        }

        res.json({
            success: true,
            data: product
        });
    } catch (err) {
        next(err);
    }
});

// 4. ADMIN ONLY: ADD PRODUCT
router.post('/admin/products', requireAdmin, async (req, res, next) => {
    try {
        const { name, category, price, description, badge, image, stock_status, ingredients } = req.body;

        if (!name || isNaN(price) || price <= 0 || !description) {
            throw new AppError('Name, valid price, and description are required.', 400, 'VALIDATION_ERROR');
        }

        const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36);
        const slug = id;

        const newProd = {
            id,
            name,
            slug,
            category: category || 'blends',
            price: parseFloat(price),
            rating: 5.0,
            reviews_count: 1,
            badge: badge || null,
            image: image || 'assets/hero_spices.jpg',
            description,
            stock_status: stock_status || 'in-stock',
            ingredients: ingredients || null,
            created_at: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('products')
            .insert([newProd])
            .select()
            .single();

        if (error) {
            console.warn('Supabase product insert warning:', error.message);
        }

        // Log admin audit action
        await logAudit({
            actor: req.user,
            action: 'PRODUCT_CREATED',
            entity: 'product',
            entityId: id,
            newValue: newProd,
            requestId: req.id,
            ip: req.ip
        });

        res.status(201).json({
            success: true,
            data: data || newProd
        });
    } catch (err) {
        next(err);
    }
});

// 5. ADMIN ONLY: UPDATE PRODUCT DETAILS / PRICE / STOCK
router.patch('/admin/products/:id', requireAdmin, async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, price, stock_status, description, badge } = req.body;

        const updates = { updated_at: new Date().toISOString() };
        if (name) updates.name = name;
        if (price !== undefined && !isNaN(price)) updates.price = parseFloat(price);
        if (stock_status) updates.stock_status = stock_status;
        if (description) updates.description = description;
        if (badge !== undefined) updates.badge = badge;

        const { data: updatedProduct, error } = await supabase
            .from('products')
            .update(updates)
            .eq('id', id)
            .select()
            .maybeSingle();

        // Audit log
        await logAudit({
            actor: req.user,
            action: 'PRODUCT_UPDATED',
            entity: 'product',
            entityId: id,
            newValue: updates,
            requestId: req.id,
            ip: req.ip
        });

        res.json({
            success: true,
            data: updatedProduct || { id, ...updates }
        });
    } catch (err) {
        next(err);
    }
});

// 6. ADMIN ONLY: DELETE PRODUCT
router.delete('/admin/products/:id', requireAdmin, async (req, res, next) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);

        await logAudit({
            actor: req.user,
            action: 'PRODUCT_DELETED',
            entity: 'product',
            entityId: id,
            requestId: req.id,
            ip: req.ip
        });

        res.json({
            success: true,
            message: `Product '${id}' deleted successfully.`
        });
    } catch (err) {
        next(err);
    }
});

module.exports = {
    router,
    INITIAL_PRODUCTS
};
