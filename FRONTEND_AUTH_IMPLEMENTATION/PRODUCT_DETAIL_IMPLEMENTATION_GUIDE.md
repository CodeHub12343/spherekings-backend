# Product Detail Page - Implementation Guide
## Quick Start & Code Examples

**Document Purpose**: Practical guide for implementing the design system recommendations from PRODUCT_DETAIL_PAGE_DESIGN_SYSTEM.md

---

## 🎯 Priority Implementation Tasks

### Priority 1: Mobile Experience (High Impact)
1. **MobileStickyCartBar** - Keep Add to Cart always visible on mobile
2. **SwipeableImageCarousel** - Better mobile image browsing
3. **ProductSpecifications** - Display key product info clearly

### Priority 2: Desktop Enhancement (Medium Impact)
1. **ImageZoomGallery** - Hover zoom on desktop
2. **Breadcrumb Navigation** - Better navigation/SEO
3. **Enhanced VariantSelector** - Color swatches, better UX

### Priority 3: Advanced Features (Low Impact)
1. Social sharing buttons
2. Wishlist/favorite functionality
3. Customer reviews section

---

## 📦 Component Implementation Examples

### 1. MobileStickyCartBar Component

**File**: `src/components/products/MobileStickyCartBar.jsx`

```jsx
'use client';

import styled from 'styled-components';

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
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
  z-index: 40;
  
  /* Safe area for notch devices (iPhone X+, etc) */
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
  white-space: nowrap;

  @media (max-width: 480px) {
    font-size: 16px;
  }
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
  font-size: 14px;

  &:active {
    transform: scale(0.98);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 480px) {
    padding: 10px 12px;
    font-size: 13px;
  }
`;

/**
 * MobileStickyCartBar Component
 * 
 * Displays a sticky cart action bar at the bottom of mobile screens
 * Keeps the Add to Cart button always accessible while scrolling
 * 
 * Usage:
 * <MobileStickyCartBar
 *   price={99.99}
 *   isOutOfStock={false}
 *   onAddToCart={handleAddToCart}
 * />
 */
export default function MobileStickyCartBar({
  price = 0,
  isOutOfStock = false,
  onAddToCart = () => {},
}) {
  return (
    <StickyBar>
      <PriceDisplay>${price.toFixed(2)}</PriceDisplay>
      <AddButton
        disabled={isOutOfStock}
        onClick={onAddToCart}
        aria-label={isOutOfStock ? 'Out of stock' : 'Add product to cart'}
      >
        {isOutOfStock ? 'Out of Stock' : '+ Add to Cart'}
      </AddButton>
    </StickyBar>
  );
}
```

**Usage in ProductDetail.jsx**:
```jsx
// Add at the bottom of the render, inside DetailContainer
<MobileStickyCartBar
  price={safePrice}
  isOutOfStock={isOutOfStock}
  onAddToCart={handleAddToCart}
