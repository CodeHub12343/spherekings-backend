'use client';

import styled from 'styled-components';
import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

const CarouselContainer = styled.div`
  position: relative;
  overflow: hidden;
  aspect-ratio: 1 / 1;
  background: #f3f4f6;
  border-radius: 12px;
  user-select: none;

  @media (max-width: 768px) {
    border-radius: 8px;
  }
`;

const CarouselTrack = styled.div`
  display: flex;
  height: 100%;
  transition: ${props => (props.isDragging ? 'none' : 'transform 0.3s ease-out')};
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
  padding: 8px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  z-index: 10;
  pointer-events: none;
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
  color: #1f2937;

  &:hover {
    background: white;
    transform: translateY(-50%) scale(1.1);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(-50%) scale(0.95);
  }

  @media (max-width: 768px) {
    display: none;
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const DotContainer = styled.div`
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 6px;
  z-index: 15;

  @media (max-width: 768px) {
    bottom: 16px;
  }
`;

const Dot = styled.button`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: none;
  background: ${props => (props.active ? '#ffffff' : 'rgba(255, 255, 255, 0.5)')};
  cursor: pointer;
  transition: all 0.2s;
  padding: 0;

  &:hover {
    background: rgba(255, 255, 255, 0.8);
  }
`;

/**
 * SwipeableImageCarousel Component
 * 
 * Mobile-optimized swipeable image carousel for product images
 * Features touch swiping, keyboard navigation, and dot indicators
 */
export default function SwipeableImageCarousel({ 
  images = [],
  onImageChange = null,
  autoplay = false,
  autoplayInterval = 5000,
}) {
  const [current, setCurrent] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [dragOffset, setDragOffset] = useState(0);
  const containerRef = useRef(null);
  const autoplayRef = useRef(null);

  if (!images || images.length === 0) {
    return null;
  }

  const handleNext = () => {
    const nextIndex = (current + 1) % images.length;
    setCurrent(nextIndex);
    if (onImageChange) {
      onImageChange(nextIndex);
    }
  };

  const handlePrev = () => {
    const prevIndex = (current - 1 + images.length) % images.length;
    setCurrent(prevIndex);
    if (onImageChange) {
      onImageChange(prevIndex);
    }
  };

  const handleDotClick = (index) => {
    setCurrent(index);
    if (onImageChange) {
      onImageChange(index);
    }
  };

  // Touch/Mouse events
  const handleTouchStart = (e) => {
    setIsDragging(true);
    setDragStart(e.touches?.[0]?.clientX || e.clientX);
    setDragOffset(0);
  };

  const handleTouchMove = (e) => {
    if (!isDragging || !dragStart) return;
    
    const currentX = e.touches?.[0]?.clientX || e.clientX;
    const offset = currentX - dragStart;
    setDragOffset(offset);
  };

  const handleTouchEnd = (e) => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    const threshold = 50; // Minimum swipe distance
    
    if (Math.abs(dragOffset) > threshold) {
      if (dragOffset > 0) {
        handlePrev();
      } else {
        handleNext();
      }
    }
    
    setDragOffset(0);
    setDragStart(null);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [current]);

  // Autoplay
  useEffect(() => {
    if (!autoplay) return;

    autoplayRef.current = setInterval(() => {
      handleNext();
    }, autoplayInterval);

    return () => {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
      }
    };
  }, [autoplay, autoplayInterval, current]);

  // Stop autoplay on user interaction
  const handleUserInteraction = (callback) => {
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current);
    }
    callback();
  };

  return (
    <CarouselContainer
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseMove={isDragging ? handleTouchMove : null}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
      role="region"
      aria-label={`Product image carousel, showing ${current + 1} of ${images.length}`}
    >
      <CarouselTrack
        offset={-(current * 100) + (isDragging ? (dragOffset / containerRef.current?.offsetWidth) * 100 : 0)}
        isDragging={isDragging}
      >
        {images.map((image, index) => (
          <CarouselSlide key={index}>
            <Image
              src={image}
              alt={`Product image ${index + 1}`}
              fill
              style={{ objectFit: 'cover' }}
              priority={index === 0}
              loading={index === 0 ? 'eager' : 'lazy'}
            />
          </CarouselSlide>
        ))}
      </CarouselTrack>

      <ImageIndicator>
        {current + 1} / {images.length}
      </ImageIndicator>

      {images.length > 1 && (
        <>
          <DotContainer>
            {images.map((_, index) => (
              <Dot
                key={index}
                active={index === current}
                onClick={() => handleUserInteraction(() => handleDotClick(index))}
                aria-label={`Go to image ${index + 1}`}
                aria-current={index === current}
              />
            ))}
          </DotContainer>

          <NavButton 
            direction="left" 
            onClick={() => handleUserInteraction(handlePrev)}
            aria-label="Previous image"
          >
            <ChevronLeft size={20} />
          </NavButton>
          <NavButton 
            direction="right" 
            onClick={() => handleUserInteraction(handleNext)}
            aria-label="Next image"
          >
            <ChevronRight size={20} />
          </NavButton>
        </>
      )}
    </CarouselContainer>
  );
}
