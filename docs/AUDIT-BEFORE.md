# Bhavani Homemade Spices — Pre-Engineering Repository Audit Report

**Date:** 2026-08-11  
**Auditor:** Lead Software & Security Architect  
**Repository State:** Initial Assessment (Legacy Monolithic Static Frontend + Supabase Direct SDK)

---

## 1. Current Architecture
The current system operates as a single-page application (SPA) consisting of static HTML, CSS, and client-side JavaScript (`app.js`), served directly via `serve` or static hosting (Surge subdomain `bhavani-spices-homemade.surge.sh`). There is **no intermediate backend API application**. Instead, the frontend directly interfaces with a cloud Supabase PostgreSQL database using the public `supabase-js` CDN SDK.

```
[ Browser (Vanilla JS) ] ──(Supabase Public Anon Key)──> [ Supabase REST / PostgREST API ]
```

---

## 2. Current Folder Structure
```
c:\Users\ADC\OneDrive\Desktop\antigravity\
├── .git/
├── .gitignore
├── CNAME                              # Points to surge subdomain
├── index.html                         # Single entry HTML (813 lines)
├── style.css                          # Combined stylesheet (70KB)
├── app.js                             # Monolithic application script (2,396 lines)
├── supabase-config.js                 # Supabase credentials (URL + Anon Key)
├── supabase-helpers.js                # Direct client-side DB CRUD calls
├── package.json                       # Minimal npm config (masala-craft v1.0.0)
├── package-lock.json
├── assets/                            # Product & hero JPG images
│   ├── garam_masala.jpg
│   ├── green_cardamom.jpg
│   ├── hero_spices.jpg
│   ├── kashmiri_chili.jpg
│   └── turmeric_powder.jpg
└── components/                        # Legacy unused UI components
    └── ui/
        ├── badge.tsx
        ├── carousel-07.tsx
        ├── demo.tsx
        └── modern-stunning-sign-in.tsx
```

---

## 3. Technologies Detected
* **Frontend:** HTML5, Vanilla JavaScript (ES6+), Vanilla CSS3 (Custom Properties & Animations), Google Fonts (Inter, Playfair Display).
* **Database / Backend-as-a-Service:** Supabase (PostgreSQL + PostgREST).
* **Dependencies:** `class-variance-authority` (^0.7.1), `motion` (^13.0.0), `@supabase/supabase-js` (via CDN).
* **Development Server:** `serve` via `npx`.
* **Hosting:** Surge (`bhavani-spices-homemade.surge.sh`).

---

## 4. Database Detected
* **Engine:** Supabase PostgreSQL instance (`https://akumpcejcbtdmjwrbfzj.supabase.co`).
* **Tables Referenced:**
  * `profiles` (`id`, `name`, `email`, `password`, `created_at`)
  * `products` (`id`, `name`, `category`, `price`, `stock_status`, `badge`, `rating`, `reviews_count`, `image`, `description`, `updated_at`)
  * `orders` (`id`, `order_id`, `user_email`, `customer_name`, `customer_address`, `customer_city`, `customer_postal`, `items`, `total`, `status`, `created_at`)

---

## 5. Authentication Implementation
* **Mechanism:** Hand-rolled custom authentication querying `profiles` table directly from client JS.
* **Flaw:** User passwords are stored as **raw plain text** (`insert([{ name, email, password }])`).
* **Session Management:** Stores `bhavani_user_logged_in` ('true' | 'guest') and `bhavani_user_email` directly in browser `localStorage`.
* **Security:** Zero password hashing (no bcrypt/argon2), zero server-side JWT session validation, no authentication middleware.

---

## 6. Payment Implementation
* **Mechanism:** Front-end form collecting 16-digit credit card number (`payment-card` input).
* **Processing:** Simulated client-side delay (`setTimeout` 2.2s).
* **Storage:** Card number saved in unencrypted `localStorage` (`bhavani_payment_${userEmail}`).
* **Flaw:** High security risk collecting raw credit card details on frontend without PCI-DSS compliance or genuine payment gateway (e.g. Razorpay/Stripe/UPI SDK).

---

## 7. Admin Implementation
* **Mechanism:** Client-side check matching `localStorage.getItem('bhavani_user_email') === 'hrishikeshkulkarni66@gmail.com'`.
* **Flaw:** Any user can open Browser DevTools and set `localStorage.setItem('bhavani_user_email', 'hrishikeshkulkarni66@gmail.com')` to gain full admin privileges and mutate products, stock, prices, or orders directly in Supabase.

---

## 8. Logging Implementation
* **Mechanism:** Unstructured `console.log` and `console.error` calls scattered across `supabase-config.js`, `supabase-helpers.js`, and `app.js`.
* **Flaw:** No central server log aggregator, no correlation IDs, no log levels, potential sensitive data leaks in dev console.

---

## 9. Detailed Security Findings

### [CRITICAL] SEC-01: Plaintext Password Storage & Querying
* **Description:** User registration (`signUp`) inserts unhashed passwords into `profiles`. Sign in queries `profiles` via `.eq('password', password)`.
* **Impact:** Immediate account compromise for all registered users if database or network traffic is inspected.

