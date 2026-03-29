# Shopping Cart System - Complete Integration Guide

## 📋 Overview

This guide covers how to use the complete production-ready Cart system in your Spherekings e-commerce application.

## 🗂️ Architecture

### Folder Structure

```
src/
├── api/
│   └── services/
│       └── cartService.js          # Cart API calls
├── stores/
│   └── cartStore.js                # Zustand cart state
├── hooks/
│   └── useCart.js                  # Cart custom hooks
├── components/
│   ├── cart/
│   │   ├── CartPage.jsx            # Main cart page
│   │   ├── CartItemCard.jsx        # Individual cart item
│   │   ├── CartSummaryPanel.jsx    # Cart totals
│   │   ├── CartEmptyState.jsx      # Empty cart UI
│   │   ├── CartLoader.jsx          # Loading skeleton
│   │   ├── CartErrorState.jsx      # Error display
│   │   ├── AddToCartButton.jsx     # Add to cart button
│   │   └── CartBadge.jsx           # Header cart icon
└── app/
    └── cart/
        └── page.jsx                 # Cart page route
```

## 🔗 API Endpoints

All endpoints are relative to `/api/v1/cart`:

| Operation | Endpoint | Method | Description |
|-----------|----------|--------|-------------|
| Get Cart | `/cart` | GET | Fetch user's cart with items |
| Add to Cart | `/cart/add` | POST | Add product or increase quantity |
| Update Item | `/cart/update` | POST | Update quantity or variant |
| Remove Item | `/cart/remove` | POST | Remove item from cart |
| Clear Cart | `/cart/clear` | POST | Clear all items |
| Summary | `/cart/summary` | GET | Get lightweight totals |
| Validate | `/cart/validate` | POST | Validate cart before checkout |

## 💻 Usage Examples

### 1. Using Cart in Product Page

```javascript
'use client';

import AddToCartButton from '@/components/cart/AddToCartButton';
import { useProductQuantityInCart } from '@/hooks/useCart';

export default function ProductDetailPage() {
  const product = {
    _id: '123abc',
    name: 'Awesome Product',
    price: 99.99,
    stock: 50,
  };

  const quantityInCart = useProductQuantityInCart(product._id);

  return (
    <div>
      <h1>{product.name}</h1>
      <p>Price: ${product.price}</p>
      <p>In cart: {quantityInCart} items</p>

      <AddToCartButton
        productId={product._id}
        quantity={1}
        stock={product.stock}
        onAddSuccess={() => {
          console.log('Added to cart!');
        }}
      />
    </div>
  );
}
```

### 2. Using Cart in Header

```javascript
'use client';

import CartBadge from '@/components/cart/CartBadge';

export default function Header() {
  return (
    <header>
      <nav>
        <a href="/products">Products</a>
        <CartBadge /> {/* Shows cart count */}
      </nav>
    </header>
  );
}
```

### 3. Manual Cart Operations

```javascript
'use client';

import { useCart } from '@/hooks/useCart';
import { useEffect } from 'react';

export default function MyComponent() {
  const {
    items,
    summary,
    loading,
    error,
    addToCart,
    removeFromCart,
    updateCartItem,
    clearCart,
    validateCart,
  } = useCart();

  // Fetch cart on mount
  useEffect(() => {
    // Cart is automatically fetched by the page using fetchCart()
  }, []);

  // Add product
  const handleAdd = async () => {
    try {
      await addToCart('productId123', 2, { color: 'red' });
      console.log('Added to cart');
    } catch (error) {
      console.error('Failed:', error.message);
    }
  };

  // Update item quantity
  const handleUpdate = async (cartItemId) => {
    try {
      await updateCartItem(cartItemId, { quantity: 5 });
    } catch (error) {
      console.error('Failed:', error.message);
    }
  };

  // Remove item
  const handleRemove = async (cartItemId) => {
    try {
      await removeFromCart(cartItemId);
    } catch (error) {
      console.error('Failed:', error.message);
    }
  };

  // Validate cart
  const handleValidate = async () => {
    try {
      const result = await validateCart();
      if (result.valid) {
        console.log('Cart is valid, proceed to checkout');
      } else {
        console.log('Issues found:', result.issues);
      }
    } catch (error) {
      console.error('Validation failed:', error.message);
    }
  };

  return (
    <div>
      <p>Items in cart: {items.length}</p>
      <p>Total: ${summary.total}</p>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
```

### 4. Using Specific Hooks

```javascript
'use client';

import {
  useCartItems,
  useCartSummary,
  useCartLoading,
  useCartError,
  useAddToCart,
  useRemoveFromCart,
  useValidateCart,
} from '@/hooks/useCart';

export default function CartInfo() {
  const items = useCartItems();
  const summary = useCartSummary();
  const loading = useCartLoading();
  const error = useCartError();
  const { addToCart } = useAddToCart();
  const { removeFromCart } = useRemoveFromCart();
  const { validateCart, validationIssues } = useValidateCart();

  return (
    <div>
      <h2>Cart</h2>
      <p>Items: {items.length}</p>
      <p>Total: ${summary.total}</p>
      {loading.addingToCart && <p>Adding...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {validationIssues && <p>Issues found during validation</p>}
    </div>
  );
}
```