/>
```

---

### 2. SwipeableImageCarousel Component

**File**: `src/components/products/SwipeableImageCarousel.jsx`

```jsx
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

  @media (max-width: 640px) {
    border-radius: 8px;
  }

  @media (max-width: 480px) {
    border-radius: 6px;
  }
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

  @media (max-width: 480px) {
    font-size: 11px;
    padding: 4px 10px;
    bottom: 8px;
  }
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

  svg {
    width: 20px;
    height: 20px;
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

const DotIndicators = styled.div`
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 6px;
  z-index: 15;

  @media (max-width: 768px) {
    display: flex;
  }

  @media (max-width: 480px) {
    gap: 4px;
    bottom: 8px;
  }
`;

const Dot = styled.button`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: none;
  background: ${props => (props.active ? 'white' : 'rgba(255, 255, 255, 0.5)')};
  cursor: pointer;
  transition: all 0.2s;
  padding: 0;

  @media (max-width: 480px) {
    width: 6px;
    height: 6px;
  }
`;

/**
 * SwipeableImageCarousel Component
 * 
 * Mobile-optimized image carousel with swipe support
 * 
 * Features:
 * - Touch swipe support (left/right)
 * - Keyboard navigation (arrows)
 * - Image counter (1/4)
 * - Dot indicators
 * - Previous/Next buttons (desktop only)
 * - Smooth transitions
 * 
 * Usage:
 * <SwipeableImageCarousel images={product.images} />
 */
export default function SwipeableImageCarousel({ images = [] }) {
  const [current, setCurrent] = useState(0);
  const [touchStart, setTouchStart] = useState(null);

  if (!images || images.length === 0) {
    return <CarouselContainer />;
  }

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

    // Only trigger if swipe distance > 50px
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    
    setTouchStart(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') handlePrev();
    if (e.key === 'ArrowRight') handleNext();
  };

  return (
    <CarouselContainer
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onKeyDown={handleKeyDown}
      role="region"
      aria-label="Product image carousel"
    >
      <CarouselTrack offset={-current * 100}>
        {images.map((image, index) => (
          <CarouselSlide key={index}>
            <Image
              src={image}
              alt={`Product image ${index + 1}`}
              fill
              priority={index === 0}
              sizes="(max-width: 768px) 100vw, 50vw"
              style={{ objectFit: 'cover' }}
            />
          </CarouselSlide>
        ))}
      </CarouselTrack>

      {images.length > 1 && (
        <>
          <ImageIndicator>
            {current + 1} / {images.length}
          </ImageIndicator>

          <NavButton direction="left" onClick={handlePrev} aria-label="Previous image">
            <ChevronLeft size={20} />
          </NavButton>
          <NavButton direction="right" onClick={handleNext} aria-label="Next image">
            <ChevronRight size={20} />
          </NavButton>

          <DotIndicators>
            {images.map((_, index) => (
              <Dot
                key={index}
                active={index === current}
                onClick={() => setCurrent(index)}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </DotIndicators>
        </>
      )}
    </CarouselContainer>
  );
}
```

**When to use**:
- On mobile screens (≤768px) to replace the static thumbnail gallery
- Provides better UX for browsing multiple product images

---

### 3. ProductSpecifications Component

**File**: `src/components/products/ProductSpecifications.jsx`

```jsx
'use client';

import styled from 'styled-components';

const SpecsContainer = styled.div`
  padding: 24px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  margin-top: 16px;

  @media (max-width: 640px) {
    padding: 16px;
  }

  @media (max-width: 480px) {
    padding: 12px;
  }
`;

const SpecTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 16px;

  @media (max-width: 640px) {
    font-size: 16px;
    margin: 0 0 12px;
  }

  @media (max-width: 480px) {
    font-size: 14px;
    margin: 0 0 10px;
  }
`;

const SpecsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  @media (max-width: 480px) {
    gap: 10px;
  }
`;

const SpecItem = styled.div`
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
  border-left: 3px solid #5b4dff;

  @media (max-width: 480px) {
    padding: 10px;
    border-radius: 6px;
  }

  .label {
    font-size: 11px;
    color: #6b7280;
    text-transform: uppercase;
    font-weight: 700;
    letter-spacing: 0.5px;
    margin-bottom: 6px;

    @media (max-width: 480px) {
      font-size: 10px;
      margin-bottom: 4px;
    }
  }

  .value {
    font-size: 15px;
    color: #1f2937;
    font-weight: 600;

    @media (max-width: 480px) {
      font-size: 14px;
    }
  }
`;

/**
 * ProductSpecifications Component
 * 
 * Displays key product specifications in an easy-to-scan grid format
 * 
 * Usage:
 * <ProductSpecifications product={product} />
 */
export default function ProductSpecifications({ product }) {
  if (!product) return null;

  const specs = [
    {
      label: 'SKU',
      value: product.sku || 'N/A',
    },
    {
      label: 'Category',
      value: product.category || 'Uncategorized',
    },
    {
      label: 'Status',
      value: product.status ? 
        product.status.charAt(0).toUpperCase() + product.status.slice(1) : 
        'N/A',
    },
    {
      label: 'Stock',
      value: `${product.stock || 0} units`,
    },
    {
      label: 'Featured',
      value: product.isFeatured ? '✓ Yes' : 'No',
    },
    {
      label: 'Added',
      value: product.createdAt ? 
        new Date(product.createdAt).toLocaleDateString() : 
        'N/A',
    },
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

### 4. ImageZoomGallery Component (Desktop Only)

**File**: `src/components/products/ImageZoomGallery.jsx`

```jsx
'use client';

import styled from 'styled-components';
import Image from 'next/image';
import { useState } from 'react';

const ZoomContainer = styled.div`
  position: relative;
  overflow: hidden;
  aspect-ratio: 1;
  background: #f3f4f6;
  border-radius: 12px;
  cursor: zoom-in;

  @media (max-width: 768px) {
    display: none;
  }
`;

const ZoomImageWrapper = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
`;

const ZoomImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.1s ease;
  transform: scale(${props => props.scale});
  transform-origin: ${props => props.originX}% ${props => props.originY}%;
`;

const ZoomLens = styled.div`
  position: absolute;
  width: 100px;
  height: 100px;
  border: 2px solid rgba(91, 77, 255, 0.5);
  border-radius: 4px;
  pointer-events: none;
  display: ${props => (props.show ? 'block' : 'none')};
  left: ${props => props.lensX}px;
  top: ${props => props.lensY}px;
  transform: translate(-50%, -50%);
  background: rgba(91, 77, 255, 0.1);
  z-index: 10;
`;

/**
 * ImageZoomGallery Component
 * 
 * Desktop-only zoom functionality for product images
 * Shows a zoom lens on hover
 * 
 * Usage:
 * <ImageZoomGallery image={product.images[0]} />
 */
export default function ImageZoomGallery({ image }) {
  const [scale, setScale] = useState(1);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const [showZoom, setShowZoom] = useState(false);
  const [lensPos, setLensPos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setOrigin({ x, y });
    setScale(1.5);
    setShowZoom(true);

    const lensX = e.clientX - rect.left;
    const lensY = e.clientY - rect.top;
    setLensPos({ x: lensX, y: lensY });
  };

  const handleMouseLeave = () => {
    setScale(1);
    setShowZoom(false);
  };

  if (!image) {
    return (
      <ZoomContainer style={{ background: '#e5e7eb' }} />
    );
  }

  return (
    <ZoomContainer
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <ZoomImageWrapper>
        <ZoomImage
          src={image}
          alt="Product zoom view"
          scale={scale}
          originX={origin.x}
          originY={origin.y}
        />
        <ZoomLens
          show={showZoom}
          lensX={lensPos.x}
          lensY={lensPos.y}
        />
      </ZoomImageWrapper>
    </ZoomContainer>
  );
}
```

---

## 🔄 Integration into ProductDetail.jsx

### Updated Import Section
```jsx
import SwipeableImageCarousel from './SwipeableImageCarousel';
import ImageZoomGallery from './ImageZoomGallery';
import ProductSpecifications from './ProductSpecifications';
import MobileStickyCartBar from './MobileStickyCartBar';
import { useMediaQuery } from '@/hooks/useMediaQuery'; // You may need to create this
```

### Updated Layout Structure

Modify the DetailContainer structure:

```jsx
return (
  <DetailContainer>
    {/* Image Gallery - Conditional rendering */}
    <ImageGallery>
      {/* Desktop: Use existing gallery with zoom */}
      <ImageZoomGallery image={mainImage} />
      
      {/* Mobile: Use swipeable carousel */}
      <SwipeableImageCarousel images={images} />
      
      {/* Thumbnails - Desktop only */}
      <ThumbnailContainer>
        {/* ... existing thumbnail code ... */}
      </ThumbnailContainer>
    </ImageGallery>

    {/* Content Section - existing */}
    <ContentSection>
      {/* ... existing content ... */}
    </ContentSection>
  </DetailContainer>
);

{/* Add ProductSpecifications below the details grid */}
<ProductSpecifications product={product} />

{/* Add MobileStickyCartBar at the very end */}
<MobileStickyCartBar
  price={safePrice}
  isOutOfStock={isOutOfStock}
  onAddToCart={handleAddToCart}
/>
```

---

## 🎯 CSS Media Query Helper Hook (Optional)

Create `src/hooks/useMediaQuery.js`:

```javascript
'use client';

import { useState, useEffect } from 'react';

export function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
}

// Usage:
// const isMobile = useMediaQuery('(max-width: 768px)');
```

---

## ✅ Testing Checklist

### Mobile Testing (iOS & Android)
- [ ] Swipe left/right in image carousel
- [ ] Sticky cart bar appears when scrolled
- [ ] All tap targets are 44x44px minimum
- [ ] No horizontal scrolling
- [ ] Safe area respected on notched devices

### Desktop Testing
- [ ] Hover zoom on main image works smoothly
- [ ] Thumbnails are clickable and update main image
- [ ] Variant selector works with keyboard
- [ ] All buttons are keyboard accessible

### Browser Compatibility
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (iOS + macOS)
- [ ] Mobile browsers

### Performance
- [ ] Images load progressively
- [ ] No layout shift when loading images
- [ ] No jank during carousel swipe
- [ ] Smooth animations at 60fps

---

## 📊 Bundle Size Impact

| Component | Estimated Size | Priority |
|-----------|---|---|
| SwipeableImageCarousel | +8KB | High |
| MobileStickyCartBar | +2KB | High |
| ProductSpecifications | +2KB | Medium |
| ImageZoomGallery | +3KB | Medium |
| **Total** | **~15KB** | — |

*Sizes are gzipped. Consider lazy-loading components below the fold.*

---

## 🚀 Next Steps

1. **Create the new component files** (MobileStickyCartBar, SwipeableImageCarousel, etc.)
2. **Import components into ProductDetail.jsx**
3. **Update conditional rendering** for mobile vs desktop galleries
4. **Test on real devices** (not just DevTools emulation)
5. **Monitor Lighthouse scores** before/after
6. **Gather user feedback** and iterate

---

**Last Updated**: March 16, 2026  
**Framework**: Next.js 16 + React 19  
**Status**: Ready for Implementation
