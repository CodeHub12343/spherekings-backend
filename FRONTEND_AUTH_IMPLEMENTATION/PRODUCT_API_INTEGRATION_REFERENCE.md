# Product API Integration - Complete Reference

## Overview

This document provides a complete reference for integrating the Spherekings Product API into the frontend. It covers all endpoints, request/response formats, error handling, and integration patterns.

## Base Configuration

```javascript
// Backend Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

// Authentication
// All admin endpoints require JWT token in Authorization header
// Header: Authorization: Bearer <access_token>
```

## Public Endpoints

### 1. Get Products (Paginated)
**Endpoint**: `GET /products`

**Request Parameters**:
```javascript
{
  page: number,           // Page number (default: 1)
  limit: number,          // Items per page (default: 12, max: 100)
  status: string,         // Filter: 'active' | 'inactive' | 'out_of_stock'
  category: string,       // Filter by category (case-insensitive)
  sort: string           // Sort: 'newest' | 'price_asc' | 'price_desc' | 'popular'
}
```

**Response**:
```javascript
{
  success: true,
  message: "Products retrieved successfully",
  data: {
    products: [
      {
        _id: "product_id",
        name: "Product Name",
        description: "Product description",
        price: 99.99,
        originalPrice: 129.99,
        images: ["url1", "url2"],
        stock: 50,
        status: "active",
        category: "electronics",
        sku: "SKU123",
        isFeatured: false,
        variants: [
          {
            name: "color",
            options: ["red", "blue", "green"]
          }
        ],
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-02T00:00:00Z"
      }
    ],
    pagination: {
      total: 100,
      page: 1,
      limit: 12,
      pages: 9
    }
  }
}
```

**Frontend Usage**:
```javascript
const { data } = useProducts({ page, limit: 12, status: 'active' });
// data.products, data.pagination
```

---

### 2. Get Featured Products
**Endpoint**: `GET /products/featured`

**Request Parameters**:
```javascript
{
  limit: number  // Number of featured products (default: 6, max: 50)
}
```

**Response**:
```javascript
{
  success: true,
  message: "Featured products retrieved",
  data: {
    products: [
      // Product objects with isFeatured: true
    ]
  }
}
```

**Frontend Usage**:
```javascript
const { data } = useFeaturedProducts(6);
// data.products
```

---

### 3. Search Products
**Endpoint**: `GET /products/search`

**Request Parameters**:
```javascript
{
  q: string,              // Search query (required, min 1 char)
  page: number,           // Pagination (default: 1)
  limit: number,          // Items per page (default: 12)
  category: string,       // Optional category filter
  minPrice: number,       // Optional price range
  maxPrice: number        // Optional price range
}
```

**Response**:
```javascript
{
  success: true,
  message: "Search completed",
  data: {
    products: [
      // Matching product objects
    ],
    pagination: {
      total: 25,
      page: 1,
      limit: 12,
      pages: 3
    }
  }
}
```

**Frontend Usage**:
```javascript
const { data } = useSearchProducts('laptop', { page, limit: 12 });
// data.products, data.pagination
```

---

### 4. Get Product Detail
**Endpoint**: `GET /products/:id`

**Path Parameters**:
```javascript
{
  id: string  // Product ID (MongoDB ObjectId)
}
```

**Response**:
```javascript
{
  success: true,
  message: "Product retrieved",
  data: {
    product: {
      _id: "product_id",
      name: "Detailed Product",
      description: "Full description...",
      price: 99.99,
      originalPrice: 129.99,
      images: ["url1", "url2", "url3"],
      stock: 50,
      status: "active",
      category: "electronics",
      sku: "SKU123",
      isFeatured: true,
      variants: [
        {
          name: "color",
          options: ["red", "blue", "green"]
        },
        {
          name: "size",
          options: ["S", "M", "L", "XL"]
        }
      ],
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-02T00:00:00Z"
    }
  }
}
```

**Frontend Usage**:
```javascript
const { data: product } = useProductDetail(product_id);
// product.product
```

---

### 5. Get Related Products
**Endpoint**: `GET /products/:id/related`

**Path Parameters**:
```javascript
{
  id: string  // Product ID
}
```

**Query Parameters**:
```javascript
{
  limit: number  // Number of related products (default: 4)
}
```

