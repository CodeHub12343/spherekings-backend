/**
 * Checkout Cancel Page
 * Shown when user cancels Stripe payment
 * 
 * Features:
 * - Explains payment was canceled
 * - Shows cart items are preserved
 * - Provides retry option
 */

'use client';

import styled from 'styled-components';
import Link from 'next/link';
import { useEffect } from 'react';
import { useCheckout } from '@/hooks/useCheckout';
import { useToast } from '@/components/ui/Toast';
import CheckoutButton from '@/components/checkout/CheckoutButton';

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  padding: 40px 20px;
`;

const ContentContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
`;

const Card = styled.div`
  background: white;
  border-radius: 12px;
  padding: 40px;
  border-left: 4px solid #f87171;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const Icon = styled.div`
  font-size: 64px;
  margin-bottom: 20px;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: #991b1b;
  margin: 0 0 12px;
`;

const Message = styled.p`
  font-size: 16px;
  color: #6b7280;
  line-height: 1.8;
  margin: 12px 0;

  &.secondary {
    font-size: 14px;
    color: #9ca3af;
  }
`;

const InformationBox = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 16px;
  margin: 24px 0;
  text-align: left;

  &.success {
    background: #f0fdf4;
    border-color: #bbf7d0;
  }
`;

const InformationTitle = styled.h3`
  font-size: 14px;
  font-weight: 700;
  color: #7f1d1d;
  margin: 0 0 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  &.success {
    color: #065f46;
  }
`;

const InformationList = styled.ul`
  margin: 0;
  padding-left: 20px;
  font-size: 14px;
  color: #6b7280;

  li {
    margin: 6px 0;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 32px;
  flex-wrap: wrap;
  justify-content: center;

  @media (max-width: 600px) {
    flex-direction: column;
  }
`;

const Button = styled(Link)`
  padding: 12px 28px;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  text-align: center;
  flex: 1;
  min-width: 140px;

  &.primary {
    background: linear-gradient(135deg, #5b4dff 0%, #4c3fcc 100%);
    color: white;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 16px rgba(91, 77, 255, 0.3);
    }
  }

  &.secondary {
    background: white;
    color: #5b4dff;
    border: 2px solid #5b4dff;

    &:hover {
      background: #f3f4f6;
    }
  }

  @media (max-width: 600px) {
    flex: 1;
    min-width: 100%;
  }
`;

const CheckoutButtonWrapper = styled.div`
  width: 100%;
  margin-top: 16px;

  button {
    width: 100%;
  }
`;

/**
 * CheckoutCancelPage Component
 * Shows when user cancels Stripe Checkout
 */
export default function CheckoutCancelPage() {
  const { handleCancel } = useCheckout();
  const { error: showError } = useToast();

  useEffect(() => {
    handleCancel();
  }, []);

  return (
    <PageContainer>
      <ContentContainer>
        <Card>
          <Icon>✕</Icon>
          <Title>Checkout Canceled</Title>
          <Message>
            Your checkout was canceled. Your cart items are still saved, and you can
            complete your purchase anytime.
          </Message>

          {/* Information Boxes */}
          <InformationBox>
            <InformationTitle>✓ Your Cart is Safe</InformationTitle>
            <InformationList>
              <li>All items remain in your cart</li>
              <li>No changes were made to your order</li>
              <li>You can retry checkout whenever you're ready</li>
            </InformationList>
          </InformationBox>

          <InformationBox className="success">
            <InformationTitle className="success">💡 Why You Might Cancel</InformationTitle>
            <InformationList>
              <li>Reviewing order details before confirming</li>
              <li>Choosing a different payment method</li>
              <li>Changing your mind about the purchase</li>
            </InformationList>
          </InformationBox>

          <Message className="secondary">
            We accept all major credit cards, debit cards, and digital payment methods
            through our secure Stripe payment processor.
          </Message>

          {/* Action Buttons */}
          <ActionButtons>
            <Button href="/cart" className="primary">
              Back to Cart
            </Button>
            <Button href="/products" className="secondary">
              Continue Shopping
            </Button>
          </ActionButtons>

          {/* Retry Checkout */}
          <CheckoutButtonWrapper>
            <CheckoutButton
              fullWidth
              label="Try Checkout Again"
              onCheckoutStart={() => {
                console.log('🔄 Retrying checkout...');
              }}
              onCheckoutError={(err) => {
                showError(err.message);
              }}
            />
          </CheckoutButtonWrapper>

          {/* Support Message */}
          <Message style={{ marginTop: '32px', fontSize: '13px', color: '#9ca3af' }}>
            Having trouble? <Link href="/support">Contact our support team</Link> or
            email support@spherekings.com
          </Message>
        </Card>
      </ContentContainer>
    </PageContainer>
  );
}
