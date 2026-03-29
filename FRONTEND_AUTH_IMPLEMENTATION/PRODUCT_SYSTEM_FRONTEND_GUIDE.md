# Product System - Frontend Implementation Guide

## Overview

Complete production-ready frontend implementation for the Spherekings Product Management System. This guide covers the architecture, components, API integration, and usage patterns.

## 📁 Folder Structure

```
src/
├── api/
│   └── services/
│       └── productService.js           # API layer - all backend calls
├── hooks/
│   └── useProducts.js                  # React Query hooks for products
├── components/
│   ├── products/
│   │   ├── ProductCard.jsx             # Product card component
│   │   ├── ProductList.jsx             # Grid/list display
│   │   ├── ProductDetail.jsx           # Product details view
│   │   ├── ProductForm.jsx             # Admin form (create/edit)
│   │   └── ProductVariants.jsx         # Variant management
│   └── ui/
│       ├── Button.jsx                  # Reusable button
│       ├── Input.jsx                   # Reusable input
│       └── Toast.jsx                   # Notifications
├── app/
│   ├── products/
│   │   ├── page.jsx                    # Products listing
│   │   ├── [id]/
│   │   │   └── page.jsx                # Product detail
│   │   └── search/
│   │       └── page.jsx                # Search results
│   └── admin/
│       └── products/
│           ├── page.jsx                # Admin dashboard
│           ├── new/
│           │   └── page.jsx            # Create product
│           └── [id]/
│               └── edit/
│                   └── page.jsx        # Edit product
├── utils/
│   └── productValidation.js            # Zod validation schemas
└── types/
    └── product.ts                      # TypeScript types
```

## 🔌 API Service Layer

### File: `src/api/services/productService.js`

All API calls are centralized in the product service. It provides:

#### Public Functions
```javascript
// Get products with pagination & filtering
getProducts({ page, limit, status, category, sort })

// Get featured products
getFeaturedProducts(limit)

// Search products
searchProducts(query, params)

// Get single product
getProductById(productId)

// Get related products
getRelatedProducts(productId, limit)
```

#### Admin Functions
```javascript
// Create new product
createProduct(productData)

// Update product
updateProduct(productId, productData)

// Delete product (soft delete)
deleteProduct(productId)

// Update stock
updateStock(productId, quantity, operation)
```

### API Endpoints Integration

| Method | Endpoint | Service Function |
|--------|----------|-----------------|
| GET | `/products` | `getProducts()` |
| GET | `/products/featured` | `getFeaturedProducts()` |
| GET | `/products/search` | `searchProducts()` |
| GET | `/products/:id` | `getProductById()` |
| GET | `/products/:id/related` | `getRelatedProducts()` |
| POST | `/admin/products` | `createProduct()` |
| PUT | `/admin/products/:id` | `updateProduct()` |
| DELETE | `/admin/products/:id` | `deleteProduct()` |
| PUT | `/admin/products/:id/stock` | `updateStock()` |

## 🪝 React Query Hooks

### File: `src/hooks/useProducts.js`

Server state management using React Query (@tanstack/react-query).

#### Data Fetching Hooks
```javascript
// Get all products
const { data, isLoading, error } = useProducts(params, options)

// Get featured products
const { data } = useFeaturedProducts(limit, options)

// Search products
const { data } = useSearchProducts(query, params, options)

// Get product details
const { data: product } = useProductDetail(productId, options)

// Get related products
const { data } = useRelatedProducts(productId, limit, options)
```

#### Mutation Hooks
```javascript
// Create product
const { mutateAsync } = useCreateProduct(options)
await mutateAsync(productData)

// Update product
const { mutateAsync } = useUpdateProduct(productId, options)
await mutateAsync(productData)

// Delete product
const { mutateAsync } = useDeleteProduct(options)
await mutateAsync(productId)

// Update stock
const { mutateAsync } = useUpdateStock(productId, options)
await mutateAsync({ quantity, operation })
```

### Hook Usage Example
```javascript
function ProductsPage() {
  const [page, setPage] = useState(1);
  
  // Data fetching
  const { data, isLoading, error } = useProducts({
    page,
    limit: 12,
    status: 'active'
  });

  // Mutations
  const deleteProduct = useDeleteProduct({
    onSuccess: () => console.log('Deleted!'),
    onError: (err) => console.error(err)
  });

  const handleDelete = (id) => {
    deleteProduct.mutate(id);
  };

  return (
    <ProductList
      products={data?.products || []}
      isLoading={isLoading}
    />
  );
}
```

