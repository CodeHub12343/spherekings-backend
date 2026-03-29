'use client';

import styled from 'styled-components';
import { useState } from 'react';

const ZoomContainer = styled.div`
  position: relative;
  overflow: hidden;
  aspect-ratio: 1 / 1;
  background: #f3f4f6;
  border-radius: 12px;
  cursor: ${props => (props.isZoomed ? 'zoom-out' : 'zoom-in')};
`;

const ZoomImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.2s ease-out;
  transform: scale(${props => props.scale});
  transform-origin: ${props => props.originX}% ${props => props.originY}%;
  user-select: none;
  pointer-events: none;

  @media (max-width: 768px) {
    cursor: auto;
    transform: scale(1);
  }
`;

const ZoomIndicator = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  z-index: 10;
  pointer-events: none;

  @media (max-width: 768px) {
    display: none;
  }
`;

/**
 * ImageZoomGallery Component
 * 
 * Desktop image gallery with hover-to-zoom functionality
 * Provides enhanced product image viewing experience
 */
export default function ImageZoomGallery({ 
  image = '',
  alt = 'Product image',
  onZoom = null,
}) {
  const [scale, setScale] = useState(1);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const [isZoomed, setIsZoomed] = useState(false);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setOrigin({ x, y });
    setScale(1.5);
    setIsZoomed(true);
    
    if (onZoom) {
      onZoom({ scale: 1.5, x, y });
    }
  };

  const handleMouseLeave = () => {
    setScale(1);
    setIsZoomed(false);
    setOrigin({ x: 50, y: 50 });
    
    if (onZoom) {
      onZoom({ scale: 1, x: 50, y: 50 });
    }
  };

  const handleClick = () => {
    if (isZoomed) {
      handleMouseLeave();
    }
  };

  return (
    <ZoomContainer
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      isZoomed={isZoomed}
      role="img"
      aria-label={`${alt} - Click to zoom`}
    >
      <ZoomImage
        src={image}
        alt={alt}
        scale={scale}
        originX={origin.x}
        originY={origin.y}
        loading="eager"
      />
      {isZoomed && <ZoomIndicator>Zoomed</ZoomIndicator>}
    </ZoomContainer>
  );
}
