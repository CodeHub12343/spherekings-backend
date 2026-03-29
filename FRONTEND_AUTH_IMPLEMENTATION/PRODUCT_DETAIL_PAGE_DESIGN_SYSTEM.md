# Product Detail Page Design System & Architecture Analysis
## Spherekings Marketplace - /products/[id]

**Date**: March 16, 2026  
**Status**: Architecture Recommendation Document  
**Framework**: Next.js 16 (App Router) + React 19 + styled-components

---

## 📊 Executive Summary

This document provides a comprehensive design system architecture for the `/products/[id]` product detail page based on the Spherekings Marketplace backend Product model and current frontend implementation. The recommendations follow mobile-first responsive design principles while maintaining scalability for enterprise e-commerce operations.

---

## 🔍 Part 1: Product Model Analysis

### A. Available Data Fields Mapped to UI Components

#### Core Product Information
| Backend Field | Type | UI Component | Display Priority | Notes |
|---|---|---|---|---|
| `name` | String | `ProductTitle` | Critical | Main headline, SEO-optimized |
| `description` | String | `ProductDescription` | High | Full detailed content section |
| `price` | Number | `PriceDisplay` | Critical | Large, prominent display |
| `category` | String | `CategoryBadge` | Medium | Breadcrumb + header |
| `sku` | String | `ProductMeta` | Low | Small text below title |

#### Visual Content
| Backend Field | Type | UI Component | Display Priority | Notes |
|---|---|---|---|---|
| `images` | Array[String] | `ProductImageGallery` | Critical | Main + thumbnails |
| — | — | `MobileProductCarousel` | Critical | Swipeable on mobile |
| — | — | `ImageZoom` | Medium | Desktop hover zoom |

#### Product Options & Variants
| Backend Field | Type | UI Component | Display Priority | Notes |
|---|---|---|---|---|
| `variants` | Array | `VariantSelector` | High | Color/Size/Edition selector |
| `variant.name` | Enum | `VariantLabel` | High | "Color", "Size", etc. |
| `variant.options` | Array[String] | `VariantOptionButton` | High | Individual option selections |

#### Availability & Status
| Backend Field | Type | UI Component | Display Priority | Notes |
|---|---|---|---|---|
| `stock` | Number | `StockIndicator` | Critical | Shows quantity or "Out of Stock" |
| `status` | Enum | `StatusBadge` | High | Active/Inactive/Out of Stock |
| — | — | `AddToCartButton` | Critical | Disabled when out of stock |

#### Administrative Fields
| Backend Field | Type | UI Component | Display Priority | Notes |
|---|---|---|---|---|
| `isFeatured` | Boolean | `FeaturedBadge` | Low | Visual indicator if featured |
| `createdAt` | Date | — | None | For SEO/structured data only |
| `updatedAt` | Date | — | None | For freshness indicators (rare) |

---

## 🎨 Part 2: Recommended Layout Architecture

### 2.1 Desktop Layout (≥ 1024px)

```
┌─────────────────────────────────────────────────────┐
│ Breadcrumb: Products > Category > Product Name      │
├─────────────────────────────────────────────────────┤
│                                                       │
│  ┌──────────────────────┐  ┌───────────────────┐    │
│  │                      │  │  Category          │    │
│  │   Image Gallery      │  │  ⭐ Product Title  │    │
│  │  (Main + Zoom)       │  │  SKU: ABC123       │    │
│  │                      │  │  ❤️  Share  🔗      │    │
│  ├──────────────────────┤  ├───────────────────┤    │
│  │ Thumbnail Grid       │  │ $99.99             │    │
│  │ [img] [img] [img]    │  │ ⭐⭐⭐⭐⭐ (124)        │    │
│  │ [img] [img] [img]    │  │                    │    │
│  └──────────────────────┘  │ In Stock ✓ (45/50)│    │
│                              │                    │    │
│                              ├───────────────────┤    │
│                              │ Variant Selector   │    │
│                              │ Color: [Red] [...] │    │
│                              │ Size: [S] [M] [L]  │    │
│                              ├───────────────────┤    │
│                              │ Qty: [-] 1 [+]     │    │
│                              ├───────────────────┤    │
│                              │ [Add to Cart]      │    │
│                              │ [Buy Now]          │    │
│                              └───────────────────┘    │
│                                                       │
├─────────────────────────────────────────────────────┤
│ Description Section                                  │
│ Lorem ipsum dolor sit amet...                        │
├─────────────────────────────────────────────────────┤
│ Specifications Table                                │
│ Weight: 250g | Dimensions: 10x10x10cm              │
├─────────────────────────────────────────────────────┤
│ Related Products                                     │
│ [Product Card] [Product Card] [Product Card]        │
└─────────────────────────────────────────────────────┘
```

