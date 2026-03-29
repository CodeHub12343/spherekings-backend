# Shopping Cart System - Implementation Guide

## Overview

Complete production-ready implementation of a server-side Shopping Cart system for Spherekings Marketplace. The cart is persisted in MongoDB, tied to authenticated users, and validates products in real-time against the product catalog.

## Files Created

### Core Implementation Files

1. **src/models/Cart.js** - Mongoose schema for shopping carts
   - Cart document structure with userId and items array
   - CartItem sub-document with product reference, variant, quantity, price
   - Helper methods: findItemByProductAndVariant, calculateTotal, addItem, removeItem, etc.
   - Query helpers: withProducts(), withProductNames()
   - Static method: getOrCreate() for cart initialization

2. **src/services/cartService.js** - Business logic layer
   - getCart(userId) - Fetch user's cart
   - addToCart(userId, productData) - Add with validation
   - updateCartItem(userId, cartItemId, updates) - Modify items
   - removeFromCart(userId, cartItemId) - Remove single item
   - clearCart(userId) - Empty cart
   - validateProduct() - Check product exists and is active
   - validateStock() - Check inventory
   - validateVariant() - Check variant options
   - validateCartForCheckout() - Pre-checkout validation
   - Comprehensive error handling and input validation

3. **src/controllers/cartController.js** - HTTP request handlers
   - getCart() - GET /api/cart
   - addToCart() - POST /api/cart/add
   - updateCartItem() - POST /api/cart/update
   - removeFromCart() - POST /api/cart/remove
   - clearCart() - POST /api/cart/clear
   - getCartSummary() - GET /api/cart/summary
   - validateCart() - POST /api/cart/validate

4. **src/validators/cartValidator.js** - Joi validation schemas
   - addToCartSchema - Validates product addition
   - updateCartItemSchema - Validates item updates
   - removeFromCartSchema - Validates item removal
   - variantSchema - Flexible variant validation
   - validateCart() - Middleware for schema validation

5. **src/routes/cartRoutes.js** - API endpoint definitions
   - 7 HTTP endpoints for cart operations
   - All routes protected by authenticate middleware
   - Each route validates request data before controller
   - Comprehensive endpoint documentation

6. **src/utils/errors.js** - Error classes (already exists)
   - Used by cart service for consistent error handling

7. **Updated src/server.js**
   - Added cartRoutes import
   - Registered cart routes with /api/cart prefix

### Documentation Files

- **src/CART_API_DOCUMENTATION.js** - Complete API reference
- **CART_SYSTEM_README.md** - Quick start guide

## API Endpoints

### All endpoints require authentication (Bearer token)

**GET /api/cart**
- Retrieve user's complete cart with all items and totals
- Response: `{ success, message, data: { items, summary } }`

**POST /api/cart/add**
- Add product to cart or increase quantity if same variant exists
- Body: `{ productId, quantity, variant (optional) }`
- Validates product exists, is active, has stock
- Response: Updated cart

**POST /api/cart/update**
- Update quantity or variant of cart item
- Body: `{ cartItemId, quantity (optional), variant (optional) }`
- At least one update field required
- Response: Updated cart

**POST /api/cart/remove**
- Remove specific item from cart
- Body: `{ cartItemId }`
- Response: Updated cart

**POST /api/cart/clear**
- Clear all items from cart
- Body: `{}` (empty)
- Response: Empty cart with reset summaries

**GET /api/cart/summary**
- Get lightweight summary info (totals, item counts)
- Response: `{ itemCount, totalItems, subtotal, tax, total }`

**POST /api/cart/validate**
- Validate cart before checkout
- Checks products exist, in stock, prices current
- Response: Validation result with any issues

## Architecture

### Layered Design
```
HTTP Request → Routes → Controllers → Services → Models → MongoDB
     ↓
 Validation Middleware (Joi schemas)
     ↓
 Authentication Middleware (JWT)
     ↓
   Error Handler Middleware
```

### Data Structure

**Cart Document**
```javascript
{
  _id: ObjectId,
  userId: ObjectId (unique),
  items: [
    {
      _id: ObjectId,          // For item-specific operations
      productId: ObjectId,    // Reference to Product
      variant: { color: "Red" },
      quantity: 2,
      price: 49.99,           // Price snapshot at add-time
      addedAt: Date,
      subtotal: 99.98
    }
  ],
  createdAt: Date,
  updatedAt: Date
}
```

