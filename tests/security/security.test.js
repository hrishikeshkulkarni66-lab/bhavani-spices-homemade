const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../server/server');
const config = require('../../server/config/env');

describe('Security & Server-Side Authorization Boundary Tests', () => {
    // Generate normal customer token
    const customerToken = jwt.sign(
        { id: 'cust_123', email: 'regularcustomer@gmail.com', name: 'Regular Customer', role: 'CUSTOMER' },
        config.jwtSecret,
        { expiresIn: '1h' }
    );

    test('Customer CANNOT access admin products endpoint (returns 403 Forbidden)', async () => {
        const res = await request(app)
            .post('/api/v1/admin/products')
            .set('Authorization', `Bearer ${customerToken}`)
            .send({
                name: 'Hacked Product',
                price: 1.00,
                description: 'Attempted hack'
            });

        expect(res.statusCode).toBe(403);
        expect(res.body.success).toBe(false);
        expect(res.body.error.code).toBe('FORBIDDEN');
    });

    test('Customer CANNOT modify product price on admin endpoint (returns 403 Forbidden)', async () => {
        const res = await request(app)
            .patch('/api/v1/admin/products/garam-masala')
            .set('Authorization', `Bearer ${customerToken}`)
            .send({ price: 1.00 });

        expect(res.statusCode).toBe(403);
        expect(res.body.success).toBe(false);
        expect(res.body.error.code).toBe('FORBIDDEN');
    });

    test('Customer CANNOT access admin audit logs (returns 403 Forbidden)', async () => {
        const res = await request(app)
            .get('/api/v1/admin/audit-logs')
            .set('Authorization', `Bearer ${customerToken}`);

        expect(res.statusCode).toBe(403);
        expect(res.body.success).toBe(false);
        expect(res.body.error.code).toBe('FORBIDDEN');
    });

    test('Customer CANNOT access another user orders via query email tampering', async () => {
        const res = await request(app)
            .get('/api/v1/orders?email=victim@example.com')
            .set('Authorization', `Bearer ${customerToken}`);

        expect(res.statusCode).toBe(403);
        expect(res.body.success).toBe(false);
        expect(res.body.error.code).toBe('FORBIDDEN');
    });
});