**Response**:
```javascript
{
  success: true,
  message: "Related products retrieved",
  data: {
    products: [
      // 4 related products in same category
    ]
  }
}
```

**Frontend Usage**:
```javascript
const { data } = useRelatedProducts(product_id, 4);
// data.products
```

---

## Admin Endpoints (Protected)

All admin endpoints require:
- Valid JWT token in `Authorization: Bearer <token>` header
- User with admin role

### 6. Create Product
**Endpoint**: `POST /admin/products`

**Headers Required**:
```javascript
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body**:
```javascript
{
  name: string,              // 3-100 chars (required)
  description: string,       // 20-2000 chars (required)
  price: number,             // Min 0.01, 2 decimals (required)
  stock: number,             // Min 0, integer (required)
  images: [string],          // 1-10 URLs (required)
  category: string,          // Optional, lowercase
  sku: string,               // Optional, unique, uppercase
  isFeatured: boolean,       // Optional, default false
  status: string,            // 'active' | 'inactive' | 'out_of_stock' (default: 'active')
  originalPrice: number,     // Optional, for sale display
  variants: [
    {
      name: string,          // 'color' | 'edition' | 'size' | 'material'
      options: [string]      // 1-20 options required
    }
  ]
}
```

**Example Request**:
```javascript
const productData = {
  name: "Wireless Headphones",
  description: "High-quality wireless headphones with noise cancellation...",
  price: 79.99,
  stock: 100,
  images: ["https://example.com/img1.jpg", "https://example.com/img2.jpg"],
  category: "electronics",
  sku: "WH001",
  isFeatured: true,
  status: "active",
  variants: [
    {
      name: "color",
      options: ["black", "white", "gold"]
    }
  ]
};

const { mutateAsync } = useCreateProduct();
await mutateAsync(productData);
```

**Response (Success)**:
```javascript
{
  success: true,
  message: "Product created successfully",
  data: {
    product: {
      _id: "new_product_id",
      name: "Wireless Headphones",
      // ... complete product object
    }
  }
}
```

**Response (Validation Error)**:
```javascript
{
  success: false,
  message: "Validation failed",
  errors: {
    name: "Name must be between 3 and 100 characters",
    price: "Price must be greater than 0.01",
    images: "Must provide between 1 and 10 images"
  }
}
```

---

### 7. Update Product
**Endpoint**: `PUT /admin/products/:id`

**Headers**:
```javascript
Authorization: Bearer <access_token>
```

**Path Parameters**:
```javascript
{
  id: string  // Product ID to update
}
```

**Request Body**:
```javascript
{
  // All fields are optional, send only what you want to update
  name: string,
  description: string,
  price: number,
  stock: number,
  images: [string],
  category: string,
  sku: string,
  isFeatured: boolean,
  status: string,
  originalPrice: number,
  variants: [
    {
      name: string,
      options: [string]
    }
  ]
}
```

**Frontend Usage**:
```javascript
const { mutateAsync } = useUpdateProduct(product_id);
await mutateAsync({
  name: "Updated Product Name",
  price: 89.99,
  stock: 150
});
```

**Response**:
```javascript
{
  success: true,
  message: "Product updated successfully",
  data: {
    product: {
      _id: product_id,
      // Updated product object
    }
  }
}
```

---

### 8. Delete Product (Soft Delete)
**Endpoint**: `DELETE /admin/products/:id`

**Headers**:
```javascript
Authorization: Bearer <access_token>
```

**Path Parameters**:
```javascript
{
  id: string  // Product ID to delete
}
```

**Frontend Usage**:
```javascript
const { mutateAsync } = useDeleteProduct();
await mutateAsync(product_id);
```

**Response**:
```javascript
{
  success: true,
  message: "Product deleted successfully"
}
```

**Note**: Product is marked with `deletedAt` timestamp. Not permanently removed.

---

### 9. Update Stock
**Endpoint**: `PUT /admin/products/:id/stock`

**Headers**:
```javascript
Authorization: Bearer <access_token>
```

**Path Parameters**:
```javascript
{
  id: string  // Product ID
}
```

**Request Body**:
```javascript
{
  quantity: number,      // Amount to add/remove (required)
  operation: string      // 'add' | 'subtract' | 'set' (required)
}
```

**Operations**:
- `add`: Increase stock by quantity
- `subtract`: Decrease stock by quantity
- `set`: Set stock to exact quantity

**Example**:
```javascript
// Add 50 units
const { mutateAsync } = useUpdateStock(product_id);
await mutateAsync({ quantity: 50, operation: 'add' });

