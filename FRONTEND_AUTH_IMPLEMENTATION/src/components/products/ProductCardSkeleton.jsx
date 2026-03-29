'use client';

import styled from 'styled-components';

const SkeletonContainer = styled.div`
  padding: 0;
`;

const SkeletonImage = styled.div`
  width: 100%;
  aspect-ratio: 1;
  background: linear-gradient(
    90deg,
    #f0f0f0 0%,
    #e0e0e0 50%,
    #f0f0f0 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 8px;
  margin-bottom: 12px;

  @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }
`;

const SkeletonBadge = styled.div`
  position: absolute;
  top: 12px;
  left: 12px;
  width: 60px;
  height: 24px;
  background: linear-gradient(90deg, #f0f0f0 0%, #e0e0e0 50%, #f0f0f0 100%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
`;

const SkeletonText = styled.div`
  height: ${props => props.height || '16px'};
  background: linear-gradient(
    90deg,
    #f0f0f0 0%,
    #e0e0e0 50%,
    #f0f0f0 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
  margin-bottom: ${props => props.marginBottom || '8px'};
  width: ${props => props.width || '100%'};

  @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }
`;

const SkeletonCategory = styled(SkeletonText)`
  width: 40%;
  height: 12px;
  margin-bottom: 12px;
`;

const SkeletonTitle = styled(SkeletonText)`
  height: 18px;
  margin-bottom: 8px;
`;

const SkeletonDescription = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
`;

const SkeletonDescriptionLine = styled(SkeletonText)`
  height: 14px;

  &:last-child {
    width: 70%;
  }
`;

const SkeletonVariant = styled.div`
  display: flex;
  gap: 6px;
  margin-bottom: 12px;

  > div {
    height: 20px;
    flex: 1;
    border-radius: 4px;

    &:last-child {
      flex: 0.8;
    }
  }
`;

const SkeletonPrice = styled(SkeletonText)`
  height: 20px;
  margin-bottom: 8px;
  width: 60%;
`;

const SkeletonStock = styled(SkeletonText)`
  height: 14px;
  width: 50%;
  margin-bottom: 16px;
`;

const SkeletonButton = styled(SkeletonText)`
  height: 36px;
  width: 100%;
  border-radius: 6px;
`;

/**
 * ProductCardSkeleton Component
 * 
 * Displays a skeleton loading state for ProductCard
 * Features:
 * - Shimmer animation effect
 * - All card sections represented
 * - Responsive design
 * - Smooth 1.5s animation loop
 * 
 * Usage:
 * {isLoading ? (
 *   <>
 *     <ProductCardSkeleton />
 *     <ProductCardSkeleton />
 *     <ProductCardSkeleton />
 *   </>
 * ) : (
 *   <ProductCard {...props} />
 * )}
 */
export default function ProductCardSkeleton() {
  return (
    <SkeletonContainer>
      {/* Image with badge placeholder */}
      <div style={{ position: 'relative', marginBottom: '12px' }}>
        <SkeletonImage />
        <SkeletonBadge style={{ position: 'absolute' }} />
      </div>

      {/* Category */}
      <SkeletonCategory />

      {/* Title */}
      <SkeletonTitle />

      {/* Description (2 lines) */}
      <SkeletonDescription>
        <SkeletonDescriptionLine />
        <SkeletonDescriptionLine />
      </SkeletonDescription>

      {/* Variant chips (simulated) */}
      <SkeletonVariant>
        <SkeletonText width="45%" height="20px" marginBottom="0" />
        <SkeletonText width="55%" height="20px" marginBottom="0" />
      </SkeletonVariant>

      {/* Price */}
      <SkeletonPrice />

      {/* Stock info */}
      <SkeletonStock />

      {/* Action button */}
      <SkeletonButton />
    </SkeletonContainer>
  );
}
