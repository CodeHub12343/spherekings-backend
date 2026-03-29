'use client';

import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Users } from 'lucide-react';
import { useFollowerCount } from '@/api/hooks/useFollowers';

const CounterContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: linear-gradient(135deg, rgba(91, 77, 255, 0.1) 0%, rgba(76, 63, 209, 0.05) 100%);
  border: 1px solid rgba(91, 77, 255, 0.2);
  border-radius: 12px;
  width: fit-content;
  margin: 0 auto;

  @media (max-width: 640px) {
    padding: 12px 16px;
    gap: 8px;
  }
`;

const IconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #5b4dff 0%, #4c3fd1 100%);
  border-radius: 8px;
  color: white;
  flex-shrink: 0;

  svg {
    width: 20px;
    height: 20px;
  }

  @media (max-width: 640px) {
    width: 32px;
    height: 32px;

    svg {
      width: 16px;
      height: 16px;
    }
  }
`;

const TextContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const Label = styled.span`
  font-size: 12px;
  color: #6b7280;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.5px;

  @media (max-width: 640px) {
    font-size: 10px;
  }
`;

const CountValue = styled.span`
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  display: flex;
  align-items: baseline;
  gap: 4px;

  @media (max-width: 640px) {
    font-size: 22px;
  }
`;

const PlusSuffix = styled.span`
  font-size: 16px;
  color: #5b4dff;
  font-weight: 600;

  @media (max-width: 640px) {
    font-size: 14px;
  }
`;

const AnimatedNumber = styled.span`
  animation: fadeIn 0.3s ease-in;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
`;

const LoadingSkeleton = styled.div`
  background: #e5e7eb;
  border-radius: 4px;
  height: 32px;
  width: 80px;
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
`;

/**
 * FollowerCounter
 * Displays live follower count with auto-refresh every 30 seconds
 */
export default function FollowerCounter() {
  const { data: count, isLoading, error } = useFollowerCount();
  const [displayCount, setDisplayCount] = useState(count || 0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Animate when count changes
  useEffect(() => {
    if (count !== undefined && count !== displayCount) {
      setIsAnimating(true);
      setDisplayCount(count);
      setTimeout(() => setIsAnimating(false), 300);
    }
  }, [count, displayCount]);

  if (isLoading && displayCount === 0) {
    return (
      <CounterContainer>
        <IconContainer>
          <Users />
        </IconContainer>
        <TextContainer>
          <Label>Live Followers</Label>
          <LoadingSkeleton />
        </TextContainer>
      </CounterContainer>
    );
  }

  return (
    <CounterContainer>
      <IconContainer>
        <Users />
      </IconContainer>
      <TextContainer>
        <Label>Live Followers</Label>
        <CountValue>
          <AnimatedNumber key={isAnimating ? 'animated' : 'static'}>
            {(displayCount || 0).toLocaleString()}
          </AnimatedNumber>
          <PlusSuffix>+</PlusSuffix>
        </CountValue>
      </TextContainer>
    </CounterContainer>
  );
}
