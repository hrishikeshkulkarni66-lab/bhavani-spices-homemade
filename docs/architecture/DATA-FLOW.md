# Bhavani Homemade Spices — Data Flow Specification

## 1. Checkout & Order Placement Sequence

```
Customer              Frontend             Express API            Database
   │                     │                      │                     │
   ├────── Checkout ────>│                      │                     │
   │       Form Submit   │                      │                     │
   │                     ├──── POST /orders ───>│                     │
   │                     │    (Items + Address) │                     │
   │                     │                      ├── Fetch live prices ─>│
   │                     │                      │<── Catalog prices ──┤
   │                     │                      │                     │
   │                     │                      ├── Verify stock &    │
   │                     │                      │   calculate total   │
   │                     │                      │                     │
   │                     │                      ├── INSERT Order ────>│
   │                     │                      │<── Order Created ───┤
   │                     │<── Order Confirmed ──┤                     │
   │<── Success Screen ──┤   (201 Created)      │                     │
```

---

## 2. Admin Operation Authorization & Audit Sequence

```
Admin User           Frontend             Express API            Audit Logger
   │                     │                      │                     │
   ├───── Save Stock ───>│                      │                     │
   │      Status Change  │                      │                     │
   │                     ├── PATCH /admin/... ─>│                     │
   │                     │   (Bearer Token)     │                     │
   │                     │                      ├── Verify JWT &      │
   │                     │                      │   ADMIN role        │
   │                     │                      │                     │
   │                     │                      ├── Update DB Product ┤
   │                     │                      │                     │
   │                     │                      ├── Record Audit ────>│
   │                     │                      │   Event             │
   │                     │<── 200 OK Response ──┤                     │
   │<── Toast Success ───┤                      │                     │
```