// Reduce stock by 10
await mutateAsync({ quantity: 10, operation: 'subtract' });

// Set to exactly 100
await mutateAsync({ quantity: 100, operation: 'set' });
```

**Response**:
```javascript
{
  success: true,
  message: "Stock updated successfully",
  data: {
    product: {
      _id: product_id,
      stock: 150,
      // ... rest of product
    }
  }
}
```

---

## Error Handling

### Common Error Responses

**400 Bad Request - Validation Error**:
```javascript
{
  status: 400,
  success: false,
  message: "Validation failed",
  errors: {
    fieldName: "Error message for this field"
  }
}
```

**401 Unauthorized**:
```javascript
{
  status: 401,
  success: false,
  message: "Unauthorized. Please login first."
}
```

**403 Forbidden**:
```javascript
{
  status: 403,
  success: false,
  message: "Admin access required"
}
```

**404 Not Found**:
```javascript
{
  status: 404,
  success: false,
  message: "Product not found"
}
```

**500 Server Error**:
```javascript
{
  status: 500,
  success: false,
  message: "Server error occurred"
}
```

### Frontend Error Handling Pattern
```javascript
const { mutateAsync } = useCreateProduct({
  onError: (error) => {
    const errorMessage = error.response?.data?.message || error.message;
    const fieldErrors = error.response?.data?.errors || {};
    
    // Display field-specific errors
    Object.entries(fieldErrors).forEach(([field, message]) => {
      setFieldError(field, message);
    });
    
    // Display general error
    showToast(errorMessage, 'error');
  }
});
```

---

## Validation Rules Reference

### Product Fields Validation

| Field | Rules | Example |
|-------|-------|---------|
| name | 3-100 chars, unique | "Wireless Headphones" |
| description | 20-2000 chars | "High quality wireless headphones..." |
| price | Min 0.01, 2 decimals | 99.99 |
| stock | Non-negative integer | 50 |
| images | 1-10 valid URLs | ["https://example.com/img.jpg"] |
| category | Optional, lowercase | "electronics" |
| sku | Optional, unique, uppercase | "WH001" |
| isFeatured | Boolean | true/false |
| status | Enum | "active", "inactive", "out_of_stock" |
| variants | Optional array | [{name: "color", options: ["red"]}] |

### Variant Rules
- **name**: Must be one of: `color`, `edition`, `size`, `material`
- **options**: Array of 1-20 string options
- Can have multiple variants of different types

---

## Caching Configuration

React Query caches product data with the following strategy:

```javascript
{
  staleTime: 5 * 60 * 1000,        // 5 minutes before marked stale
  cacheTime: 10 * 60 * 1000,       // 10 minutes in cache
  retry: 2,                         // Retry failed queries 2 times
  refetchOnWindowFocus: true        // Refetch when window regains focus
}
```

Manual cache invalidation:
```javascript
const queryClient = useQueryClient();

// Invalidate all products
queryClient.invalidateQueries(['products']);

// Invalidate specific product
queryClient.invalidateQueries(['products', productId]);

// Invalidate featured products
queryClient.invalidateQueries(['products', 'featured']);
```

---

## Complete Integration Checklist

- [ ] API service imported and used in components
- [ ] React Query hooks installed and configured
- [ ] Zod validation schemas applied to forms
- [ ] Error handling for all mutations
- [ ] Loading states displayed
- [ ] Empty states handled
- [ ] Pagination implemented
- [ ] Filters working correctly
- [ ] Search functionality integrated
- [ ] Admin endpoints protected behind auth check
- [ ] Images loading correctly
- [ ] Variants displayed properly
- [ ] Stock status updated in real-time
- [ ] Related products showing correctly
- [ ] Mobile responsive design working
- [ ] Form validation messages clear
- [ ] Token refresh on 401 responses
- [ ] Success/error toasts showing

---

**Status**: ✅ Complete Reference  
**Last Updated**: March 14, 2026  
**API Version**: v1
