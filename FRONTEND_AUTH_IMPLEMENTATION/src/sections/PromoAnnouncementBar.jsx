"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, AlertCircle, Zap } from 'lucide-react';
import styled from 'styled-components';

const BarContainer = styled.div`
  position: fixed;
  top: 72px; /* Below fixed header */
  left: 0;
  right: 0;
  z-index: 45;
  background: linear-gradient(135deg, #0F3A66 0%, #1B4F7F 100%);
  border-bottom: 3px solid #D4AF37;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: slideDown 0.4s ease-out;

  @keyframes slideDown {
    from {
      transform: translateY(-100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @media (max-width: 768px) {
    top: 72px;
    padding: 12px 16px;
  }
`;

const Content = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;

  @media (max-width: 1024px) {
    padding: 16px;
    gap: 16px;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    padding: 12px;
    gap: 12px;
    text-align: center;
  }
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
    flex-direction: column;
    gap: 8px;
  }
`;

const Badge = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(212, 175, 55, 0.15);
  border: 1px solid #D4AF37;
  border-radius: 20px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 700;
  color: #FFD700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;

  svg {
    width: 14px;
    height: 14px;
  }

  @media (max-width: 768px) {
    padding: 5px 10px;
    font-size: 11px;
  }
`;

const MessageSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const MainMessage = styled.p`
  font-size: 16px;
  font-weight: 700;
  color: white;
  margin: 0;
  letter-spacing: -0.3px;

  @media (max-width: 768px) {
    font-size: 15px;
  }
`;

const Subtext = styled.p`
  font-size: 13px;
  color: rgba(255, 255, 255, 0.85);
  margin: 0;

  .bonus {
    color: #FFD700;
    font-weight: 600;
  }

  @media (max-width: 768px) {
    font-size: 12px;
  }
`;

const PriceSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
    gap: 8px;
  }
`;

const OfferPrice = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;

  @media (max-width: 768px) {
    align-items: center;
  }
`;

const Price = styled.span`
  font-size: 28px;
  font-weight: 800;
  color: #D4AF37;
  letter-spacing: -0.5px;

  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

const RetailPrice = styled.span`
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: line-through;
  font-weight: 500;
`;

const SavingsBadge = styled.div`
  background: #8B0A50;
  color: #FFD700;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
  letter-spacing: 0.3px;

  @media (max-width: 768px) {
    padding: 5px 8px;
    font-size: 11px;
  }
`;

const CTAButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 28px;
  background: linear-gradient(135deg, #D4AF37 0%, #E5C158 100%);
  color: #0F3A66;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);

  &:hover {
    background: linear-gradient(135deg, #E5C158 0%, #FFD700 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(212, 175, 55, 0.4);
  }

  &:active {
    transform: translateY(0);
  }

  svg {
    width: 16px;
    height: 16px;
  }

  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
    padding: 11px 20px;
    font-size: 13px;
  }
`;

const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;

  &:hover {
    background: rgba(255, 255, 255, 0.25);
    border-color: rgba(255, 255, 255, 0.5);
  }

  svg {
    width: 16px;
    height: 16px;
  }

  @media (max-width: 768px) {
    position: absolute;
    top: 12px;
    right: 12px;
    width: 28px;
    height: 28px;
  }
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;

  @media (max-width: 768px) {
    width: 100%;
    flex-direction: column;
    gap: 12px;
  }
`;

const Spacer = styled.div`
  flex: 1;

  @media (max-width: 768px) {
    display: none;
  }
`;

/**
 * PromoAnnouncementBar
 * High-converting promotional banner for limited-time offers
 * 
 * Props:
 * - isVisible: Boolean to control visibility (optional, defaults to true)
 * - onClose: Callback when user closes the banner
 * - ctaUrl: URL for the CTA button (default: '/register')
 * - spotsRemaining: Number to display for urgency (optional, used if showCounter is true)
 * - showCounter: Boolean to show live counter (default: false for static)
 */
export default function PromoAnnouncementBar({
  isVisible = true,
  onClose,
  ctaUrl = '/register',
  spotsRemaining = null,
  showCounter = false,
}) {
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(isVisible);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    if (onClose) onClose();
  };

  if (!isOpen || !isMounted) return null;

  // Static urgency message (safest for most use cases)
  const urgencyMessage = showCounter && spotsRemaining 
    ? `Only ${spotsRemaining} spots left`
    : 'First 200 People';

  return (
    <BarContainer>
      <Content>
        <LeftSection>
          <Badge>
            <Zap />
            LIMITED EDITION
          </Badge>

          <MessageSection>
            <MainMessage>
              🎲 {urgencyMessage} — Exclusive 3-in-1 Game Board Offer
            </MainMessage>
            <Subtext>
              Get any <span className="bonus">2 color choices</span> included with your order
            </Subtext>
          </MessageSection>
        </LeftSection>

        <Spacer />

        <RightSection>
          <PriceSection>
            <OfferPrice>
              <Price>$44.99</Price>
              <RetailPrice>Was $129+</RetailPrice>
            </OfferPrice>
            <SavingsBadge>Save 65%</SavingsBadge>
          </PriceSection>

          <CTAButton href={ctaUrl}>
            Claim Offer
          </CTAButton>
        </RightSection>

        <CloseButton 
          onClick={handleClose}
          aria-label="Close announcement"
          title="Dismiss"
        >
          <X />
        </CloseButton>
      </Content>
    </BarContainer>
  );
}
