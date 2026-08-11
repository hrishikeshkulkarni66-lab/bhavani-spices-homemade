# Bhavani Homemade Spices — Database Specification

## Relational Schema Diagram

```
 ┌──────────────┐       ┌──────────────┐       ┌────────────────────────┐
 │    users     │       │   categories │       │   products             │
 ├──────────────┤       ├──────────────┤       ├────────────────────────┤
 │ id (PK)      │       │ id (PK)      │◄──────┼ category_id (FK)       │
 │ email        │       │ name         │       │ id (PK)                │
 │ password_hash│       │ slug         │       │ name, slug, price, mrp │
 │ role         │       └──────────────┘       │ stock_status, badge    │
 └──────┬───────┘                              └───────────┬────────────┘
        │                                                  │
        │                                                  │
 ┌──────▼───────┐                              ┌───────────▼────────────┐
 │   orders     │                              │   order_items          │
 ├──────────────┤                              ├────────────────────────┤
 │ id (PK)      │◄─────────────────────────────┼ order_id (FK)          │
 │ user_id (FK) │                              │ product_id (FK)        │
 │ customer_name│                              │ product_name, price    │
 │ total, status│                              │ quantity, total_price  │
 └──────────────┘                              └────────────────────────┘
```

---

## Core Tables Summary

1. **`users`**: User profiles with `email` (unique constraint), `password_hash` (bcrypt), `role` (`CUSTOMER`, `STAFF`, `ADMIN`, `SUPER_ADMIN`), timestamps.
2. **`products`**: Product catalog items with `id`, `name`, `slug`, `price`, `mrp`, `rating`, `reviews_count`, `badge`, `image`, `stock_status`, `ingredients`, `origin`.
3. **`inventory`**: Product stock levels (`available_quantity`, `reserved_quantity`, `low_stock_threshold`).
4. **`orders`**: Customer orders with `id`, `user_email`, `customer_name`, `customer_address`, `subtotal`, `shipping_fee`, `total`, `status`, `payment_method`, `payment_status`.
5. **`order_items`**: Order line items storing historical product names and unit prices.
6. **`payments`**: Payment transaction logs.
7. **`payment_events`**: Idempotent payment gateway webhook logs (`event_id` unique constraint).
8. **`audit_logs`**: Administrative audit history (`actor_email`, `action`, `entity`, `entity_id`, `old_value`, `new_value`, `request_id`, `ip_address`).
