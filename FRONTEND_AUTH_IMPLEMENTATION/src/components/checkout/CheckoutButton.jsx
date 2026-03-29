/**
 * CheckoutButton Component
 * Button to initiate checkout (routes to shipping address form first)
 * 
 * Features:
 * - Redirects to shipping form (first checkout step)
 * - Handles loading state
 * - Shows error messages
 * - Integrates with affiliate tracking
 * - Responsive design
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';

const Button = styled.button`
  background: linear-gradient(135deg, #5b4dff 0%, #4c3fcc 100%);
  color: white;
  border: none;
  padding: 12px 28px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: ${(props) => (props.$fullWidth ? '100%' : 'auto')};

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(91, 77, 255, 0.3);
    background: linear-gradient(135deg, #4c3fcc 0%, #3d305a 100%);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(91, 77, 255, 0.2);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  svg {
    width: 18px;
    height: 18px;
  }

  @media (max-width: 768px) {
    padding: 12px 20px;
    font-size: 14px;
  }
`;

const LoadingSpinner = styled.span`
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const StripeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
  </svg>
);

/**
 * CheckoutButton Component
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.disabled - Disable button
 * @param {boolean} props.fullWidth - Make button full width
 * @param {string} props.label - Button label (default: "Proceed to Checkout")
 * @param {string} props.affiliateId - Optional affiliate ID (stored in header)
 * @param {Function} props.onCheckoutStart - Callback before navigation
 * @param {Function} props.onCheckoutError - Callback on error
 * @returns {JSX.Element}
 */
export default function CheckoutButton({
  disabled = false,
  fullWidth = false,
  label = 'Proceed to Checkout',
  affiliateId = null,
  onCheckoutStart = null,
  onCheckoutError = null,
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleClick = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Callback hook
      onCheckoutStart?.();

      console.log('🛒 Starting checkout flow - routing to shipping page');

      // Navigate to shipping page (first step in checkout)
      router.push('/checkout/shipping');
    } catch (err) {
      console.error('❌ Checkout routing error:', err.message);
      setError(err.message || 'Error starting checkout');
      onCheckoutError?.(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={disabled || isLoading}
      $fullWidth={fullWidth}
      title={error ? `Error: ${error}` : ''}
    >
      {isLoading ? (
        <>
          <LoadingSpinner />
          Processing...
        </>
      ) : (
        <>
          <StripeIcon />
          {label}
        </>
      )}
    </Button>
  );
}
