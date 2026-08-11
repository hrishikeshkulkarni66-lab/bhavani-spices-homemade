# Bhavani Homemade Spices — Production E-Commerce Platform

Bhavani Homemade Spices is a full-stack e-commerce web application featuring an artisanal storefront, Node.js/Express REST API server, JWT authentication with bcrypt password hashing, server-side role-based access control, server-calculated checkout totals, atomic inventory controls, payment gateway integration architecture, and administrative audit logging.

---

## 🛠️ Architecture & Core Features
- **Frontend Storefront:** HTML5, Modular JavaScript, Glassmorphism CSS, SEO Schema, Responsive UX.
- **Backend API:** Node.js, Express.js REST API (`/api/v1/`), Pino logger with request IDs, Helmet, Rate Limiter.
- **Authentication & Security:** `bcrypt` password hashing, JWT bearer tokens, server-side role authorization (`ADMIN` vs `CUSTOMER`).
- **Database & Auditing:** Relational PostgreSQL schema with migrations, relational inventory, and `audit_logs` tracking all admin actions.
- **Automated Testing:** 100% passing Jest test suite covering unit pricing, auth integration, and security authorization boundaries.

---

## 🚀 Quick Start Instructions

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Run Automated Test Suite:**
   ```bash
   npm test
   ```

3. **Start Development API & Storefront Server:**
   ```bash
   npm start
   ```
   Open `http://localhost:3000` in your browser.

---

## 📚 Technical Documentation
- [Post-Engineering Audit Report](docs/AUDIT-AFTER.md)
- [Production Readiness Report](docs/PRODUCTION-READINESS.md)
- [System Architecture](docs/architecture/ARCHITECTURE.md)
- [Data Flow Diagram](docs/architecture/DATA-FLOW.md)
- [Security Architecture](docs/security/SECURITY.md)
- [REST API Specification](docs/api/API.md)
- [Database Schema](docs/database/DATABASE.md)
- [Deployment Guide](docs/deployment/DEPLOYMENT.md)
- [Backup & Recovery](docs/deployment/BACKUP-AND-RECOVERY.md)
- [Troubleshooting Guide](docs/troubleshooting/TROUBLESHOOTING.md)