### [CRITICAL] SEC-02: Client-Side Admin Authorization Bypass
* **Description:** Admin panel access and database mutation methods (`updateProductPrice`, `updateStockStatus`, `deleteProduct`, `updateOrderStatus`) rely entirely on client-side JS evaluation of `ADMIN_EMAIL`.
* **Impact:** Complete unauthorized database takeover. Any customer can alter prices to ₹1, delete products, or manipulate order statuses.

### [CRITICAL] SEC-03: Direct Supabase Access via Exposed Public Anon Key without Row Level Security (RLS)
* **Description:** `SUPABASE_ANON_KEY` in `supabase-config.js` allows direct table access. Without strict RLS policies on Supabase, any API client can dump all customer profile emails, plaintext passwords, and order details.
* **Impact:** Mass customer PII leak and unauthorized data modification.

### [HIGH] SEC-04: Raw Credit Card Collection & Insecure LocalStorage Retention
* **Description:** The checkout form requests full 16-digit credit card numbers and saves card details to browser `localStorage`.
* **Impact:** Violation of PCI-DSS compliance; risk of local script access or XSS stealing payment credentials.

### [HIGH] SEC-05: Unverified Client-Side Payment & Pricing
* **Description:** Total price calculation is trusted from `state.cart` on the client. Order creation occurs on frontend without server-side verification of real product prices or inventory levels.
* **Impact:** Fraudulent orders placed with tampered unit prices.

### [MEDIUM] SEC-06: Lack of Rate Limiting on Authentication & Sensitive Endpoints
* **Description:** Sign in, sign up, and chatbot endpoints have no rate limiting or brute-force mitigation.
* **Impact:** Susceptible to credential stuffing and automated abuse.

---

## 10. Performance Findings
* **Bundle / File Organization:** Monolithic 98KB JS (`app.js`) and 70KB CSS (`style.css`).
* **Asset Loading:** High-resolution unoptimized JPG images in `assets/` (up to 780KB each).
* **Caching:** No service worker or cache control headers specified for static assets.

---

## 11. SEO Findings
* **Structure:** Meta titles and meta descriptions exist on `index.html`.
* **Gaps:** Lacks dynamic OpenGraph meta tags for individual products, missing `sitemap.xml`, `robots.txt`, and JSON-LD structured data (Product, Organization, BreadcrumbList schemas). Clean URLs (`/products/garam-masala`) are not present due to hash navigation (`#shop`).

---

## 12. Accessibility Findings
* **Buttons & Inputs:** Most form controls have basic labels; keyboard focus states exist but need improvement.
* **Modals & Drawers:** Lack ARIA focus traps (`aria-modal`, trap focus management) when open.
* **Contrast:** Dark saffron theme contrast is generally good, but some muted muted texts require higher contrast ratios.

---

## 13. Testing Status
* **Unit Tests:** None present (0% coverage).
* **Integration Tests:** None present.
* **E2E Tests:** None present.
* **Build Validation:** Minimal (`npx serve .` only).

---

## 14. Deployment Status
* Hosted on Surge (`bhavani-spices-homemade.surge.sh`).
* Static deployment only. Lacks production backend server, environment secret management (`.env`), CI/CD pipeline, monitoring, or health checks.

---

## 15. Summary of Critical Problems
1. Plaintext user password storage.
2. Missing backend API architecture (client-to-DB anti-pattern).
3. Client-side authorization vulnerability for Admin operations.
4. Fake payment processing with unsafe raw credit card inputs.
5. Lack of server-side inventory locking and order price validation.
6. Lack of automated tests and CI/CD pipelines.

---

## 16. Recommended Target Architecture
Implement a robust **Node.js / Express TypeScript or ESM Backend Server** paired with a modular **Storefront & Admin Frontend** clean architecture:

```
project/
├── server/                    # Node.js Express REST API
│   ├── src/
│   │   ├── config/            # DB & env configuration
│   │   ├── middleware/        # Auth, Rate Limiter, Error Handler, Audit Logger
│   │   ├── modules/           # auth, users, products, orders, inventory, payments, admin, audit
│   │   └── server.ts
├── client/                    # Refactored Frontend Modular Architecture
│   ├── src/
│   │   ├── components/
│   │   ├── features/
│   │   ├── services/
│   │   └── utils/
├── database/                  # SQL Migrations & Seed data
│   ├── migrations/
│   └── seeds/
├── tests/                     # Automated Unit, Integration & E2E Tests
└── docs/                      # Technical Documentation & Audits
```

---

## 17. Migration Risks & Mitigation
* **Data Migration Risk:** Existing unhashed user passwords in Supabase cannot be decrypted.
  * *Mitigation:* Clear legacy test users and provide secure registration with password hashing (bcrypt) and proper JWT session management.
* **UI Preservation:** Over-factoring might break existing CSS animations and brand design.
  * *Mitigation:* Retain all visual styles, colors, typography, logos, animations, and branding elements while modularizing JS logic.