## 🎨 Components

### ProductCard
Reusable card for displaying product information.

**Props:**
```javascript
<ProductCard
  product={product}
  showActions={true}
  onAddToCart={(data) => {}}
  onWishlist={() => {}}
/>
```

**Features:**
- Product image gallery
- Price display
- Stock status
- Featured badge
- Action buttons (Add to cart, Wishlist, View details)
- Variant preview
- Responsive design

### ProductList
Displays multiple products in a grid with filtering and pagination.

**Props:**
```javascript
<ProductList
  products={products}
  isLoading={isLoading}
  error={error}
  pagination={{ page, totalPages }}
  onPageChange={(page) => {}}
  onFilterChange={(filters) => {}}
  showFilters={true}
  canAddToCart={true}
/>
```

**Features:**
- Grid/responsive layout
- Filter by status/sort
- Pagination controls
- Loading state
- Empty state
- Error handling

### ProductDetail
Full product details with image gallery and variants.

**Props:**
```javascript
<ProductDetail
  product={product}
  isLoading={isLoading}
  onAddToCart={(data) => {}}
/>
```

**Features:**
- Image gallery with thumbnails
- Variant selection
- Quantity selector
- Add to cart / Buy now
- Related products section
- Product specifications

### ProductForm
Admin form for creating/editing products.

**Props:**
```javascript
<ProductForm
  product={product}  // null for create, product object for edit
  isLoading={isLoading}
  onSubmit={(data) => {}}
/>
```

**Features:**
- Form validation (Zod)
- Image URL management
- Variant management
- Stock/pricing management
- Category/SKU fields
- Featured flag
- Status selection
- Error display

## ✅ Validation

### File: `src/utils/productValidation.js`

Zod schemas matching backend Joi validation.

**Validation Rules:**
```javascript
// Name: 3-100 characters
name: z.string().min(3).max(100)

// Description: 20-2000 characters
description: z.string().min(20).max(2000)

// Price: minimum 0.01
price: z.number().min(0.01)

// Stock: minimum 0
stock: z.number().int().min(0)

// Images: 1-10 required
images: z.array(z.string().url()).min(1).max(10)

// Variants: optional, with enum values
variants: z.array(z.object({
  name: z.enum(['color', 'edition', 'size', 'material']),
  options: z.array(z.string()).min(1).max(20)
}))

// Status: active | inactive | out_of_stock
status: z.enum(['active', 'inactive', 'out_of_stock'])
```

**Usage:**
```javascript
import { validateProduct, createProductSchema } from '@/utils/productValidation';

const { valid, data, errors } = validateProduct(formData, createProductSchema);
if (!valid) {
  console.log('Validation errors:', errors);
}
```

## 📄 Pages

### Products Listing (`/products`)
- Display all active products
- Pagination (12 per page)
- Filter by status
- Sort options
- Responsive grid

### Product Detail (`/products/[id]`)
- Full product information
- Image gallery
- Variant selection
- Related products
- Add to cart functionality

### Admin Dashboard (`/admin/products`)
- Product management table
- View/Edit/Delete actions
- Create new product button
- Stock status display
- Search/Filter capabilities

### Create Product (`/admin/products/new`)
- Full product form
- Image URL management
- Variant configuration
- Form validation
- Success/error feedback

### Edit Product (`/admin/products/[id]/edit`)
- Prefilled form data
- Update existing products
- Image management
- Change variants/status
- Confirmation handling

### Search Products (`/products/search?q=...`)
- Search by name/description
- Results pagination
- Filter options
- Empty state handling

## 🔄 Data Flow

### Create Product Flow
```
ProductForm
  ↓ (form submit)
validateProduct() [client validation]
  ↓
useCreateProduct()
  ↓ (mutateAsync)
productService.createProduct()
  ↓ (HTTP POST)
Backend API (/admin/products)
  ↓
Success → Invalidate cache → Redirect
Error → Display error toast
```

### Get Products Flow
```
ProductsPage
  ↓
useProducts(params)
  ↓
React Query cache check
  ↓ (if stale/missing)
productService.getProducts()
  ↓ (HTTP GET)
Backend API (/products)
  ↓
Cache result + Return data
```

