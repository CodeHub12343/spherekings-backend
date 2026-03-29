'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useToast } from '@/components/ui/Toast';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { validateResetPasswordForm } from '@/utils/validation';
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

const PasswordStrengthHint = styled.p`
  font-size: 12px;
  color: #6b7280;
  margin: 4px 0 0 0;
  text-align: left;
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

const InvalidTokenAlert = styled.div`
  text-align: center;

  h2 {
    color: #991b1b;
    margin: 0 0 8px 0;
  }

  p {
    color: #6b7280;
    margin: 0 0 24px 0;
    font-size: 14px;
  }
`;

export default function ResetPasswordPage({ params }) {
  const router = useRouter();
  const { success, error } = useToast();

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Check if token is provided
  if (!params?.token) {
    return (
      <PageContainer>
        <FormContainer
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <InvalidTokenAlert>
            <h2>Invalid Reset Link</h2>
            <p>
              The password reset link is invalid or has expired. Please request a new one.
            </p>
            <Link href="/forgot-password">
              <Button>Request New Link</Button>
            </Link>
          </InvalidTokenAlert>
        </FormContainer>
      </PageContainer>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }

    setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setServerError('');

    const { isValid, errors: validationErrors } = validateResetPasswordForm(formData);

    if (!isValid) {
      setErrors(validationErrors);
      error(Object.values(validationErrors)[0]);
      return;
    }

    setIsLoading(true);

    try {
      await authService.resetPassword(
        params.token,
        formData.password,
        formData.confirmPassword
      );

      setIsSubmitted(true);
      success('Password reset successful! Redirecting to login...');

      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err) {
      const errorMessage = err?.message || 'Failed to reset password. Please try again.';
      setServerError(errorMessage);
      error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <PageContainer>
        <FormContainer
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <SuccessMessage
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <SuccessIcon>
              <CheckCircle size={28} />
            </SuccessIcon>
            <div>
              <p style={{ margin: 0, fontWeight: 600 }}>Password Reset Successful</p>
              <p style={{ margin: '4px 0 0 0', fontSize: 12 }}>
                Your password has been reset. Redirecting to login...
              </p>
            </div>
          </SuccessMessage>

          <BackLink href="/login">
            <ArrowLeft /> Back to Login
          </BackLink>
        </FormContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <FormContainer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Title>Reset Password</Title>
        <Subtitle>Enter your new password below</Subtitle>

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
              label="New Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your new password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              required
              autoComplete="new-password"
              icon={
                showPassword ? (
                  <EyeOff
                    size={20}
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ cursor: 'pointer' }}
                  />
                ) : (
                  <Eye
                    size={20}
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ cursor: 'pointer' }}
                  />
                )
              }
            />
            <PasswordStrengthHint>
              Minimum 8 characters: uppercase, lowercase, number, and symbol (@$!%*?&)
            </PasswordStrengthHint>
          </FormGroup>

          <FormGroup>
            <Input
              label="Confirm Password"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Re-enter your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              required
              autoComplete="new-password"
              icon={
                showConfirmPassword ? (
                  <EyeOff
                    size={20}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{ cursor: 'pointer' }}
                  />
                ) : (
                  <Eye
                    size={20}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{ cursor: 'pointer' }}
                  />
                )
              }
            />
          </FormGroup>

          <SubmitButton
            type="submit"
            size="full"
            loading={isLoading}
            disabled={isLoading}
          >
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </SubmitButton>
        </FormContent>

        <BackLink href="/login">
          <ArrowLeft /> Back to Login
        </BackLink>
      </FormContainer>
    </PageContainer>
  );
}
