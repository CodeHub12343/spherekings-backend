'use client';

import styled from 'styled-components';
import { Button } from '@/components/ui/Button';
import { AlertCircle } from 'lucide-react';

const ErrorContainer = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 24px;
  display: flex;
  gap: 16px;
  align-items: flex-start;

  @media (max-width: 640px) {
    padding: 16px;
    gap: 12px;
  }
`;

const IconWrapper = styled.div`
  width: 24px;
  height: 24px;
  color: #dc2626;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 24px;
    height: 24px;
  }
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Title = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #991b1b;
  margin: 0;
`;

const Message = styled.p`
  font-size: 14px;
  color: #7f1d1d;
  margin: 0;

  @media (max-width: 640px) {
    font-size: 13px;
  }
`;

const ErrorDetails = styled.div`
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
  padding: 12px;
  font-family: monospace;
  font-size: 12px;
  color: #5f2120;
  max-height: 200px;
  overflow-y: auto;
  margin-top: 8px;

  pre {
    margin: 0;
    white-space: pre-wrap;
    word-break: break-word;
  }
`;

const RetryButton = styled(Button)`
  margin-top: 12px;
  width: fit-content;
  padding: 8px 16px;
  font-size: 14px;
`;

/**
 * CartErrorState Component
 * Displays error messages
 */
export default function CartErrorState({
  error = 'Something went wrong',
  details = null,
  onRetry = () => {},
  showDetails = false,
}) {
  return (
    <ErrorContainer>
      <IconWrapper>
        <AlertCircle />
      </IconWrapper>
      <Content>
        <Title>Error</Title>
        <Message>{error}</Message>
        {showDetails && details && (
          <ErrorDetails>
            <pre>{JSON.stringify(details, null, 2)}</pre>
          </ErrorDetails>
        )}
        <RetryButton onClick={onRetry} size="sm">
          Try Again
        </RetryButton>
      </Content>
    </ErrorContainer>
  );
}
