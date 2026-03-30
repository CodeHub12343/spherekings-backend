'use client';
export const dynamic = 'force-dynamic';

import styled from 'styled-components';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useRaffleWinnerDetails, useMarkWinnerShipped } from '@/api/hooks/useRaffle';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { ArrowLeft, MapPin, Mail, Phone, Package, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import Button from '@/components/ui/Button';

// ==================== STYLED COMPONENTS ====================

const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 20px;

  @media (max-width: 768px) {
    padding: 24px 16px;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: #5b4dff;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  transition: color 0.2s;
  padding: 0;

  &:hover {
    color: #4c3fd1;
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const PageTitle = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 22px;
  }
`;

const StatusSection = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 24px;
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  background: ${(props) => {
    if (props.status === 'completed' || props.status === 'shipped') return '#dbeafe';
    if (props.status === 'pending' || props.status === 'processing') return '#fef3c7';
    return '#f3f4f6';
  }};
  color: ${(props) => {
    if (props.status === 'completed' || props.status === 'shipped') return '#0369a1';
    if (props.status === 'pending' || props.status === 'processing') return '#92400e';
    return '#4b5563';
  }};
`;

const Card = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const CardTitle = styled.h2`
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
  gap: 10px;

  svg {
    width: 18px;
    height: 18px;
    color: #5b4dff;
  }
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
`;

const InfoField = styled.div`
  display: flex;
  flex-direction: column;
`;

const InfoLabel = styled.label`
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
`;

const InfoValue = styled.div`
  font-size: 14px;
  color: #1f2937;
  font-weight: 500;
  word-break: break-word;
`;

const AddressCard = styled.div`
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  margin-top: 12px;
`;

const AddressText = styled.div`
  font-size: 14px;
  color: #1f2937;
  line-height: 1.6;
  font-weight: 500;

  & + & {
    margin-top: 8px;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;

    button {
      width: 100%;
    }
  }
`;

const MarkShippedButton = styled(Button)`
  background: #10b981;
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background: #059669;
  }

  &:disabled {
    background: #d1d5db;
    cursor: not-allowed;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  color: #6b7280;
`;

const ErrorContainer = styled.div`
  background: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: #dc2626;
  margin-top: 20px;

  svg {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
  }
`;

// ==================== COMPONENT ====================

export default function RaffleWinnerDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const toast = useToast();
  const [isMarking, setIsMarking] = useState(false);

  // Check admin access
  if (user?.role !== 'admin') {
    return (
      <Container>
        <ErrorContainer>
          <AlertCircle />
          <span>You don't have permission to access this page.</span>
        </ErrorContainer>
      </Container>
    );
  }

  const { data: winner, isLoading, error } = useRaffleWinnerDetails(id);
  const { mutate: markShipped } = useMarkWinnerShipped();

  const handleMarkShipped = async () => {
    setIsMarking(true);
    try {
      markShipped(winner._id, {
        onSuccess: (response) => {
          toast.success('Winner marked as shipped!');
          setIsMarking(false);
        },
        onError: (error) => {
          toast.error(error.message || 'Failed to mark as shipped');
          setIsMarking(false);
        },
      });
    } catch (err) {
      toast.error('An error occurred');
      setIsMarking(false);
    }
  };

  if (isLoading) {
    return (
      <Container>
        <LoadingContainer>
          <Loader style={{ animation: 'spin 1s linear infinite' }} />
          Loading winner details...
        </LoadingContainer>
      </Container>
    );
  }

  if (error || !winner) {
    return (
      <Container>
        <Header>
          <BackButton onClick={() => router.back()}>
            <ArrowLeft />
            Back
          </BackButton>
        </Header>
        <ErrorContainer>
          <AlertCircle />
          <span>{error?.message || 'Failed to load winner details'}</span>
        </ErrorContainer>
      </Container>
    );
  }

  const isShipped = winner.status === 'shipped' || winner.status === 'completed';

  return (
    <Container>
      {/* Header */}
      <Header>
        <BackButton onClick={() => router.back()}>
          <ArrowLeft />
          Back to Raffle
        </BackButton>
      </Header>

      {/* Title Section */}
      <div style={{ marginBottom: '32px' }}>
        <PageTitle>Winner Details</PageTitle>
        <StatusSection style={{ marginTop: '12px' }}>
          <StatusBadge status={winner.status}>
            {isShipped ? (
              <>
                <CheckCircle size={14} />
                Shipped
              </>
            ) : (
              <>
                <AlertCircle size={14} />
                Pending Shipment
              </>
            )}
          </StatusBadge>
          <span style={{ fontSize: '13px', color: '#6b7280' }}>
            Entry ID: {winner._id}
          </span>
        </StatusSection>
      </div>

      {/* Personal Information Card */}
      <Card>
        <CardTitle>
          <Mail />
          Personal Information
        </CardTitle>
        <InfoGrid>
          <InfoField>
            <InfoLabel>Full Name</InfoLabel>
            <InfoValue>{winner.fullName}</InfoValue>
          </InfoField>
          <InfoField>
            <InfoLabel>Email</InfoLabel>
            <InfoValue>{winner.email}</InfoValue>
          </InfoField>
          <InfoField>
            <InfoLabel>Phone</InfoLabel>
            <InfoValue>{winner.phone || 'Not provided'}</InfoValue>
          </InfoField>
          <InfoField>
            <InfoLabel>Entry Date</InfoLabel>
            <InfoValue>
              {new Date(winner.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </InfoValue>
          </InfoField>
        </InfoGrid>
      </Card>

      {/* Shipping Address Card */}
      <Card>
        <CardTitle>
          <MapPin />
          Shipping Address
        </CardTitle>
        {winner.shippingAddress ? (
          <AddressCard>
            <AddressText>
              <strong>{winner.shippingAddress.fullName}</strong>
            </AddressText>
            <AddressText>
              {winner.shippingAddress.street}
            </AddressText>
            <AddressText>
              {winner.shippingAddress.city}, {winner.shippingAddress.state} {winner.shippingAddress.zipCode}
            </AddressText>
            <AddressText>
              {winner.shippingAddress.country}
            </AddressText>
            {winner.shippingAddress.phone && (
              <AddressText>
                <strong>Phone:</strong> {winner.shippingAddress.phone}
              </AddressText>
            )}
          </AddressCard>
        ) : (
          <InfoValue style={{ color: '#dc2626' }}>No shipping address provided</InfoValue>
        )}
      </Card>

      {/* Prize Information Card */}
      <Card>
        <CardTitle>
          <Package />
          Prize Information
        </CardTitle>
        <InfoGrid>
          <InfoField>
            <InfoLabel>Prize Value</InfoLabel>
            <InfoValue>${winner.prizeValue?.toFixed(2) || '0.00'}</InfoValue>
          </InfoField>
          <InfoField>
            <InfoLabel>Raffle Cycle</InfoLabel>
            <InfoValue>{winner.cycleId || 'Current Cycle'}</InfoValue>
          </InfoField>
          <InfoField>
            <InfoLabel>Status</InfoLabel>
            <InfoValue>
              <StatusBadge status={winner.status}>
                {winner.status.charAt(0).toUpperCase() + winner.status.slice(1)}
              </StatusBadge>
            </InfoValue>
          </InfoField>
        </InfoGrid>
      </Card>

      {/* Action Buttons */}
      {!isShipped && (
        <Card>
          <CardTitle>Actions</CardTitle>
          <ActionButtons>
            <MarkShippedButton
              onClick={handleMarkShipped}
              disabled={isMarking}
            >
              {isMarking ? (
                <>
                  <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  Marking...
                </>
              ) : (
                <>
                  <CheckCircle size={16} />
                  Mark as Shipped
                </>
              )}
            </MarkShippedButton>
          </ActionButtons>
        </Card>
      )}

      {/* Shipped Confirmation */}
      {isShipped && (
        <Card style={{ background: '#ecfdf5', borderColor: '#a7f3d0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#059669' }}>
            <CheckCircle size={20} />
            <span style={{ fontWeight: 600 }}>This winner's prize has been shipped!</span>
          </div>
        </Card>
      )}

      <style>
        {`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
    </Container>
  );
}
