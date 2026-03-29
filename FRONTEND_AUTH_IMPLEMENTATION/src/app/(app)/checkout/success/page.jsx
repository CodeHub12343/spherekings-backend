/**
 * Checkout Success Page
 * Handles the redirect from Stripe after successful payment
 * 
 * Flow:
 * 1. Extract session_id from URL
 * 2. Verify session via backend
 * 3. Display success message
 * 4. Show order confirmation
 */

'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import styled from 'styled-components';
import { useCheckout } from '@/hooks/useCheckout';
import { useCartStore } from '@/stores/cartStore';
import { useToast } from '@/components/ui/Toast';
import OrderConfirmationCard from '@/components/checkout/OrderConfirmationCard';
import CheckoutSummary from '@/components/checkout/CheckoutSummary';
import checkoutService from '@/api/services/checkoutService';

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  padding: 40px 20px;
`;

const ContentContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 600px;
  gap: 20px;
`;

const Spinner = styled.div`
  width: 60px;
  height: 60px;
  border: 4px solid #e5e7eb;
  border-top-color: #5b4dff;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const LoadingText = styled.p`
  font-size: 18px;
  color: #6b7280;
  text-align: center;
`;

const ErrorContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 40px;
  border-left: 4px solid #ef4444;
  text-align: center;
`;

const ErrorIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
`;

const ErrorTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #dc2626;
  margin: 0 0 12px;
`;

const ErrorMessage = styled.p`
  font-size: 16px;
  color: #6b7280;
  margin: 0 0 24px;
  line-height: 1.6;
`;

const ActionButton = styled.a`
  display: inline-block;
  background: linear-gradient(135deg, #5b4dff 0%, #4c3fcc 100%);
  color: white;
  padding: 12px 28px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(91, 77, 255, 0.3);
  }
`;

const SummarySection = styled.div`
  margin-top: 32px;
`;

/**
 * CheckoutSuccessPage Component
 * 
 * Displays after user returns from Stripe Checkout
 * Verifies payment and shows confirmation
 */
