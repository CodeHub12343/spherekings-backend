'use client';

import styled from 'styled-components';

const LoaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const SkeletonItem = styled.div`
  display: grid;
  grid-template-columns: 100px 1fr auto;
  gap: 20px;
  padding: 20px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  align-items: center;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  @media (max-width: 640px) {
    grid-template-columns: 80px 1fr;
    gap: 12px;
    padding: 16px;
  }
`;

const SkeletonImage = styled.div`
  width: 100px;
  height: 100px;
  background: #e5e7eb;
  border-radius: 8px;
  flex-shrink: 0;

  @media (max-width: 640px) {
    width: 80px;
    height: 80px;
  }
`;

const SkeletonInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SkeletonText = styled.div`
  height: ${(props) => props.height || '16px'};
  background: #e5e7eb;
  border-radius: 4px;
  width: ${(props) => props.width || '100%'};
`;

const SkeletonPrice = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-end;
`;

/**
 * CartLoader Component
 * Displays loading skeleton for cart items
 */
export default function CartLoader({ count = 3 }) {
  return (
    <LoaderContainer>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonItem key={i}>
          <SkeletonImage />
          <SkeletonInfo>
            <SkeletonText height="20px" width="60%" />
            <SkeletonText height="16px" width="40%" />
            <SkeletonText height="14px" width="50%" />
          </SkeletonInfo>
          <SkeletonPrice>
            <SkeletonText height="18px" width="80px" />
            <SkeletonText height="14px" width="60px" />
          </SkeletonPrice>
        </SkeletonItem>
      ))}
    </LoaderContainer>
  );
}