### Cart Totals Calculation
```
itemCount = number of unique products
totalItems = sum of all quantities
subtotal = sum of (price × quantity) for all items
tax = subtotal × 0.08 (8% default)
total = subtotal + tax
```

## Key Features

### ✅ User Isolation
- One cart per user (userId unique)
- Only authenticated users can access their cart
- Cannot access other users' carts

### ✅ Product Validation
- Products must exist and be in catalog
- Products must be active (not inactive/deleted)
- Products must have sufficient stock

### ✅ Variant Support
- Store selected product variants (color, edition, size, material)
- Same product with different variants = separate cart items
- Same product with same variants = increase quantity (no duplicate)

### ✅ Price Integrity
- Price stored at add-time (snapshot)
- Protects against client-side price manipulation
- Validation endpoint warns if prices changed

### ✅ Stock Management
- Real-time stock validation
- Prevents adding more than available
- Prevents items with zero stock
- Auto-updates on quantity changes

### ✅ Smart Duplicate Handling
- Adding same product with same variant increases quantity
- Adding same product with different variant creates new item
- Prevents accidental duplicates

### ✅ Cart Operations
- Add items with full validation
- Update quantities or variants
- Remove specific items
- Clear entire cart
- Get cart summary data

### ✅ Pre-Checkout Validation
- Validates all products still exist
- Checks all items have sufficient stock
- Reports price changes
- Safe to proceed to checkout

## Security Features

| Feature | Implementation |
|---------|---|
| **Authentication** | All endpoints require JWT token |
| **User Isolation** | Users access only their own cart |
| **Input Validation** | Joi schemas validate all requests |
| **Price Integrity** | Prices from database, not client |
| **Stock Validation** | Real-time inventory check |
| **Error Messages** | No sensitive data in responses |
| **Rate Limiting** | Inherited from server.js (100/15min) |

## Integration Points

### With Authentication System
- Uses `req.user._id` from JWT token
- Ensures user isolation
- All routes require authenticate middleware

### With Product Catalog
- Fetches product details for validation
- Checks product status and availability
- Retrieves current price (stored as snapshot)
- Validates variant options match product

### With Checkout System (Future)
- Cart items → Order items conversion
- Cart totals → Order amount
- Stock decrement on order creation
- Cart clear after successful order

## Usage Examples

### Get User's Cart
```bash
GET /api/cart
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "items": [ ... ],
    "summary": {
      "itemCount": 2,
      "totalItems": 5,
      "subtotal": 149.95,
      "tax": 12.00,
      "total": 161.95
    }
  }
}
```

### Add Product to Cart
```bash
POST /api/cart/add
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "507f1f77bcf86cd799439014",
  "quantity": 2,
  "variant": { "color": "Red", "edition": "Deluxe" }
}

Response: (201 Created)
Updated cart with new item
```

### Update Cart Item
```bash
POST /api/cart/update
Authorization: Bearer <token>

{
  "cartItemId": "607f1f77bcf86cd799439013",
  "quantity": 5
}

Response:
Updated cart with new quantity
```

### Remove Item
```bash
POST /api/cart/remove
Authorization: Bearer <token>

{
  "cartItemId": "607f1f77bcf86cd799439013"
}

Response:
Updated cart without that item
```

### Clear Entire Cart
```bash
POST /api/cart/clear
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "items": [],
    "summary": {
      "itemCount": 0,
      "totalItems": 0,
      "subtotal": 0,
      "tax": 0,
      "total": 0
    }
  }
}
```

### Get Cart Summary
```bash
GET /api/cart/summary
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "itemCount": 2,
    "totalItems": 5,
    "subtotal": 149.95,
    "tax": 12.00,
    "total": 161.95
  }
}
```

### Validate Cart Before Checkout
```bash
POST /api/cart/validate
Authorization: Bearer <token>

Response (if valid):
{
  "success": true,
  "data": {
    "valid": true,
    "cart": { ... full cart data ... }
  }
}

Response (if issues):
{
  "success": false,
  "statusCode": 400,
  "errors": {
    "issues": [
      { "itemId": "...", "issue": "Only 2 units available" }
    ]
  }
}
```

## Error Handling

### Validation Errors (400)
```
- Invalid product ID format
- Quantity not integer between 1-1000
- Invalid variant selection
- Missing required fields
```

### Not Found Errors (404)
```
- Product doesn't exist in catalog
- Cart item not found in user's cart
```

