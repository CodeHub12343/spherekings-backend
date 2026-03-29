'use client';

import styled from 'styled-components';
import { CreditCard, Globe } from 'lucide-react';
import Button from '@/components/ui/Button';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: #6b7280;
  margin: 0;
`;

const MethodsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const MethodCard = styled.button`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  padding: 20px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;

  &:hover {
    border-color: #5b4dff;
    background: #f9f7ff;
  }

  &:focus {
    outline: none;
    border-color: #5b4dff;
    box-shadow: 0 0 0 3px rgba(91, 77, 255, 0.1);
  }

  ${(props) =>
    props.selected &&
    `
      border-color: #5b4dff;
      background: #f9f7ff;
      box-shadow: 0 0 0 3px rgba(91, 77, 255, 0.1);
    `}
`;

const MethodIcon = styled.div`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: #f3f4f6;
  color: #5b4dff;

  svg {
    width: 20px;
    height: 20px;
  }
`;

const MethodName = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
`;

const MethodDescription = styled.div`
  font-size: 13px;
  color: #6b7280;
  line-height: 1.5;
`;

const ServicesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-top: 8px;
`;

const ServiceBadge = styled.div`
  font-size: 12px;
  padding: 6px 10px;
  border-radius: 6px;
  background: #f3f4f6;
  color: #4b5563;
  text-align: center;
  white-space: nowrap;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 16px;

  @media (max-width: 640px) {
    flex-direction: column;
  }
`;

const BackButton = styled(Button)`
  flex: 1;
  background: white;
  color: #5b4dff;
  border: 1px solid #d1d5db;

  &:hover {
    background: #f9fafb;
    border-color: #9ca3af;
  }
`;

const ContinueButton = styled(Button)`
  flex: 1;
  background: #5b4dff;
  color: white;

  &:hover:not(:disabled) {
    background: #4c3fd1;
  }

  &:disabled {
    background: #d1d5db;
    cursor: not-allowed;
  }
`;

const PaymentMethodSelection = ({ selectedMethod, onSelect, onBack, onContinue, loading }) => {
  return (
    <Container>
      <div>
        <Title>Choose Your Payment Method</Title>
        <Subtitle>Select how you'd like to pay your $1 entry fee</Subtitle>
      </div>

      <MethodsGrid>
        {/* Stripe Payment */}
        <MethodCard
          selected={selectedMethod === 'stripe'}
          onClick={() => onSelect('stripe')}
          type="button"
        >
          <MethodIcon>
            <CreditCard />
          </MethodIcon>
          <MethodName>Credit/Debit Card</MethodName>
          <MethodDescription>
            Fast and secure payment via Stripe. Your card details are never stored on our servers.
          </MethodDescription>
        </MethodCard>

        {/* P2P Payment */}
        <MethodCard
          selected={selectedMethod && selectedMethod !== 'stripe'}
          onClick={() => onSelect('p2p')}
          type="button"
        >
          <MethodIcon style={{ background: '#ecfdf5', color: '#059669' }}>
            <Globe />
          </MethodIcon>
          <MethodName>International Transfer</MethodName>
          <MethodDescription>
            Don't have a Stripe account? Send $1 directly to us using any of these services.
          </MethodDescription>
          <ServicesGrid>
            <ServiceBadge>Wise</ServiceBadge>
            <ServiceBadge>Sendwave</ServiceBadge>
            <ServiceBadge>Western Union</ServiceBadge>
            <ServiceBadge>WorldRemit</ServiceBadge>
          </ServicesGrid>
        </MethodCard>
      </MethodsGrid>

      <ActionButtons>
        <BackButton onClick={onBack}>Back</BackButton>
        <ContinueButton
          onClick={onContinue}
          disabled={!selectedMethod || loading}
        >
          {loading ? 'Processing...' : 'Continue to Payment'}
        </ContinueButton>
      </ActionButtons>
    </Container>
  );
};

export default PaymentMethodSelection;
