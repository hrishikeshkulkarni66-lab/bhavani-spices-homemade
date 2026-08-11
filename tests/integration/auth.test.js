const request = require('supertest');
const app = require('../../server/server');

describe('Authentication & JWT API Endpoints', () => {
    const testUser = {
        name: 'Test Customer',
        email: `testcustomer_${Date.now()}@example.com`,
        password: 'Password123!'
    };

    let authToken = '';

    test('POST /api/v1/auth/register registers new user with bcrypt password hash', async () => {
        const res = await request(app)
            .post('/api/v1/auth/register')
            .send(testUser);

        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.user.email).toBe(testUser.email.toLowerCase());
        expect(res.body.data.token).toBeDefined();
        authToken = res.body.data.token;
    });

    test('POST /api/v1/auth/login authenticates user and returns JWT token', async () => {
        const res = await request(app)
            .post('/api/v1/auth/login')
            .send({
                email: testUser.email,
                password: testUser.password
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.token).toBeDefined();
    });

    test('GET /api/v1/auth/me returns authenticated profile data', async () => {
        const res = await request(app)
            .get('/api/v1/auth/me')
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.user.email).toBe(testUser.email.toLowerCase());
    });

    test('GET /api/v1/auth/me rejects unauthenticated request with 401', async () => {
        const res = await request(app)
            .get('/api/v1/auth/me');

        expect(res.statusCode).toBe(401);
        expect(res.body.success).toBe(false);
        expect(res.body.error.code).toBe('UNAUTHORIZED');
    });
});
