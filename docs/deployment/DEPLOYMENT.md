# Bhavani Homemade Spices — Deployment Guide

## Production Environment Prerequisites
- Node.js v18.0+ / v20.0+
- PostgreSQL v14.0+ (or Supabase Cloud Instance)
- Reverse proxy (Nginx / Cloudflare / Caddy) with SSL certificate

---

## Environment Variables Configuration (`.env`)
```ini
NODE_ENV=production
PORT=3000
JWT_SECRET=your_super_secret_jwt_key_256bit
ADMIN_EMAIL=hrishikeshkulkarni66@gmail.com
SUPABASE_URL=https://akumpcejcbtdmjwrbfzj.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
CORS_ORIGIN=https://bhavani-spices-homemade.surge.sh
```

---

## Deployment Steps

1. **Clone & Install Dependencies:**
   ```bash
   git clone https://github.com/hrishikeshkulkarni66-lab/bhavani-spices-homemade.git
   cd bhavani-spices-homemade
   npm install --production
   ```

2. **Execute Database Migrations:**
   Run `database/migrations/001_initial_schema.sql` against your production PostgreSQL instance.

3. **Start Node.js Service (PM2 / Systemd):**
   ```bash
   npx pm2 start server/server.js --name "bhavani-api"
   ```

4. **Docker Container Deployment:**
   ```bash
   docker build -t bhavani-spices-app .
   docker run -d -p 3000:3000 --env-file .env bhavani-spices-app
   ```