## 📊 Store Selectors

```javascript
// Import selectors
import {
  selectCartItems,
  selectCartSummary,
  selectCartLoading,
  selectCartError,
  selectValidationIssues,
  selectCartIsEmpty,
  selectItemCount,
  selectCartTotal,
} from '@/stores/cartStore';

// Use in components
const items = useCartStore(selectCartItems);
const total = useCartStore(selectCartTotal);
const isEmpty = useCartStore(selectCartIsEmpty);
```

## 🔄 Data Structures

### Cart Item Object

```javascript
{
  _id: "cart-item-id",
  productId: {
    _id: "product-id",
    name: "Product Name",
    price: 99.99,
    images: ["url1", "url2"],
    stock: 50,
    category: "Electronics",
    sku: "SKU-123"
  },
  quantity: 2,
  price: 99.99,
  variant: {
    color: "red",
    size: "M"
  }
}
```

### Cart Summary Object

```javascript
{
  itemCount: 3,           // Number of different products
  totalItems: 5,          // Total quantity of all items
  subtotal: 299.97,       // Before tax
  tax: 29.99,             // Tax amount
  total: 329.96           // Final total
}
```

### Validation Result

```javascript
{
  valid: true,
  cart: { items: [...], summary: {...} },
  issues: [
    {
      itemId: "cart-item-id",
      productId: "product-id",
      issue: "Only 2 units available (requested 5)"
    },
    {
      itemId: "cart-item-id",
      issue: "price_updated",
      oldPrice: 99.99,
      newPrice: 89.99
    }
  ]
}
```

## ⚙️ Cart Store Actions

### Available Actions

```javascript
const store = useCartStore();

// Fetch operations
await store.fetchCart();
await store.validateCart();

// Item operations
await store.addToCart(productId, quantity, variant);
await store.updateCartItem(cartItemId, { quantity, variant });
await store.removeFromCart(cartItemId);
await store.clearCart();

// State utilities
store.optimisticUpdateItem(cartItemId, updates);
store.getItemCount();
store.getCartItem(cartItemId);
store.isProductInCart(productId);
store.getProductQuantity(productId);

// Error handling
store.clearError();
store.clearValidationIssues();
```

## 🎨 Customizing Components

### Customize CartItemCard

```javascript
<CartItemCard 
  item={cartItem}
  isLoading={false}
  // Add custom props as needed
/>
```

### Customize CartSummaryPanel

```javascript
<CartSummaryPanel
  summary={cartSummary}
  isValidating={false}
  validationIssues={null}
  onCheckout={() => router.push('/checkout')}
  onContinueShopping={() => router.push('/products')}
  onPromoCode={() => console.log('Apply promo')}
/>
```

## 🔐 Authentication

All cart requests automatically include JWT tokens via the axios interceptor:

```javascript
// Automatically added to every request
Authorization: Bearer <jwt_token>
```

The token is managed by the `TokenManager` utility and automatically refreshed when needed.

## 📱 Mobile Responsiveness

All components are fully responsive:

- Cart page optimized for mobile
- Touch-friendly buttons and controls
- Stacked layout on small screens
- Optimized typography for readability

## ⚡ Performance Optimization

### Zustand Shallow Comparison

```javascript
// Only re-render when items array reference changes
const items = useCartStore(useShallow(state => state.items));
```

### Memoized Selectors

```javascript
const itemCount = useCartStore(state => state.getItemCount());
// Only re-renders when itemCount changes
```

### Debounced Updates

Consider debouncing quantity changes for better UX:

```javascript
import debounce from 'lodash/debounce';

const debouncedUpdate = debounce(
  (cartItemId, updates) => updateCartItem(cartItemId, updates),
  500
);
```

## 🐛 Debugging

### Enable Zustand DevTools

The store is configured with devtools middleware:

```javascript
// In browser, if Redux DevTools installed
// You can inspect and time-travel cart state
```

### Console Logging

All cart operations log to console:

```javascript
📤 GET Cart
✅ GET Cart Success
❌ Get cart error
📤 Add to Cart
✅ Add to Cart Success
```

## 🚀 Deployment Checklist

- [ ] All cart endpoints configured with correct base URL
- [ ] JWT tokens properly stored and managed
- [ ] Axios client interceptor configured
- [ ] Error boundaries added around cart components
- [ ] Loading states properly handled
- [ ] Mobile responsive design tested
- [ ] Cart persistence considered (optional)
- [ ] Tax calculation verified
- [ ] Validation logic working correctly
- [ ] Error messages user-friendly

## 🔗 Related Documentation

- [Backend Cart API Routes](../backend/cartRoutes.md)
- [Product Integration](./product-integration.md)
- [Checkout Integration](./checkout-integration.md)
- [Authentication System](./auth-system.md)

## 📞 Support

For issues or questions about the cart system, refer to:

1. Console logs - All operations are logged
2. Error messages - User-friendly feedback provided
3. Validation results - Detailed issues returned
4. Store state - Can be inspected with Redux DevTools

---

**Last Updated**: March 14, 2026  
**Version**: 1.0.0  
**Status**: Production Ready
