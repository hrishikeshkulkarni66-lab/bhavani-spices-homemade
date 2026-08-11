# Bhavani Homemade Spices — Technical Troubleshooting Guide

## Common Operational Issues & Diagnostics

### 1. `401 UNAUTHORIZED` / `403 FORBIDDEN` Errors on Admin Endpoints
* **Cause:** Missing or expired JWT token, or user account role is not `ADMIN`.
* **Fix:** Ensure user is logged in as `hrishikeshkulkarni66@gmail.com` or has `role === 'ADMIN'`. Verify `Authorization: Bearer <token>` header is sent.

### 2. Database Connection Failures / Timeout
* **Cause:** Supabase API key misconfiguration or network restriction.
* **Diagnostic:** Run `curl http://localhost:3000/ready`. If database status returns `DISCONNECTED`, check `SUPABASE_URL` and `SUPABASE_ANON_KEY` in `.env`.

### 3. Out-of-Stock Order Rejection (`400 OUT_OF_STOCK`)
* **Cause:** Customer cart contains items marked as `out-of-stock` in database.
* **Fix:** Update product stock status in Admin Panel -> Stock Tab or remove out-of-stock items from customer cart.
