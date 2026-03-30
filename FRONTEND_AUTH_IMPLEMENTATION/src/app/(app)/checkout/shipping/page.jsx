/**
 * Checkout Shipping Page
 * First step in checkout flow - collect shipping address before payment
 * 
 * Flow:
 * 1. Display ShippingForm to collect address
 * 2. Validate and store in Zustand
 * 3. On submit, redirect to CheckoutSummary
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { useCheckoutAffiliateTracking } from '@/hooks/useCheckout';
import { useShippingAddress } from '@/stores/checkoutStore';
import checkoutService from '@/api/services/checkoutService';
import ShippingForm from '@/components/checkout/ShippingForm';

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  padding: 40px 20px;
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    padding: 20px 12px;
  }
`;

const ContentWrapper = styled.div`
  max-width: 700px;
  margin: 0 auto;
  width: 100%;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 32px;

  @media (max-width: 768px) {
    margin-bottom: 24px;
  }
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px;

  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

const Subtitle = styled.p`
  font-size: 15px;
  color: #6b7280;
  margin: 0;
`;

const ProgressBar = styled.div`
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-top: 20px;
  align-items: center;

  @media (max-width: 768px) {
    gap: 4px;
    margin-top: 16px;
  }
`;

const ProgressItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 4px;
  }
`;

const StepBadge = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 15px;
  background: ${(props) => (props.$active ? '#5b4dff' : props.$completed ? '#10b981' : '#e5e7eb')};
  color: ${(props) => (props.$active || props.$completed ? 'white' : '#6b7280')};
  transition: all 0.3s ease;

  @media (max-width: 768px) {
    width: 32px;
    height: 32px;
    font-size: 12px;
  }
`;

const StepLabel = styled.span`
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;

  @media (max-width: 768px) {
    font-size: 11px;
  }
`;

const Connector = styled.div`
  width: 60px;
  height: 2px;
  background: #e5e7eb;
  position: relative;

  @media (max-width: 768px) {
    display: none;
  }
`;

/**
 * Checkout Shipping Page
 * Collects shipping address before Stripe payment
 */
export default function CheckoutShippingPage() {
  const router = useRouter();
  const { getAffiliateId } = useCheckoutAffiliateTracking();
  const shippingAddress = useShippingAddress();

  // If user has shipping address already and navigates directly to this page,
  // they might want to review it. That's ok, let them edit it.

  const handleShippingSubmit = async (validatedAddress) => {
    try {
      console.log('🚚 Shipping form submitted, creating checkout session...');
      console.log('📦 Validated address received:', validatedAddress);
      console.log('📦 Address type:', typeof validatedAddress);
      console.log('📦 Address keys:', validatedAddress ? Object.keys(validatedAddress) : 'null/undefined');

      const affiliateId = getAffiliateId();
      console.log('🆔 [AFFILIATE TRACKING] Affiliate ID retrieved:', {
        affiliateId: affiliateId || '(none)',
        status: affiliateId ? '✅ PRESENT' : '❌ NOT FOUND',
      });

      if (affiliateId) {
        console.log('✅ Affiliate ID will be attached to checkout session');
      } else {
        console.log('ℹ️  No affiliate ID - processing as regular customer');
      }

      // Create checkout session with shipping address
      const sessionData = await checkoutService.createCheckoutSession({
        affiliateId,
        shippingAddress: validatedAddress,
      });

      console.log('✅ Checkout session created:', sessionData.sessionId);
      console.log('✅ Affiliate attribution status: ' + (affiliateId ? 'ATTACHED' : 'NONE'));

      // Redirect to Stripe checkout
      if (sessionData.url) {
        window.location.href = sessionData.url;
      } else {
        console.error('No checkout URL received');
        alert('Error creating checkout session. Please try again.');
      }
    } catch (error) {
      console.error('❌ Error creating checkout session:', error);
      
      // Show error to user
      let errorMessage = 'Error creating checkout session. Please try again.';
      if (error.message) {
        errorMessage = error.message;
      }
      if (error.details?.shippingAddress) {
        errorMessage = `Shipping address error: ${JSON.stringify(error.details.shippingAddress)}`;
      }
      if (error.details?.email) {
        errorMessage = `Email error: ${error.details.email}`;
      }

      alert(errorMessage);
    }
  };

  return (
    <PageContainer>
      <ContentWrapper>
        {/* Header */}
        <Header>
          <Title>🚚 Shipping Address</Title>
          <Subtitle>Step 1 of 2 in checkout process</Subtitle>

          {/* Progress indicator */}
          <ProgressBar>
            <ProgressItem>
              <StepBadge $active $completed={false}>
                1
              </StepBadge>
              <StepLabel>Shipping</StepLabel>
            </ProgressItem>

            <Connector />

            <ProgressItem>
              <StepBadge $active={false} $completed={false}>
                2
              </StepBadge>
              <StepLabel>Payment</StepLabel>
            </ProgressItem>
          </ProgressBar>
        </Header>

        {/* Shipping Form */}
        <ShippingForm
          onSubmit={handleShippingSubmit}
          showSaveProfile={true}
        />
      </ContentWrapper>
    </PageContainer>
  );
}
