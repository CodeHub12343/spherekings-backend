'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { useToast } from '@/components/ui/Toast';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { validateEmail } from '@/utils/validation';
import { authService } from '@/api/services/authService';

const PageContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #5b4dff 0%, #0f172a 100%);
  padding: 24px;
`;

const FormContainer = styled(motion.div)`
  width: 100%;
  max-width: 420px;
  background: white;
  border-radius: 12px;
  padding: 48px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const Title = styled.h2`
  font-size: 28px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 8px 0;
  text-align: center;
`;

const Subtitle = styled.p`
  font-size: 14px;
  font-weight: 400;
  color: #6b7280;
  margin: 0 0 32px 0;
  text-align: center;
`;

const FormContent = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SuccessMessage = styled(motion.div)`
  padding: 16px;
  background-color: #f0fdf4;
  border: 1px solid #86efac;
  border-radius: 8px;
  color: #166534;
  font-size: 14px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
`;

const SuccessIcon = styled.div`
  width: 48px;
  height: 48px;
  background-color: #10b981;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const ErrorAlert = styled(motion.div)`
  padding: 12px 16px;
  background-color: #fef2f2;
  border: 1px solid #fee2e2;
  border-radius: 8px;
  color: #991b1b;
  font-size: 14px;
  font-weight: 500;
`;

const SubmitButton = styled(Button)`
  margin-top: 8px;
`;

const BackLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #5b4dff;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  margin-top: 24px;
  width: fit-content;
  transition: color 0.2s ease;

  &:hover {
    color: #4c3fcc;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

export default function ForgotPasswordPage() {
  const { success, error } = useToast();

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (emailError) {
      setEmailError('');
    }
    setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setEmailError('');

    const validation = validateEmail(email);
    if (!validation.isValid) {
      setEmailError(validation.error);
      error(validation.error);
      return;
    }

    setIsLoading(true);

    try {
      await authService.forgotPassword(email);
      setIsSubmitted(true);
      success('Check your email for password reset instructions');
    } catch (err) {
      const errorMessage = err?.message || 'Failed to process request. Please try again.';
      setServerError(errorMessage);
      error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageContainer>
      <FormContainer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {isSubmitted ? (
          <>
            <SuccessMessage
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <SuccessIcon>
                <Mail size={24} />
              </SuccessIcon>
              <div>
                <p style={{ margin: 0, fontWeight: 600 }}>Check your email</p>
                <p style={{ margin: '4px 0 0 0', fontSize: 12 }}>
                  We've sent password reset instructions to {email}
                </p>
              </div>
            </SuccessMessage>

            <BackLink href="/login">
              <ArrowLeft /> Back to Login
            </BackLink>
          </>
        ) : (
          <>
            <Title>Forgot Password?</Title>
            <Subtitle>
              Enter your email and we'll send you instructions to reset your password
            </Subtitle>

            {serverError && (
              <ErrorAlert
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                {serverError}
              </ErrorAlert>
            )}

            <FormContent onSubmit={handleSubmit}>
              <FormGroup>
                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={handleChange}
                  error={emailError}
                  required
                  autoComplete="email"
                />
              </FormGroup>

              <SubmitButton
                type="submit"
                size="full"
                loading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : 'Send Reset Email'}
              </SubmitButton>
            </FormContent>

            <BackLink href="/login">
              <ArrowLeft /> Back to Login
            </BackLink>
          </>
        )}
      </FormContainer>
    </PageContainer>
  );
}
