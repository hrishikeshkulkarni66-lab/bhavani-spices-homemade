# Bhavani Homemade Spices — Security Architecture Specification

## 1. Authentication & Password Security
* **Password Hashing:** All user passwords are encrypted using `bcryptjs` with 10 salt rounds before storage. Plaintext passwords are never stored or logged.
* **Token Management:** Authenticated sessions issue JSON Web Tokens (JWT) signed with a 256-bit secret key, expiring after 7 days.
* **Rate Limiting:** Stricter rate limits (`authLimiter`: 20 requests / 15 minutes) are applied to `/api/v1/auth/login` and `/api/v1/auth/register` to mitigate brute-force and credential-stuffing attacks.

---

## 2. Server-Side Role Authorization
* All administrative API endpoints (`/api/v1/admin/*`) are protected by `requireAdmin` middleware.
* `requireAdmin` decodes the JWT token and verifies `req.user.role === 'ADMIN'` or master admin email on the server side before granting access.
* Client-side UI flags or localStorage overrides cannot bypass server-side role validation.

---

## 3. Input Validation & Defense in Depth
* **Schema Validation:** External request bodies, parameters, and query strings are validated using `zod` schemas.
* **SQL Injection:** Database queries use parameterized queries and Supabase builder tools.
* **XSS & CORS:** API responses utilize `helmet` security headers and restricted CORS origins.
* **Raw Payment Credentials:** Credit card inputs are never collected or stored in database or `localStorage`. Payment session tokens are processed via secure gateway webhooks with HMAC SHA256 signature checks.