### Business Logic Errors (400)
```
- Product is inactive/unavailable
- Product out of stock
- Insufficient stock for quantity
- No updates provided to update endpoint
```

### Authentication Errors (401)
```
- Missing JWT token
- Invalid/expired token
```

## Edge Cases Handled

✅ Adding same product multiple times - Increases quantity automatically  
✅ Out of stock products - Rejected with clear error  
✅ Invalid variant selections - Validation against product schema  
✅ Quantity 0 or negative - Only positive integers 1-1000 allowed  
✅ Very large quantities - Capped at 1000 per item  
✅ Product price changes - Original price preserved, change warned  
✅ Product deletion - Item remains in cart, shows unavailable  
✅ Empty cart - Handled gracefully, allows clear state  
✅ Stock updates - Real-time checks prevent overselling  
✅ Concurrent operations - MongoDB atomic operations ensure consistency

## Testing Checklist

- [ ] Add product to empty cart
- [ ] Add same product with different variant (creates new item)
- [ ] Add same product with same variant (increases quantity)
- [ ] Update quantity of existing item
- [ ] Change variant of existing item
- [ ] Remove single item from cart
- [ ] Clear entire cart
- [ ] Get cart with no items
- [ ] Add product that's out of stock (should fail)
- [ ] Add quantity exceeding available stock (should fail)
- [ ] Add with invalid variant (should fail)
- [ ] Update nonexistent cart item (should fail)
- [ ] Get cart summary
- [ ] Validate cart before checkout
- [ ] Test authentication requirement (all endpoints)

## Performance Considerations

### Current Implementation
- Direct database queries (no caching)
- Calculated totals on retrieval (not stored)
- Lean queries for read-only operations
- Indexed userId for fast lookup

### Future Optimizations
- Redis caching for active carts
- Materialized totals in document
- Cart item change history
- Analytics on cart behavior
- Cart abandonment tracking

## Dependencies Required

Ensure package.json includes:
- `mongoose` - MongoDB ORM
- `express` - Web framework
- `joi` - Input validation
- `jsonwebtoken` - JWT auth (auth middleware)
- `bcrypt` - Password hashing (for User model)
- `dotenv` - Environment variables

## Project Structure

```
src/
├── config/
│   └── database.js                    ✅ (existing)
├── models/
│   ├── User.js                        ✅ (existing)
│   ├── Product.js                     ✅ (existing)
│   └── Cart.js                        ✨ (new)
├── services/
│   ├── productService.js              ✅ (existing)
│   └── cartService.js                 ✨ (new)
├── controllers/
│   ├── productController.js           ✅ (existing)
│   └── cartController.js              ✨ (new)
├── routes/
│   ├── authRoutes.js                  ✅ (existing)
│   ├── productRoutes.js               ✅ (existing)
│   └── cartRoutes.js                  ✨ (new)
├── validators/
│   ├── productValidator.js            ✅ (existing)
│   └── cartValidator.js               ✨ (new)
├── middlewares/
│   ├── authMiddleware.js              ✅ (existing)
│   ├── roleMiddleware.js              ✅ (existing)
│   └── errorHandler.js                ✅ (existing)
├── utils/
│   └── errors.js                      ✅ (existing)
├── CART_API_DOCUMENTATION.js          ✨ (new)
├── PRODUCT_API_DOCUMENTATION.js       ✅ (existing)
└── server.js                          ✅ (updated)
```

## Common Use Cases

### Homepage - Show Cart Badge Count
```javascript
GET /api/cart/summary
// Display: totalItems (5 items)
```

### Product Detail Page - Add to Cart
```javascript
POST /api/cart/add
// Body: { productId, quantity: 1, variant: {} }
// Redirect to cart or show confirmation
```

### Shopping Cart Page - Display Items
```javascript
GET /api/cart
// Display all items with totals
// Show update/remove buttons for each item
```

### Checkout Page - Pre-checkout Validation
```javascript
POST /api/cart/validate
// Check for issues before proceeding
// Warn user of price changes if any
```

## Next Steps

1. ✅ Cart system implementation complete
2. → Integrate with Checkout system
3. → Implement Order creation from cart
4. → Add stock decrement logic
5. → Implement cart clear on successful order
6. → Add Redis caching (optional)
7. → Track cart abandonment analytics

## Support

For detailed API documentation: **src/CART_API_DOCUMENTATION.js**

For architecture details: Repository memory at `/memories/repo/CART_SYSTEM_ARCHITECTURE.md`
