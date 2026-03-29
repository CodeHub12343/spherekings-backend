# Product Catalog & Marketplace System - Quick Start Guide

## Overview

Complete production-ready implementation of the Product Catalog and Marketplace system for Spherekings using Node.js, Express, and MongoDB.

## Files Created

### Core Implementation
- **src/models/Product.js** - Mongoose schema with validation, helpers, and indexes
- **src/services/productService.js** - Business logic layer (CRUD, search, inventory)
- **src/controllers/productController.js** - HTTP request handlers
- **src/routes/productRoutes.js** - API endpoint definitions
- **src/validators/productValidator.js** - Joi validation schemas
- **src/utils/errors.js** - Custom error classes
- **src/PRODUCT_API_DOCUMENTATION.js** - Complete API reference

### Integration Points
- Updated **src/server.js** - Product routes registered in Express app

## Project Structure

```
src/
├── config/database.js           ✅ MongoDB connection (existing)
├── models/Product.js            ✨ Product schema implementation
├── services/productService.js   ✨ Business logic layer
├── controllers/productController.js  ✨ Request handlers
├── routes/productRoutes.js      ✨ API endpoints
├── validators/productValidator.js   ✨ Input validation
├── middlewares/                 ✅ Auth/Error handling (existing)
├── utils/errors.js              ✨ Error classes
└── server.js                    ✅ Updated with product routes
```

## Quick API Reference

### Public Endpoints (No Authentication)

```bash
# Get all products (paginated)
GET /api/products?page=1&limit=10&status=active

# Get single product
GET /api/products/:id

# Search products
GET /api/products/search?q=deluxe

# Get featured products
GET /api/products/featured

# Get related products
GET /api/products/:id/related
```

### Admin Endpoints (Requires JWT + Admin Role)

```bash
# Create product
POST /api/products
Headers: Authorization: Bearer <token>

# Update product
PUT /api/products/:id
Headers: Authorization: Bearer <token>

# Delete product (soft delete)
DELETE /api/products/:id
Headers: Authorization: Bearer <token>

# Update stock
PUT /api/products/:id/stock
Headers: Authorization: Bearer <token>
Body: { "quantity": 10, "operation": "decrement" }
```

## Implementation Highlights

### ✅ Production Ready
- Comprehensive error handling with typed error classes
- Input validation using Joi schemas
- Proper HTTP status codes
- Consistent response formatting
- Soft delete support (data preservation)

### ✅ Security
- JWT authentication for admin operations
- Role-based access control (admin-only endpoints)
- Input sanitization
- Rate limiting (via server.js)
- CORS & Helmet headers (via server.js)

### ✅ Performance
- Database indexes on `name`, `status`, `createdAt`
- Full-text search capability
- Pagination for large datasets
- Lean queries for read-only operations
- Atomic MongoDB operations for stock updates

### ✅ Scalability
- Modular architecture (Routes → Controllers → Services → Models)
- Extensible validator system
- Helper methods for common operations
- Query helpers for filtering (active(), deleted())
- Support for Redis caching (ready to integrate)

### ✅ Data Integrity
- MongoDB schema validation
- Mongoose pre-save middleware
- Unique constraints
- Required field validation
- Type enforcement

## Layered Architecture

```
HTTP Request
     ↓
[Routes] - Defines endpoints, applies validation & auth middleware
     ↓
[Controllers] - Extracts request data, calls services, formats responses
     ↓
[Services] - Contains business logic, performs database operations
     ↓
[Models] - Database schema, validation rules, helper methods
     ↓
MongoDB Database
```

## Usage Examples

### Example: Create a Product

```javascript
// POST /api/products
Headers: 
  Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
  Content-Type: application/json

Body:
{
  "name": "Sphere of Kings Deluxe Edition",
  "description": "Premium board game with enhanced components and exclusive accessories",
  "price": 49.99,
  "images": [
    "https://cdn.example.com/image1.jpg",
    "https://cdn.example.com/image2.jpg"
  ],
  "variants": [
    {
      "name": "color",
      "options": ["Red", "Blue", "Gold"]
    }
  ],
  "stock": 100,
  "category": "board-games",
  "isFeatured": true
}

Response (201 Created):
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "sphere of kings deluxe edition",
    ... (all product fields)
  }
}
```

### Example: Get All Products

```javascript
// GET /api/products?page=1&limit=10&status=active&sort=-createdAt

Response (200 OK):
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": [
    { ... product object ... },
    { ... product object ... }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 45,
    "itemsPerPage": 10,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

### Example: Update Stock (Order Processing)

```javascript
// PUT /api/products/:id/stock
Headers: 
  Authorization: Bearer <token>
  Content-Type: application/json

Body:
{
  "quantity": 1,
  "operation": "decrement"
}

