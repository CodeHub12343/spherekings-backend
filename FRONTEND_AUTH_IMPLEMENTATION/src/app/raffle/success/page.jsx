'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { CheckCircle, AlertCircle, ArrowRight, Loader } from 'lucide-react';
import Button from '@/components/ui/Button';

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
`;

const Card = styled.div`
  background: white;
  border-radius: 16px;
  padding: 40px;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  text-align: center;

  @media (max-width: 768px) {
    padding: 30px 20px;
  }
`;

const IconContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 24px;

  svg {
    width: 64px;
    height: 64px;
    color: ${(props) => {
      if (props.type === 'success') return '#10b981';
      if (props.type === 'error') return '#dc2626';
      return '#6b7280';
    }};
    animation: ${(props) =>
      props.type === 'loading'
        ? 'spin 1s linear infinite'
        : 'scaleIn 0.5s ease-out'};
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes scaleIn {
    from {
      transform: scale(0.8);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 12px 0;

  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

const Description = styled.p`
  font-size: 16px;
  color: #6b7280;
  margin: 0 0 30px 0;
  line-height: 1.6;
`;

const Details = styled.div`
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 30px;
  text-align: left;
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #e5e7eb;
  font-size: 14px;

  &:last-child {
    border-bottom: none;
  }

  strong {
    color: #1f2937;
    font-weight: 600;
  }

  span {
    color: #6b7280;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const PrimaryButton = styled(Button)`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  svg {
    width: 18px;
    height: 18px;
  }
`;

const SecondaryButton = styled.button`
  background: transparent;
  border: 1px solid #d1d5db;
  color: #374151;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #f3f4f6;
    border-color: #9ca3af;
  }
`;

const RaffleSuccess = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState('loading');
  const [sessionId, setSessionId] = useState(null);

  useEffect(() => {
    const sid = searchParams.get('session_id');
    setSessionId(sid);

    if (!sid) {
      setStatus('error');
      return;
    }

    // Simulate payment verification
    // In production, this would call your backend to verify the session
    const timer = setTimeout(() => {
      setStatus('success');
    }, 2000);

    return () => clearTimeout(timer);
  }, [searchParams]);

  const handleViewEntries = () => {
    router.push('/raffle/my-entries');
  };

  const handleBackHome = () => {
    router.push('/');
  };

  if (status === 'loading') {
    return (
      <Container>
        <Card>
          <IconContainer type="loading">
            <Loader />
          </IconContainer>
          <Title>Processing Payment</Title>
          <Description>
            We're confirming your payment and registering your entry...
          </Description>
        </Card>
      </Container>
    );
  }

  if (status === 'error') {
    return (
      <Container>
        <Card>
          <IconContainer type="error">
            <AlertCircle />
          </IconContainer>
          <Title>Payment Failed</Title>
          <Description>
            We couldn't process your payment. Please try again or contact support if the problem persists.
          </Description>
          <ButtonGroup>
            <PrimaryButton onClick={() => router.push('/')}>
              Retry Entry
            </PrimaryButton>
            <SecondaryButton onClick={handleBackHome}>
              Back to Home
            </SecondaryButton>
          </ButtonGroup>
        </Card>
      </Container>
    );
  }

  return (
    <Container>
      <Card>
        <IconContainer type="success">
          <CheckCircle />
        </IconContainer>
        <Title>Entry Confirmed! 🎉</Title>
        <Description>
          Congratulations! You're now entered in the SphereKings raffle. 
          We've sent a confirmation email with your entry details.
        </Description>

        <Details>
          <DetailRow>
            <strong>Entry Fee:</strong>
            <span>$1.00</span>
          </DetailRow>
          <DetailRow>
            <strong>Status:</strong>
            <span style={{ color: '#10b981', fontWeight: '600' }}>
              ✓ Confirmed
            </span>
          </DetailRow>
          <DetailRow>
            <strong>Session ID:</strong>
            <span style={{ fontSize: '12px', fontFamily: 'monospace' }}>
              {sessionId?.slice(0, 16)}...
            </span>
          </DetailRow>
          <DetailRow>
            <strong>Next Draw:</strong>
            <span>In 14 days</span>
          </DetailRow>
        </Details>

        <ButtonGroup>
          <PrimaryButton onClick={handleViewEntries}>
            View My Entries
            <ArrowRight />
          </PrimaryButton>
          <SecondaryButton onClick={handleBackHome}>
            Back to Home
          </SecondaryButton>
        </ButtonGroup>
      </Card>
    </Container>
  );
};


export default function RaffleSuccessPage() {
  return (
    <Suspense fallback={null}>
      <RaffleSuccess />
    </Suspense>
  );
}