### 2.2 Tablet Layout (768px - 1023px)

```
┌──────────────────────────────────────┐
│ Breadcrumb                          │
├──────────────────────────────────────┤
│
│ Image Gallery (Full Width)
│ [Large Image]
│ [Thumbnail Grid]
│
├──────────────────────────────────────┤
│ Product Info Panel (Full Width)     │
│ Title, Price, Rating               │
│ Status, Stock Info                 │
│ Variant Selector                   │
│ Quantity, Buttons                  │
│
├──────────────────────────────────────┤
│ Description
│ Specifications
│ Related Products
└──────────────────────────────────────┘
```

### 2.3 Mobile Layout (≤ 767px)

```
┌──────────────────────┐
│ ← Products           │  ← Sticky Header
├──────────────────────┤
│                      │
│  Swipeable Image     │
│  Carousel            │
│  [Main Image]        │
│                      │
│  ← → (swipe: 1/4)    │  ← Indicator
│
├──────────────────────┤
│ Category Badge       │
│ Product Title        │
│ SKU, Share Icons     │
├──────────────────────┤
│ $ Price              │  ← Large
│ ⭐ Rating            │
│ ✓ In Stock (45/50)   │
├──────────────────────┤
│ Color: [Red] [...]   │
│ Size: [S] [M] [L]    │
├──────────────────────┤
│ Description          │
│ Specifications       │
├──────────────────────┤
│ Related Products     │
│ (Horizontal scroll)  │
│                      │
├══════════════════════┤  ← Sticky Bottom
│ [+ Add to Cart]      │
│ [Buy Now]            │
└──────────────────────┘
```

---

## 🧩 Part 3: Component Architecture

### 3.1 Component Tree Structure

```
ProductDetailPage (/products/[id]/page.jsx)
├── BreadcrumbNav
├── ProductDetailContainer
│   ├── ProductImageSection
│   │   ├── ProductImageGallery (Desktop)
│   │   │   ├── MainImage
│   │   │   └── ThumbnailGrid
│   │   │       └── Thumbnail[] (clickable)
│   │   │
│   │   └── MobileProductCarousel (Mobile)
│   │       ├── SwipeableImageContainer
│   │       └── ImageIndicator
│   │
│   └── ProductInfoSection
│       ├── ProductHeader
│       │   ├── CategoryBadge
│       │   ├── ProductTitle
│       │   ├── SKUDisplay
│       │   └── ActionButtons (Heart, Share)
│       │
│       ├── PriceSection
│       │   ├── PriceDisplay
│       │   └── RatingDisplay
│       │
│       ├── StockIndicator
│       │ 
│       ├── VariantSelector
│       │   ├── VariantGroup[] (one per variant type)
│       │   │   ├── VariantLabel
│       │   │   └── VariantOptionButtons[]
│       │
│       ├── QuantitySelector
│       │   ├── DecreaseButton
│       │   ├── QuantityInput
│       │   └── IncreaseButton
│       │
│       ├── ProductActions
│       │   ├── AddToCartButton
│       │   └── BuyNowButton
│       │
│       └── ProductMetaGrid (Desktop Only)
│           └── DetailItem[] (Weight, Dimensions, etc.)
│
├── ProductDescription
│
├── ProductSpecifications
│
├── RelatedProducts
│   └── ProductCard[] (Carousel on mobile, grid on desktop)
│
└── MobileStickyCartBar (Mobile Only)
    ├── Price (sticky recap)
    └── [Add to Cart] (always accessible)
```

### 3.2 Core Components Design

#### **ProductImageGallery** (Desktop)
- **Purpose**: Display main product image with zoom + thumbnail navigation
- **Props**: `images`, `onImageSelect`, `activeIndex`
- **Features**:
  - Hover zoom effect on main image
  - Click thumbnail to change main image
  - Keyboard navigation (arrow keys)
  - Lazy-loaded images
  - Responsive grid for thumbnails

```jsx
<ProductImageGallery
  images={product.images}
  activeIndex={selectedImage}
  onImageSelect={setSelectedImage}
/>
```