export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const { handleSuccessRedirect, order, loading, error } = useCheckout();
  const cartItems = useCartStore((state) => state.items);
  const cartSummary = useCartStore((state) => state.summary);
  const clearCart = useCartStore((state) => state.clearCart);
  const { success, error: showError } = useToast();

  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationError, setVerificationError] = useState(null);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [orderLoading, setOrderLoading] = useState(true);

  // Track if verification has already been attempted
  const verificationAttempted = useRef(false);
  const verificationTimeoutRef = useRef(null);

  // Extract session_id from URL
  const sessionId = searchParams.get('session_id');

  // Debug effect - log state changes
  useEffect(() => {
    console.log('🔍 [DEBUG] State Update:', {
      orderDetails: orderDetails ? { orderNumber: orderDetails.orderNumber, total: orderDetails.total } : null,
      orderLoading,
      isVerifying,
      verificationSuccess,
      sessionId,
    });
  }, [orderDetails, orderLoading, isVerifying, verificationSuccess, sessionId]);

  useEffect(() => {
    // Prevent running verification multiple times
    if (verificationAttempted.current) {
      console.log('⏭️  Verification already attempted, skipping...');
      return;
    }

    // If verification is already complete, don't run again
    if (verificationSuccess || verificationError) {
      console.log('✅ Verification already complete');
      return;
    }

    const verifyCheckout = async () => {
      if (!sessionId) {
        console.error('❌ No session ID in URL');
        setVerificationError('No session ID found. Payment verification failed.');
        setIsVerifying(false);
        verificationAttempted.current = true;
        return;
      }

      try {
        console.log('🔐 Verifying checkout session:', sessionId);
        setIsVerifying(true);
        verificationAttempted.current = true;

        // Wait a moment for backend webhook to process
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Verify session on backend
        await handleSuccessRedirect(sessionId);

        console.log('✅ Checkout verification successful!');
        setVerificationSuccess(true);
        setIsVerifying(false);

        // Clear cart after successful payment
        // Use timeout to ensure state is updated
        verificationTimeoutRef.current = setTimeout(() => {
          clearCart();
          success('Cart cleared! Your order is being processed.');
          
          // Fetch order details from backend
          console.log('⏱️  Timeout fired, calling fetchOrderDetails with sessionId:', sessionId);
          fetchOrderDetails(sessionId);
        }, 1500);
      } catch (err) {
        console.error('❌ Verification failed:', err.message);
        
        // Don't retry on error - show error to user
        setVerificationError(
          err.message || 'Failed to verify payment. Please contact support.'
        );
        setIsVerifying(false);
        showError(err.message);
      }
    };

    verifyCheckout();

    // Cleanup timeout on unmount
    return () => {
      if (verificationTimeoutRef.current) {
        clearTimeout(verificationTimeoutRef.current);
      }
    };
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Fetch order details from backend using session ID
   */
  const fetchOrderDetails = async (sessionId) => {
    try {
      console.log('🔄 Fetching order details for session:', sessionId);
      setOrderLoading(true);
      
      const order = await checkoutService.getOrderBySessionId(sessionId);
      
      console.log('✅ Order details received from API:', {
        orderNumber: order?.orderNumber,
        total: order?.total,
        hasOrder: !!order,
        hasOrderNumber: !!order?.orderNumber,
        hasTotal: !!order?.total,
      });
      
      if (!order) {
        console.warn('⚠️  Order is null or undefined');
        setOrderLoading(false);
        return;
      }
      
      console.log('📝 Setting order details to state...');
      setOrderDetails(order);
      
      console.log('✅ Order details set successfully');
      setOrderLoading(false);
    } catch (err) {
      console.error('⚠️  Could not fetch order details:', {
        message: err.message,
        status: err.status,
        sessionId,
      });
      // Don't show error - still valid order confirmation even if fetch fails
      setOrderLoading(false);
    }
  };

  // Loading state
  if (isVerifying) {
    return (
      <PageContainer>
        <ContentContainer>
          <LoadingContainer>
            <Spinner />
            <LoadingText>Verifying your payment...</LoadingText>
            <LoadingText style={{ fontSize: '14px', color: '#9ca3af' }}>
              This may take a moment. Please don't leave this page.
            </LoadingText>
          </LoadingContainer>
        </ContentContainer>
      </PageContainer>
    );
  }

  // Error state
  if (verificationError) {
    return (
      <PageContainer>
        <ContentContainer>
          <ErrorContainer>
            <ErrorIcon>⚠️</ErrorIcon>
            <ErrorTitle>Verification Failed</ErrorTitle>
            <ErrorMessage>{verificationError}</ErrorMessage>
            <ErrorMessage style={{ fontSize: '14px' }}>
              Session ID: <code>{sessionId}</code>
            </ErrorMessage>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <ActionButton href="/cart">Back to Cart</ActionButton>
              <ActionButton href="/products">Continue Shopping</ActionButton>
            </div>
            <ErrorMessage style={{ marginTop: '20px', fontSize: '12px' }}>
              If the problem persists, please contact our support team.
            </ErrorMessage>
          </ErrorContainer>
        </ContentContainer>
      </PageContainer>
    );
  }

  // Success state
  if (verificationSuccess || (order && order.id)) {
    const displayOrder = orderDetails || order;
    const displayItems = orderDetails?.items || order?.items || cartItems;
    const displayTotal = orderDetails?.total || order?.totals?.total || cartSummary.total;

    return (
      <PageContainer>
        <ContentContainer>
          {/* Order Confirmation Card */}
          <OrderConfirmationCard
            orderNumber={orderDetails?.orderNumber || order?.number || 'PENDING'}
            orderId={orderDetails?._id || order?.id}
            items={displayItems}
            total={displayTotal}
            email={''} // Get from user profile if needed
            paymentStatus={orderDetails?.paymentStatus || 'paid'}
            message="Your payment has been successfully processed! Your order is now being prepared for shipment."
          />

          {/* Order Summary */}
          <SummarySection>
            <CheckoutSummary
              totals={
                orderDetails 
                  ? {
                      subtotal: orderDetails.subtotal,
                      tax: orderDetails.tax,
                      total: orderDetails.total,
                    }
                  : order?.totals || {
                      subtotal: cartSummary.subtotal,
                      tax: cartSummary.tax,
                      total: cartSummary.total,
                    }
              }
              itemCount={displayItems.length}
              title="Final Order Breakdown"
              showBreakdown={true}
              showShippingNote={true}
            />
          </SummarySection>
        </ContentContainer>
      </PageContainer>
    );
  }

  return null;
}