## 📊 Features Matrix

| Feature | Public | Admin |
|---------|--------|-------|
| Browse products | ✅ | ✅ |
| View product details | ✅ | ✅ |
| Search products | ✅ | ✅ |
| Filter by status | ✅ | ✅ |
| View featured products | ✅ | ✅ |
| View related products | ✅ | ✅ |
| Create product | ❌ | ✅ |
| Edit product | ❌ | ✅ |
| Delete product | ❌ | ✅ |
| Update stock | ❌ | ✅ |
| Manage variants | ❌ | ✅ |
| Upload images | ❌ | ✅ |

## 🚀 Usage Examples

### Example 1: Display Products List
```javascript
'use client';
import { useState } from 'react';
import { useProducts } from '@/hooks/useProducts';
import ProductList from '@/components/products/ProductList';

export default function ProductsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useProducts({ page, limit: 12 });

  return (
    <ProductList
      products={data?.products}
      isLoading={isLoading}
      error={error}
      pagination={data?.pagination}
      onPageChange={setPage}
    />
  );
}
```

### Example 2: Create Product
```javascript
'use client';
import { useCreateProduct } from '@/hooks/useProducts';
import ProductForm from '@/components/products/ProductForm';

export default function CreateProductPage() {
  const { mutateAsync } = useCreateProduct();

  const handleSubmit = async (data) => {
    await mutateAsync(data);
  };

  return <ProductForm onSubmit={handleSubmit} />;
}
```

### Example 3: Search Products
```javascript
'use client';
import { useSearchProducts } from '@/hooks/useProducts';
import { useState } from 'react';

export default function SearchPage({ searchParams }) {
  const query = searchParams.q;
  const { data } = useSearchProducts(query);

  return (
    <ul>
      {data?.products.map(p => (
        <li key={p._id}>{p.name}</li>
      ))}
    </ul>
  );
}
```

## 🔐 Authentication & Authorization

All admin endpoints require:
1. Valid JWT token (from authentication system)
2. Admin role verification
3. Automatic token refresh via axios interceptor

Protected routes automatically:
- Redirect unauthenticated users to login
- Show error for non-admin users
- Handle token expiration

## 🎯 Error Handling

### API Errors
```javascript
{
  status: 400,
  message: "Validation failed",
  errors: {
    name: "Name must be at least 3 characters",
    price: "Price must be greater than 0"
  }
}
```

### Client Handling
```javascript
const createProduct = useCreateProduct({
  onError: (error) => {
    // Error message is extracted and displayed
    console.error(error.message);
    showToast(error.message, 'error');
  }
});
```

## 📱 Responsive Design

All components are fully responsive:
- Mobile: Single column layout
- Tablet: 2-column grid
- Desktop: 4-column grid or full width

## 🎨 Styling

- **Framework**: Styled Components
- **Animation**: Framer Motion
- **Icons**: Lucide Icons
- **Design System**: Consistent spacing, colors, typography

## 🔄 Caching Strategy

React Query cache configuration:
- **Stale Time**: 5-10 minutes (depends on endpoint)
- **Cache Time**: 10-15 minutes
- **Automatic Invalidation**: On mutations
- **Manual Invalidation**: Available via hook utilities

## 📚 Dependencies

```json
{
  "@tanstack/react-query": "^5.28.0",
  "react-hook-form": "^7.48.0",
  "@hookform/resolvers": "^3.3.4",
  "zod": "^3.22.4",
  "styled-components": "^6.1.0",
  "framer-motion": "^10.16.0",
  "axios": "^1.6.0",
  "lucide-react": "^0.292.0"
}
```

## ✨ Next Steps

1. **Cart Integration**: Connect Add to Cart with cart system
2. **Checkout**: Integrate product selection with checkout
3. **Wishlist**: Add wishlist functionality
4. **Reviews**: Add product reviews/ratings
5. **Inventory Alerts**: Notify on low stock
6. **Analytics**: Track product views/clicks
7. **Recommendations**: Show personalized recommendations

## 📞 Support

For issues or questions:
1. Check error messages in DevTools console
2. Verify backend API is running
3. Check authentication status
4. Validate form data against schema
5. Review API response structure

---

**Status**: ✅ Production Ready  
**Last Updated**: March 14, 2026  
**Version**: 1.0.0
