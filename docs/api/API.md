# Bhavani Homemade Spices — REST API Documentation

Base URL: `/api/v1`

---

## 1. Authentication Endpoints

### `POST /auth/register`
* **Request:** `{ "name": "John Doe", "email": "john@example.com", "password": "Password123!" }`
* **Response (201 Created):** `{ "success": true, "data": { "user": { "id": "...", "name": "John Doe", "email": "john@example.com", "role": "CUSTOMER" }, "token": "JWT..." } }`

### `POST /auth/login`
* **Request:** `{ "email": "john@example.com", "password": "Password123!" }`
* **Response (200 OK):** `{ "success": true, "data": { "user": { ... }, "token": "JWT..." } }`

### `GET /auth/me`
* **Headers:** `Authorization: Bearer <JWT_TOKEN>`
* **Response (200 OK):** `{ "success": true, "data": { "user": { ... } } }`

---

## 2. Product Endpoints

### `GET /products`
* **Query Params:** `category`, `search`, `stock_status`
* **Response (200 OK):** `{ "success": true, "data": [ { "id": "garam-masala", "name": "Royal Garam Masala", "price": 280.00, ... } ] }`

### `GET /products/:id`
* **Response (200 OK):** `{ "success": true, "data": { ... } }`

---

## 3. Order Endpoints

### `POST /orders`
* **Request:** `{ "customerName": "...", "customerEmail": "...", "customerAddress": "...", "customerCity": "...", "customerPostal": "...", "paymentMethod": "UPI", "items": [ { "id": "garam-masala", "quantity": 2 } ] }`
* **Response (201 Created):** `{ "success": true, "data": { "id": "#MC-987654", "total": 560.00, "status": "CONFIRMED" } }`

### `GET /orders?email=customer@example.com`
* **Headers:** `Authorization: Bearer <JWT_TOKEN>`
* **Response (200 OK):** `{ "success": true, "data": [ ... ] }`

---

## 4. Admin Endpoints

### `POST /admin/products`
* **Headers:** `Authorization: Bearer <ADMIN_JWT_TOKEN>`
* **Response (201 Created):** `{ "success": true, "data": { ... } }`

### `PATCH /admin/products/:id`
* **Headers:** `Authorization: Bearer <ADMIN_JWT_TOKEN>`
* **Response (200 OK):** `{ "success": true, "data": { ... } }`

### `GET /admin/audit-logs`
* **Headers:** `Authorization: Bearer <ADMIN_JWT_TOKEN>`
* **Response (200 OK):** `{ "success": true, "data": [ ... ] }`
