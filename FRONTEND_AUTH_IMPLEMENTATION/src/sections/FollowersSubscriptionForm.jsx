'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useSubscribeFollower } from '@/api/hooks/useFollowers';
import { useToast } from '@/components/ui/Toast';

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const InputWithIcon = styled.div`
  position: relative;
  display: flex;
  align-items: center;

  svg {
    position: absolute;
    left: 12px;
    width: 18px;
    height: 18px;
    color: #9ca3af;
    pointer-events: none;
  }

  input {
    padding-left: 40px;
  }
`;

const SubscribeButton = styled(Button)`
  background: linear-gradient(135deg, #5b4dff 0%, #4c3fd1 100%);
  color: white;
  font-weight: 600;
  padding: 12px 24px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(91, 77, 255, 0.3);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: 640px) {
    padding: 10px 16px;
    font-size: 14px;
  }
`;

const SuccessMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  border-radius: 8px;
  color: #047857;
  font-size: 14px;
  font-weight: 500;

  svg {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
  }
`;

const ErrorMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #dc2626;
  font-size: 14px;
  font-weight: 500;

  svg {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
  }
`;

const DuplicateContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const DuplicateText = styled.p`
  font-size: 14px;
  color: #6b7280;
  margin: 0;
`;

const ClearButton = styled.button`
  background: transparent;
  border: 1px solid #d1d5db;
  color: #6b7280;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    background: #f3f4f6;
    border-color: #9ca3af;
  }
`;

/**
 * FollowersSubscriptionForm
 * Email subscription form for followers
 * Shows success/error/duplicate states
 */
export default function FollowersSubscriptionForm({ onSuccess }) {
  const [email, setEmail] = useState('');
  const [submittedEmail, setSubmittedEmail] = useState('');
  const toast = useToast();
  const { mutate: subscribe, isPending, isSuccess, error, data } = useSubscribeFollower();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error('Please enter your email');
      return;
    }

    subscribe(email, {
      onSuccess: (result) => {
        setSubmittedEmail(email);
        setEmail('');
        
        if (result.isDuplicate) {
          toast.info('Already a follower!');
        } else {
          toast.success(`Welcome! You're now follower #${result.totalFollowers}`);
        }

        if (onSuccess) {
          onSuccess(result);
        }
      },
      onError: (err) => {
        const errorMsg = err.message || 'Failed to subscribe';
        toast.error(errorMsg);
      },
    });
  };

  // Show success state
  if (isSuccess) {
    return (
      <FormContainer>
        <SuccessMessage>
          <CheckCircle />
          <div>
            {data?.isDuplicate ? (
              <span>You're already a follower! 🎉</span>
            ) : (
              <span>Welcome to the kingdom! Check your email for updates.</span>
            )}
          </div>
        </SuccessMessage>

        <DuplicateContainer>
          <DuplicateText>
            {data?.isDuplicate
              ? 'We already have your email registered.'
              : `You're now follower #${data?.totalFollowers || '?'}`}
          </DuplicateText>
          <ClearButton onClick={() => setSubmittedEmail('')}>
            Subscribe Another Email
          </ClearButton>
        </DuplicateContainer>
      </FormContainer>
    );
  }

  return (
    <FormContainer>
      <FormGroup>
        <Label htmlFor="email">Email Address</Label>
        <InputWithIcon>
          <Mail />
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isPending}
            onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e)}
          />
        </InputWithIcon>
      </FormGroup>

      {error && (
        <ErrorMessage>
          <AlertCircle />
          <span>{error.message}</span>
        </ErrorMessage>
      )}

      <SubscribeButton onClick={handleSubmit} disabled={isPending}>
        {isPending ? (
          <>
            <span>Subscribing...</span>
          </>
        ) : (
          <>
            <Mail size={18} />
            <span>Join the Kingdom</span>
          </>
        )}
      </SubscribeButton>

      <p
        style={{
          fontSize: '12px',
          color: '#9ca3af',
          textAlign: 'center',
          margin: '4px 0 0 0',
        }}
      >
        We'll never spam you. Unsubscribe anytime.
      </p>
    </FormContainer>
  );
}
