# Bhavani Homemade Spices — System Architecture Specification

## Overview
Bhavani Homemade Spices is built using a modern, multi-tiered architecture separating client presentation, REST API business logic, authentication/authorization boundaries, and relational database persistence.

```
                  ┌─────────────────────────────────────┐
                  │   Customer & Admin Web Storefront   │
                  │   (HTML5 / ES6 Vanilla JS / CSS)    │
                  └──────────────────┬──────────────────┘
                                     │
                             HTTPS / JSON REST
                                     │
                  ┌──────────────────▼──────────────────┐
                  │      Express.js API Server          │
                  │   - Security (Helmet, CORS, Limiter)│
                  │   - Auth Middleware (JWT & bcrypt)  │
                  │   - Request Correlation Logger      │
                  │   - Centralized Error Sanitizer     │
                  └──────────┬──────────────────┬───────┘
                             │                  │
               ┌─────────────▼────┐        ┌────▼─────────────┐
               │ Business Modules │        │ PostgreSQL DB /  │
               │ - Auth & Profiles│        │ Supabase Storage │
               │ - Products Catalog│       │ - users & roles  │
               │ - Orders Engine  │───────>│ - products & stock│
               │ - Payments & Webhook      │ - orders & items │
               │ - Audit Logger   │        │ - audit_logs     │
               └──────────────────┘        └──────────────────┘
```

---

## Server Module Responsibilities

1. **Auth Module (`server/modules/auth/`)**:
   - Manages user registration, bcrypt password hashing (salt rounds = 10), user login authentication, JWT token issuance, and server-side profile updates.

2. **Products Module (`server/modules/products/`)**:
   - Serves public product catalog listings, category filtering, search, single product details, and admin CRUD endpoints.

3. **Orders Module (`server/modules/orders/`)**:
   - Calculates subtotals and totals from server-side database prices.
   - Enforces out-of-stock validation and reduces inventory atomically.
   - Enforces the order state machine (`PENDING` -> `CONFIRMED` -> `PROCESSING` -> `SHIPPED` -> `DELIVERED`).

4. **Payments Module (`server/modules/payments/`)**:
   - Generates secure payment sessions.
   - Handles payment gateway webhooks with HMAC SHA256 signature verification and idempotency checks (`payment_events`).

5. **Audit Module (`server/modules/audit/`)**:
   - Logs all administrative modifications (stock, price, product, order status changes) with actor details, request IDs, IP addresses, and timestamps.