Response (200 OK):
{
  "success": true,
  "message": "Product stock updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "sphere of kings deluxe edition",
    "stock": 99,
    "status": "active",
    ... (all product fields)
  }
}
```

## Data Model

### Product Schema

```javascript
{
  _id: ObjectId,                    // MongoDB ID
  name: String (unique),             // Product name
  description: String,               // Detailed description
  price: Number,                     // Price in USD
  images: [String],                  // Array of image URLs
  variants: [                        // Product variants
    {
      name: String,                  // 'color', 'edition', 'size', 'material'
      options: [String]              // e.g., ['Red', 'Blue', 'Gold']
    }
  ],
  stock: Number,                     // Inventory quantity
  status: String,                    // 'active', 'inactive', 'out_of_stock'
  category: String (optional),       // Product category
  sku: String (optional, unique),    // Stock keeping unit
  isFeatured: Boolean,               // Featured on homepage?
  createdAt: Date,                   // Creation timestamp
  updatedAt: Date,                   // Last update timestamp
  deletedAt: Date (optional)         // Soft delete timestamp
}
```

## Integration with Existing Systems

### Authentication (✅ Already Exists)
- Uses **src/middlewares/authMiddleware.js** for JWT verification
- Middleware: `authenticate` - verifies token and attaches `req.user`

### Authorization (✅ Already Exists)
- Uses **src/middlewares/roleMiddleware.js** for role checks
- Middleware: `authorize('admin')` - restricts to admin role
- All admin product endpoints protected

### Error Handling (✅ Already Exists)
- Uses **src/middlewares/errorHandler.js** for global error catching
- Converts typed errors to standard HTTP responses
- Provides consistent error format

### Database (✅ Already Exists)
- Uses **src/config/database.js** for MongoDB connection
- Mongoose ORM for schema definition and operations

## Security Features

| Feature | Implementation |
|---------|---|
| **Authentication** | JWT tokens via /api/auth/login |
| **Authorization** | Role-based (admin, customer, affiliate) |
| **Input Validation** | Joi schemas on all endpoints |
| **Rate Limiting** | 100 requests/15 min (via server.js) |
| **CORS** | Configured (via server.js) |
| **Security Headers** | Helmet (via server.js) |
| **NoSQL Injection Prevention** | MongoDB sanitization (via server.js) |
| **Error Messages** | No sensitive data leaks |

## Common Operations

### Add Product to Order
Use `PUT /api/products/:id/stock` with operation: "decrement" and quantity: quantity_ordered

### Process Refund
Use `PUT /api/products/:id/stock` with operation: "increment" and quantity: quantity_returned

### Feature Product
Admin can update isFeatured field via `PUT /api/products/:id` with `{ "isFeatured": true }`

### Search Products
Customer can use `GET /api/products/search?q=<search_term>` for full-text search

## Error Codes

| Status | Message | Cause |
|--------|---------|-------|
| 200 | Success | Valid GET/PUT request |
| 201 | Created | Valid POST request |
| 400 | Bad Request | Validation error |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Product doesn't exist |
| 409 | Conflict | Duplicate product name |
| 500 | Server Error | Unexpected error |

## Testing the Implementation

### 1. Start the server
```bash
npm run dev
```

### 2. Get a JWT token
```bash
POST /api/auth/login
{
  "email": "admin@example.com",
  "password": "password123"
}
```

### 3. Create a product
```bash
POST /api/products
Authorization: Bearer <token_from_step_2>
Content-Type: application/json

{
  "name": "Test Product",
  "description": "This is a test product description for testing",
  "price": 29.99,
  "images": ["https://example.com/image.jpg"],
  "stock": 50
}
```

### 4. Get products
```bash
GET /api/products?page=1&limit=10
```

### 5. Get specific product
```bash
GET /api/products/<_id_from_creation>
```

## Dependencies Required

Make sure these are in your package.json:
- `express` - Web framework
- `mongoose` - MongoDB ORM
- `joi` - Input validation
- `bcrypt` - Password hashing
- `jsonwebtoken` - JWT auth
- `cors` - Cross-origin requests
- `helmet` - Security headers
- `express-rate-limit` - Rate limiting
- `dotenv` - Environment variables

## Next Steps

1. **Test all endpoints** using Postman/Insomnia
2. **Integrate with Cart system** - Add products to cart
3. **Integrate with Orders** - Decrement stock on purchase
4. **Integrate with Affiliate system** - Track sales per affiliate
5. **Add Categories** - Implement product categorization
6. **Add Redis caching** - Cache frequently accessed products
7. **Upload to production** - Deploy to MongoDB Atlas + Express server

## Support

For API documentation, see: **src/PRODUCT_API_DOCUMENTATION.js**

For architecture details, see: Repository memory at `/memories/repo/PRODUCT_CATALOG_SYSTEM.md`
