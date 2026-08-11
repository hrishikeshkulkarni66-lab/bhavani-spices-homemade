const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const config = {
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000', 10),
    jwtSecret: process.env.JWT_SECRET || 'bhavani_spices_master_production_jwt_secret_key_2026',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    adminEmail: (process.env.ADMIN_EMAIL || 'hrishikeshkulkarni66@gmail.com').toLowerCase(),
    supabaseUrl: process.env.SUPABASE_URL || 'https://akumpcejcbtdmjwrbfzj.supabase.co',
    supabaseKey: process.env.SUPABASE_ANON_KEY || 'sb_publishable_L-xrbZB8lZrXXQS04zGsSw_4UGffWGZ',
    supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    corsOrigin: process.env.CORS_ORIGIN || '*'
};

module.exports = config;