#### **MobileProductCarousel** (Mobile)
- **Purpose**: Swipeable image carousel for mobile
- **Props**: `images`, `onImageChange`
- **Features**:
  - Touch-based swiping (left/right)
  - Image counter (1/4)
  - Smooth transitions
  - Indicator dots
  - Preload next image for performance

```jsx
<MobileProductCarousel
  images={product.images}
/>
```

#### **VariantSelector**
- **Purpose**: Allow user to select product options (color, size, etc.)
- **Props**: `variants`, `selectedVariants`, `onVariantChange`
- **Features**:
  - Dynamic rendering based on variant types
  - Visual feedback for selected options
  - Validation (prevent invalid combinations)
  - Touch-friendly button sizes

```jsx
<VariantSelector
  variants={product.variants}
  selectedVariants={selectedVariants}
  onVariantChange={setSelectedVariants}
/>
```

#### **StockIndicator**
- **Purpose**: Display inventory status and availability
- **Props**: `stock`, `status`
- **Features**:
  - Color-coded status (Green: In Stock, Red: Out of Stock)
  - Show exact quantity or estimated availability
  - Auto-disable Add to Cart when out of stock

```jsx
<StockIndicator
  stock={product.stock}
  status={product.status}
/>
```

#### **PriceDisplay**
- **Purpose**: Show product price with optional discounts/savings
- **Props**: `price`, `originalPrice`, `currency`
- **Features**:
  - Large, readable font size
  - Optional discount badge
  - Strikethrough original price if on sale

```jsx
<PriceDisplay
  price={product.price}
  currency="$"
/>
```

#### **MobileStickyCartBar** (Mobile Only)
- **Purpose**: Keep Add to Cart action always accessible on mobile
- **Props**: `price`, `isOutOfStock`, `onAddToCart`
- **Features**:
  - Sticky position at bottom
  - Safe area for notch/home indicator
  - Quick add to cart with quantity inline

```jsx
<MobileStickyCartBar
  price={product.price}
  isOutOfStock={isOutOfStock}
  onAddToCart={handleAddToCart}
/>
```

---

## 📱 Part 4: Mobile Optimization Strategy

### 4.1 Touch-First Design Principles

| Principle | Implementation |
|-----------|-----------------|
| **Button Size** | Minimum 48x48px (WCAG standard) |
| **Touch Target Spacing** | Minimum 8px gap between targets |
| **Scrollable Sections** | Horizontal scroll for related products |
| **Text Size** | Minimum 16px for readability |
| **Images** | Responsive with optimal aspect ratios |

### 4.2 Mobile Performance Optimizations

```javascript
// Image Optimization
✓ Use Next.js Image component with priority loading
✓ Serve multiple sizes with srcSet
✓ Lazy-load below-fold images
✓ Use WebP format as primary with fallbacks

// Code Splitting
✓ Lazy load ProductImageGallery (Desktop) on demand
✓ Lazy load RelatedProducts section
✓ Inline critical CSS for above-fold content

// Bundle Size
✓ Tree-shake unused styled-components
✓ Defer non-critical features (wishlist, sharing)
✓ Use dynamic imports for heavy libraries
```

### 4.3 Mobile Breakpoints Strategy

```scss
// Mobile-First Approach
$mobile: 0px;        // Base (320px+)
$small: 480px;       // Large phones
$tablet: 640px;      // Tablets
$medium: 768px;      // iPad
$large: 1024px;      // Desktops
$desktop: 1280px;    // Large desktops
$xlarge: 1536px;     // Ultra-wide

// Usage
@media (min-width: $tablet) {
  // 2-column layout
}

@media (min-width: $large) {
  // Full 2-column grid layout
}
```

### 4.4 Mobile Gesture Interactions

| Gesture | Action | Component |
|---------|--------|-----------|
| **Swipe Left/Right** | Change product image | MobileProductCarousel |
| **Tap** | Select variant option | VariantSelector |
| **Long Touch** | Show product preview | ProductImageGallery |
| **Scroll Down** | Reveal sticky cart bar | MobileStickyCartBar |
| **Double Tap** | Zoom product image | MobileProductCarousel |

---

## 🎯 Part 5: Current Implementation Assessment

### 5.1 ✅ Already Implemented

