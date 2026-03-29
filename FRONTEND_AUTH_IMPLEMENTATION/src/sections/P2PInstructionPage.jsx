'use client';

import styled from 'styled-components';
import { Check, Copy, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import Button from '@/components/ui/Button';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: #6b7280;
  margin: 0;
`;

const InfoBox = styled.div`
  background: #f0f4ff;
  border: 1px solid #d1c4ff;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  gap: 12px;

  svg {
    width: 20px;
    height: 20px;
    color: #5b4dff;
    flex-shrink: 0;
    margin-top: 2px;
  }

  p {
    font-size: 13px;
    color: #4c3fd1;
    margin: 0;
    line-height: 1.5;
  }
`;

const DetailCard = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid #e5e7eb;

  &:last-child {
    padding-bottom: 0;
    border-bottom: none;
  }

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
`;

const DetailLabel = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const DetailValue = styled.div`
  font-size: 14px;
  color: #1f2937;
  font-weight: 500;
  font-family: 'Monaco', 'Courier New', monospace;
  word-break: break-word;
`;

const CopyButton = styled.button`
  padding: 6px 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  color: #6b7280;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s ease;

  &:hover {
    background: #f9fafb;
    border-color: #9ca3af;
    color: #374151;
  }

  svg {
    width: 14px;
    height: 14px;
  }

  ${(props) =>
    props.copied &&
    `
      background: #d1fae5;
      color: #059669;
      border-color: #6ee7b7;
    `}
`;

const InstructionsList = styled.ol`
  list-style: decimal;
  padding-left: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 0;

  li {
    color: #374151;
    font-size: 14px;
    line-height: 1.6;

    strong {
      color: #1f2937;
    }
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  flex-direction: column;

  @media (min-width: 640px) {
    flex-direction: row;
  }
`;

const BackButton = styled(Button)`
  background: white;
  color: #5b4dff;
  border: 1px solid #d1d5db;
  flex: 1;

  &:hover {
    background: #f9fafb;
    border-color: #9ca3af;
  }
`;

const ProceedButton = styled(Button)`
  background: #5b4dff;
  color: white;
  flex: 1;

  &:hover:not(:disabled) {
    background: #4c3fd1;
  }

  &:disabled {
    background: #d1d5db;
    cursor: not-allowed;
  }
`;

const P2PInstructionPage = ({ config, paymentMethod, onBack, onContinue, loading }) => {
  const [copied, setCopied] = useState(null);

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  const formatAddress = () => {
    return `${config.street}, ${config.city}, ${config.state} ${config.zipCode}, ${config.country}`;
  };

  const getServiceLabel = (method) => {
    const labels = {
      wise: 'Wise',
      sendwave: 'Sendwave',
      western_union: 'Western Union',
      worldremit: 'WorldRemit',
    };
    return labels[method] || method;
  };

  return (
    <Container>
      <Header>
        <Title>Send Your $1 Entry Fee</Title>
        <Subtitle>via {getServiceLabel(paymentMethod)}</Subtitle>
      </Header>

      <InfoBox>
        <AlertCircle />
        <p>
          You will be opening <strong>{getServiceLabel(paymentMethod)}</strong> to complete this transfer. 
          The payment is completed <strong>person-to-person</strong> outside of this website. Come back here after sending to confirm your entry.
        </p>
      </InfoBox>

      <DetailCard>
        <DetailRow>
          <DetailLabel>Recipient Name</DetailLabel>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <DetailValue>{config.recipientName}</DetailValue>
            <CopyButton
              onClick={() => copyToClipboard(config.recipientName, 'name')}
              copied={copied === 'name'}
            >
              {copied === 'name' ? <Check /> : <Copy />}
            </CopyButton>
          </div>
        </DetailRow>

        <DetailRow>
          <DetailLabel>Address</DetailLabel>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
            <DetailValue>{formatAddress()}</DetailValue>
            <CopyButton
              onClick={() => copyToClipboard(formatAddress(), 'address')}
              copied={copied === 'address'}
            >
              {copied === 'address' ? <Check /> : <Copy />}
            </CopyButton>
          </div>
        </DetailRow>

        {config.recipientPhone && (
          <DetailRow>
            <DetailLabel>Phone</DetailLabel>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <DetailValue>{config.recipientPhone}</DetailValue>
              <CopyButton
                onClick={() => copyToClipboard(config.recipientPhone, 'phone')}
                copied={copied === 'phone'}
              >
                {copied === 'phone' ? <Check /> : <Copy />}
              </CopyButton>
            </div>
          </DetailRow>
        )}

        <DetailRow>
          <DetailLabel>Amount</DetailLabel>
          <DetailValue>{config.amount}</DetailValue>
        </DetailRow>
      </DetailCard>

      <div>
        <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', marginBottom: '12px', marginTop: 0 }}>
          Steps to Complete Your Payment
        </h3>
        <InstructionsList>
          <li>Open your <strong>{getServiceLabel(paymentMethod)}</strong> app</li>
          <li>Send <strong>$1 USD</strong> to the details above</li>
          <li>Take a screenshot of your receipt or note your transaction reference</li>
          <li>Come back here and click "I Have Sent It" to confirm</li>
        </InstructionsList>
      </div>

      <ActionButtons>
        <BackButton onClick={onBack}>Back</BackButton>
        <ProceedButton onClick={onContinue} disabled={loading}>
          {loading ? 'Processing...' : 'I Have Sent It'}
        </ProceedButton>
      </ActionButtons>
    </Container>
  );
};

export default P2PInstructionPage;
