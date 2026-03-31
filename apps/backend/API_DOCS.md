# E-Commerce API Documentation

Base URL: `http://localhost:3001/api`

---

## Authentication

### Admin Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/admin/login` | Admin login |
| POST | `/auth/admin/logout` | Admin logout |
| GET | `/auth/admin/me` | Get current admin profile |

### Customer Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new customer |
| POST | `/auth/login` | Customer login |
| POST | `/auth/logout` | Customer logout |
| GET | `/auth/me` | Get current customer profile |

---

## Categories

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/categories` | Get all categories | Public |
| GET | `/categories/:id` | Get category by ID | Public |
| POST | `/categories` | Create new category | Admin |
| PUT | `/categories/:id` | Update category | Admin |
| DELETE | `/categories/:id` | Delete category | Admin |

### Request/Response Examples

**GET /categories**
```json
// Response 200
[
  { "id": 1, "name": "Electronics", "description": "Electronic devices" },
  { "id": 2, "name": "Clothing", "description": "Fashion items" }
]
```

**POST /categories**
```json
// Request Body
{ "name": "Electronics", "description": "Electronic devices" }

// Response 201
{ "id": 1, "name": "Electronics", "description": "Electronic devices" }
```

---

## Articles (Products)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/articles` | Get all articles | Public |
| GET | `/articles/:id` | Get article by ID | Public |
| GET | `/articles/category/:categoryId` | Get articles by category | Public |
| POST | `/articles` | Create new article | Admin |
| PUT | `/articles/:id` | Update article | Admin |
| DELETE | `/articles/:id` | Delete article | Admin |
| PATCH | `/articles/:id/stock` | Update stock quantity | Admin |

### Query Parameters for GET /articles

| Parameter | Type | Description |
|-----------|------|-------------|
| `category` | number | Filter by category ID |
| `search` | string | Search by name |
| `minPrice` | number | Minimum price filter |
| `maxPrice` | number | Maximum price filter |
| `inStock` | boolean | Only show in-stock items |
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 20) |

### Request/Response Examples

**GET /articles**
```json
// Response 200
{
  "data": [
    {
      "id": 1,
      "name": "Laptop",
      "description": "Powerful laptop",
      "price": 999.99,
      "stock_quantity": 10,
      "image_url": "/images/laptop.jpg",
      "category_id": 1,
      "created_at": "2026-01-17T12:00:00Z"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 20
}
```

**POST /articles**
```json
// Request Body
{
  "name": "Laptop",
  "description": "Powerful laptop",
  "price": 999.99,
  "stock_quantity": 10,
  "image_url": "/images/laptop.jpg",
  "category_id": 1
}

// Response 201
{ "id": 1, "message": "Article created successfully" }
```

---

## Customers

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/customers` | Get all customers | Admin |
| GET | `/customers/:id` | Get customer by ID | Admin/Self |
| PUT | `/customers/:id` | Update customer | Admin/Self |
| DELETE | `/customers/:id` | Delete customer | Admin |

### Request/Response Examples

**GET /customers/:id**
```json
// Response 200
{
  "id": 1,
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "address": "123 Main St",
  "city": "New York",
  "postal_code": "10001",
  "created_at": "2026-01-17T12:00:00Z"
}
```

**PUT /customers/:id**
```json
// Request Body
{
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890",
  "address": "456 New St",
  "city": "Los Angeles",
  "postal_code": "90001"
}

// Response 200
{ "message": "Customer updated successfully" }
```

---

## Orders

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/orders` | Get all orders | Admin |
| GET | `/orders/:id` | Get order by ID | Admin/Owner |
| GET | `/orders/customer/:customerId` | Get customer's orders | Admin/Self |
| POST | `/orders` | Create new order (checkout) | Customer |
| PATCH | `/orders/:id/status` | Update order status | Admin |
| DELETE | `/orders/:id` | Cancel/Delete order | Admin |

### Order Statuses

| Status | Description |
|--------|-------------|
| `pending` | Order placed, awaiting processing |
| `shipped` | Order has been shipped |
| `delivered` | Order delivered to customer |
| `cancelled` | Order cancelled |

### Request/Response Examples

**POST /orders** (Checkout)
```json
// Request Body
{
  "customer_id": 1,
  "items": [
    { "article_id": 1, "quantity": 2 },
    { "article_id": 3, "quantity": 1 }
  ]
}

// Response 201
{
  "id": 1,
  "order_date": "2026-01-17T12:00:00Z",
  "status": "pending",
  "total_amount": 149.97,
  "customer_id": 1,
  "items": [
    { "article_id": 1, "quantity": 2, "unit_price": 49.99 },
    { "article_id": 3, "quantity": 1, "unit_price": 49.99 }
  ]
}
```

**GET /orders/:id**
```json
// Response 200
{
  "id": 1,
  "order_date": "2026-01-17T12:00:00Z",
  "status": "pending",
  "total_amount": 149.97,
  "customer_id": 1,
  "items": [
    {
      "article_id": 1,
      "article_name": "T-Shirt",
      "quantity": 2,
      "unit_price": 49.99,
      "image_url": "/images/tshirt.jpg"
    }
  ]
}
```

**PATCH /orders/:id/status**
```json
// Request Body
{ "status": "shipped" }

// Response 200
{ "message": "Order status updated to shipped" }
```

---

## Order Details (Line Items)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/orders/:orderId/items` | Get order items | Admin/Owner |
| POST | `/orders/:orderId/items` | Add item to order | Admin |
| PUT | `/orders/:orderId/items/:articleId` | Update order item | Admin |
| DELETE | `/orders/:orderId/items/:articleId` | Remove item from order | Admin |

---

## Admin Management

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/admins` | Get all admins | Admin |
| GET | `/admins/:id` | Get admin by ID | Admin |
| POST | `/admins` | Create new admin | Admin |
| PUT | `/admins/:id` | Update admin | Admin |
| DELETE | `/admins/:id` | Delete admin | Admin |

---

## Error Responses

All endpoints return consistent error responses:

```json
// 400 Bad Request
{ "error": "Validation error", "message": "Email is required" }

// 401 Unauthorized
{ "error": "Unauthorized", "message": "Please login to continue" }

// 403 Forbidden
{ "error": "Forbidden", "message": "You don't have permission" }

// 404 Not Found
{ "error": "Not Found", "message": "Resource not found" }

// 500 Internal Server Error
{ "error": "Server Error", "message": "An unexpected error occurred" }
```

---

## Summary of Endpoints

| Resource | Endpoints Count |
|----------|----------------|
| Auth | 7 |
| Categories | 5 |
| Articles | 7 |
| Customers | 4 |
| Orders | 6 |
| Order Details | 4 |
| Admins | 5 |
| **Total** | **38** |