- [x] Basic 2-column desktop layout
- [x] ProductImageGallery with thumbnail navigation
- [x] VariantSelector with dynamic rendering
- [x] PriceDisplay with styling
- [x] StockIndicator badge
- [x] QuantitySelector with +/- buttons
- [x] AddToCart and BuyNow buttons
- [x] ProductDescription section
- [x] DetailsGrid for meta information
- [x] Related products section (ProductList)
- [x] Mobile responsive styling

### 5.2 🔄 Partially Implemented

- [ ] MobileProductCarousel (basic thumbnails exist, no swipe)
- [ ] Image zoom on hover (desktop)
- [ ] Loading skeleton states
- [ ] Error handling & fallbacks
- [ ] MobileStickyCartBar (needs implementation)
- [ ] Product specifications formatted table

### 5.3 ❌ Not Yet Implemented

- [ ] Wishlist/favorite functionality
- [ ] Social sharing integration
- [ ] Product reviews & ratings display
- [ ] Size guide modal
- [ ] Customer questions & answers section
- [ ] Similar/recommended products algorithm
- [ ] Product comparison feature
- [ ] Breadcrumb navigation component
- [ ] Image preloading strategy

---

## 🏗️ Part 6: Enhanced Architecture Recommendations

### 6.1 Mobile Sticky Cart Bar Implementation

**Why**: On mobile, users must scroll through entire product page to reach the Add to Cart button at the bottom. A sticky bar keeps this critical action always visible.

```jsx
// components/products/MobileStickyCartBar.jsx
'use client';

import styled from 'styled-components';
import Button from '@/components/ui/Button';

const StickyBar = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: none;
  gap: 12px;
  padding: 12px;
  background: white;
  border-top: 1px solid #e5e7eb;
  z-index: 40;
  
  /* Safe area for notch devices */
  padding-bottom: max(12px, env(safe-area-inset-bottom));

  @media (max-width: 768px) {
    display: flex;
    align-items: center;
  }
`;

const PriceDisplay = styled.div`
  flex: 0 0 auto;
  font-weight: 700;
  font-size: 18px;
  color: #1f2937;
`;

const AddButton = styled.button`
  flex: 1;
  padding: 12px 16px;
  background: linear-gradient(135deg, #5b4dff 0%, #4c3fcc 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:active {
    transform: scale(0.98);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export default function MobileStickyCartBar({
  price,
  isOutOfStock,
  onAddToCart,
}) {
  return (
    <StickyBar>
      <PriceDisplay>${price.toFixed(2)}</PriceDisplay>
      <AddButton
        disabled={isOutOfStock}
        onClick={onAddToCart}
      >
        {isOutOfStock ? 'Out of Stock' : '+ Add to Cart'}
      </AddButton>
    </StickyBar>
  );
}
```

### 6.2 Enhanced Image Gallery with Zoom (Desktop)

```jsx
// components/products/ImageZoomGallery.jsx
'use client';

import styled from 'styled-components';
import Image from 'next/image';
import { useState } from 'react';

const ZoomContainer = styled.div`
  position: relative;
  overflow: hidden;
  aspect-ratio: 1;
`;

const ZoomImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  cursor: zoom-in;
  transition: transform 0.2s ease;
  transform: scale(${props => props.scale});
  transform-origin: ${props => props.originX}% ${props => props.originY}%;

  @media (max-width: 768px) {
    cursor: auto;
  }
`;

export default function ImageZoomGallery({ image }) {
  const [scale, setScale] = useState(1);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setOrigin({ x, y });
    setScale(1.5);
  };

  const handleMouseLeave = () => {
    setScale(1);
  };

  return (
    <ZoomContainer
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <ZoomImage
        src={image}
        alt="Product zoom"
        scale={scale}
        originX={origin.x}
        originY={origin.y}
      />
    </ZoomContainer>
  );
}
```

### 6.3 Swipeable Mobile Carousel

```jsx
// components/products/SwipeableImageCarousel.jsx
'use client';

import styled from 'styled-components';
import Image from 'next/image';
import { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const CarouselContainer = styled.div`
  position: relative;
  overflow: hidden;
  aspect-ratio: 1;
  background: #f3f4f6;
  border-radius: 12px;
`;

const CarouselTrack = styled.div`
  display: flex;
  height: 100%;
  transition: transform 0.3s ease;
  transform: translateX(${props => props.offset}%);
`;

const CarouselSlide = styled.div`
  flex: 0 0 100%;
  position: relative;
  width: 100%;
  height: 100%;
`;

const ImageIndicator = styled.div`
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  z-index: 10;
`;

const NavButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  ${props => (props.direction === 'left' ? 'left: 12px' : 'right: 12px')}
  background: rgba(255, 255, 255, 0.9);
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  z-index: 20;

  &:hover {
    background: white;
    transform: translateY(-50%) scale(1.1);
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

export default function SwipeableImageCarousel({ images = [] }) {
  const [current, setCurrent] = useState(0);
  const trackRef = useRef(null);
  const [touchStart, setTouchStart] = useState(null);

  const handleNext = () => {
    setCurrent((prev) => (prev + 1) % images.length);
  };

  const handlePrev = () => {
    setCurrent((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (!touchStart) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
  };

  return (
    <CarouselContainer
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <CarouselTrack
        ref={trackRef}
        offset={-current * 100}
      >
        {images.map((image, index) => (
          <CarouselSlide key={index}>
            <Image
              src={image}
              alt={`Product ${index + 1}`}
              fill
              style={{ objectFit: 'cover' }}
            />
          </CarouselSlide>
        ))}
      </CarouselTrack>

      <ImageIndicator>
        {current + 1} / {images.length}
      </ImageIndicator>

      <NavButton direction="left" onClick={handlePrev}>
        <ChevronLeft size={20} />
      </NavButton>
      <NavButton direction="right" onClick={handleNext}>
        <ChevronRight size={20} />
      </NavButton>
    </CarouselContainer>
  );
}
```

### 6.4 Product Specifications Table

```jsx
// components/products/ProductSpecifications.jsx
'use client';

import styled from 'styled-components';

const SpecsContainer = styled.div`
  padding: 24px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  margin-top: 16px;
`;

const SpecTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 16px;

  @media (max-width: 640px) {
    font-size: 16px;
  }
`;

const SpecsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const SpecItem = styled.div`
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;

  .label {
    font-size: 12px;
    color: #6b7280;
    text-transform: uppercase;
    font-weight: 600;
    margin-bottom: 4px;
  }

  .value {
    font-size: 16px;
    color: #1f2937;
    font-weight: 500;
  }
`;

export default function ProductSpecifications({ product }) {
  const specs = [
    { label: 'SKU', value: product.sku },
    { label: 'Category', value: product.category },
    { label: 'Status', value: product.status },
    { label: 'In Stock', value: `${product.stock} units` },
  ];

  return (
    <SpecsContainer>
      <SpecTitle>Product Specifications</SpecTitle>
      <SpecsGrid>
        {specs.map((spec, idx) => (
          <SpecItem key={idx}>
            <div className="label">{spec.label}</div>
            <div className="value">{spec.value}</div>
          </SpecItem>
        ))}
      </SpecsGrid>
    </SpecsContainer>
  );
}
```

---

## 📐 Part 7: Responsive Breakpoint Strategy

### Desktop (≥ 1024px)
- **Layout**: 2-column grid (image left, info right)
- **Gallery**: Main image with hover zoom + clickable thumbnails
- **Related**: Grid layout (3-4 columns)

### Tablet (768px - 1023px)
- **Layout**: Single column, full width
- **Gallery**: Full-width image carousel
- **Related**: 2-3 column grid

### Mobile (≤ 767px)
- **Layout**: Single column, optimized padding
- **Gallery**: Swipeable carousel with touch controls
- **Sticky Cart**: Bottom fixed bar for Add to Cart
- **Related**: Horizontal scrolling carousel
- **Spacing**: 16-20px horizontal padding

---

## 🚀 Part 8: Performance Optimization Checklist

### Image Optimization
- [ ] Use Next.js `Image` component with `priority` for main product image
- [ ] Implement responsive image sizes with `sizes` attribute
- [ ] Lazy-load thumbnail and below-fold images
- [ ] Use WebP format with fallbacks to JPEG/PNG
- [ ] Compress all images to <100KB per image

### Code Optimization
- [ ] Split ProductImageGallery into separate chunk (desktop-only)
- [ ] Lazy-load RelatedProducts section
- [ ] Use dynamic imports for heavy features (zoom, animations)
- [ ] Tree-shake unused styled-components utilities
- [ ] Implement image preloading for next image on carousel

### Bundle Size
- [ ] Target: <250KB for above-fold JS
- [ ] Monitor Lighthouse performance scores
- [ ] Use Chrome DevTools Coverage tab to identify unused code

### Core Web Vitals Targets
- [ ] **LCP**: <2.5s (Largest Contentful Paint)
- [ ] **FID**: <100ms (First Input Delay)
- [ ] **CLS**: <0.1 (Cumulative Layout Shift)

---

## 💾 Part 9: State Management Pattern

### Local State (useState)
```javascript
// Image gallery state
const [selectedImage, setSelectedImage] = useState(0);

// Variant selection
const [selectedVariants, setSelectedVariants] = useState({});

// Quantity 
const [quantity, setQuantity] = useState(1);

// Mobile carousel
const [carouselIndex, setCarouselIndex] = useState(0);
```

### Component Props (Shallow Drilling)
- Pass only necessary props to child components
- Use prop destructuring for clarity
- Document props with JSDoc comments

### Zustand Store (Optional - for Cart/Wishlist)
```javascript
// If implementing wishlist feature:
const { isFavorited, toggleFavorite } = useWishlistStore();
```

---

## ✨ Part 10: Accessibility (A11Y) Considerations

| Feature | Implementation |
|---------|---|
| **Semantic HTML** | Use `<button>`, `<img>`, `<h1-h6>` correctly |
| **ARIA Labels** | Add `aria-label` for icon buttons |
| **Keyboard Navigation** | Tab through all interactive elements |
| **Color Contrast** | Maintain WCAG AA standard (4.5:1 for text) |
| **Image Alt Text** | Descriptive alt text for all product images |
| **Focus Indicators** | Visible focus rings on buttons/inputs |
| **Form Labels** | Associated labels for quantity input |

### Example Implementation
```jsx
<button
  aria-label="Decrease quantity"
  onClick={() => setQuantity(Math.max(1, quantity - 1))}
>
  −
</button>
```

---

## 📋 Part 11: Implementation Roadmap

### Phase 1: Core Optimization (Week 1)
- [ ] Implement MobileProductCarousel with swipe support
- [ ] Add MobileStickyCartBar for mobile
- [ ] Improve image loading strategy
- [ ] Add loading skeleton states

### Phase 2: Enhanced UX (Week 2)
- [ ] Add image zoom functionality for desktop
- [ ] Implement ProductSpecifications table
- [ ] Add breadcrumb navigation
- [ ] Enhance VariantSelector with visuals (color swatches)

### Phase 3: Advanced Features (Week 3)
- [ ] Wishlist integration
- [ ] Social sharing buttons
- [ ] Product reviews section
- [ ] Size guide modal

### Phase 4: Performance & Testing (Week 4)
- [ ] Lighthouse optimization
- [ ] Cross-browser testing
- [ ] Mobile device testing
- [ ] A/B testing of layout variations

---

## 🎓 Part 12: Best Practices Summary

### Do's ✅
- Use mobile-first responsive design approach
- Implement lazy-loading for images and components
- Test thoroughly on real mobile devices
- Use semantic HTML and accessibility features
- Keep variant selector intuitive and visual
- Make Add to Cart action prominent and always accessible
- Provide clear stock/availability information
- Use animations sparingly for performance

### Don'ts ❌
- Don't force horizontal scrolling
- Don't hide critical actions behind multiple clicks
- Don't auto-play videos or animations
- Don't use ambiguous copy (avoid "Click here")
- Don't forget about users with slow internet
- Don't rely on hover-only interactions on mobile
- Don't use low-contrast text
- Don't forget safe areas on notch devices

---

## 🔗 Reference Implementation

### File Structure
```
src/components/products/
├── ProductDetail.jsx                 # Main component (exists)
├── ProductImageGallery.jsx           # Desktop gallery (exists)
├── ImageZoomGallery.jsx              # NEW - Zoom functionality
├── SwipeableImageCarousel.jsx        # NEW - Mobile carousel
├── VariantSelector.jsx               # Variant selector (exists)
├── StockIndicator.jsx                # Stock badge (exists)
├── PriceDisplay.jsx                  # Price display (exists)
├── MobileStickyCartBar.jsx           # NEW - Mobile cart bar
├── ProductSpecifications.jsx         # NEW - Specs table
└── ProductList.jsx                   # Related products (exists)

src/app/(app)/products/[id]/
└── page.jsx                          # Main page (exists)
```

---

## 📞 Support & Questions

For questions about this design system:
1. Review the component examples in this document
2. Check the current ProductDetail.jsx implementation
3. Refer to the Product model schema for available data
4. Test across all breakpoints using Chrome DevTools

---

**Document Version**: 1.0  
**Last Updated**: March 16, 2026  
**Status**: Ready for Implementation
