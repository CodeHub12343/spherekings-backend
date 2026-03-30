'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import Link from 'next/link';

import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { validateRegisterForm } from '@/utils/validation';

const PageContainer = styled.div`
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: linear-gradient(135deg, #5b4dff 0%, #0f172a 100%);

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const LeftSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  color: white;

  @media (max-width: 768px) {
    display: none;
  }
`;

const BrandLogo = styled.h1`
  font-size: 36px;
  font-weight: 700;
  margin: 0 0 16px 0;
  letter-spacing: -0.5px;
`;

const BrandSubtitle = styled.p`
  font-size: 18px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  max-width: 300px;
  text-align: center;
  line-height: 1.6;
`;

const RightSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  overflow-y: auto;

  @media (max-width: 768px) {
    background: #ffffff;
    padding: 24px;
  }
`;

const FormContainer = styled(motion.div)`
  width: 100%;
  max-width: 420px;
  background: white;
  border-radius: 12px;
  padding: 48px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);

  @media (max-width: 768px) {
    background: transparent;
    box-shadow: none;
    padding: 0;
    max-width: 100%;
  }
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

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
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

const PasswordHint = styled.p`
  font-size: 12px;
  color: #7c3aed;
  margin: 4px 0 0 0;
  line-height: 1.4;

  strong {
    font-weight: 600;
  }
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin: 16px 0;
`;

const CheckboxInput = styled.input`
  width: 18px;
  height: 18px;
  margin-top: 2px;
  cursor: pointer;
  accent-color: #5b4dff;
  
  &:focus {
    outline: 2px solid #5b4dff;
    outline-offset: 2px;
  }
`;

const CheckboxLabel = styled.label`
  font-size: 14px;
  color: #374151;
  cursor: pointer;
  line-height: 1.5;
  flex: 1;

  a {
    color: #5b4dff;
    text-decoration: none;
    font-weight: 600;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const CheckboxError = styled.p`
  font-size: 12px;
  color: #dc2626;
  margin: 0;
`;

const SubmitButton = styled(Button)`
  margin-top: 8px;
`;

const LoginLink = styled.div`
  text-align: center;
  font-size: 14px;
  font-weight: 400;
  color: #6b7280;
  margin-top: 24px;

  a {
    color: #5b4dff;
    text-decoration: none;
    font-weight: 600;
    transition: color 0.2s ease;

    &:hover {
      color: #4c3fcc;
    }
  }
`;


function RegisterPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register, isAuthenticated, isLoading: authLoading } = useAuth();
  const { success, error } = useToast();

  // Capture affiliate ref parameter from URL (?ref=AFFILIATE_CODE)
  const affiliateRef = searchParams.get('ref') || '';

  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      router.push('/products');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: ''
      }));
    }

    setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setErrors({});

    const { isValid, errors: validationErrors } = validateRegisterForm(formData);

    if (!isValid) {
      setErrors(validationErrors);
      error('Please fix the errors below');
      return;
    }

    setIsLoading(true);

    try {
      // Pass affiliate ref parameter to register function
      await register({
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        firstName: formData.firstName,
        lastName: formData.lastName,
        agreeToTerms: formData.agreeToTerms,
        ref: affiliateRef // ← Include affiliate ref from URL
      });

      success('Registration successful! Redirecting...');

      setTimeout(() => {
        router.push('/products');
      }, 500);
    } catch (err) {
      const errorMessage = err?.message || 'Registration failed. Please try again.';

      if (err?.status === 409) {
        setServerError('Email already in use. Please use a different email.');
      } else {
        setServerError(errorMessage);
      }

      error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageContainer>
      <LeftSection>
        <BrandLogo>Spherekings</BrandLogo>
        <BrandSubtitle>
          Join thousands of sellers and affiliates earning with Spherekings
        </BrandSubtitle>
      </LeftSection>

      <RightSection>
        <FormContainer
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Title>Create Account</Title>
          <Subtitle>Start your journey with us today</Subtitle>

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
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                required
                autoComplete="email"
              />
            </FormGroup>

            <FormRow>
              <FormGroup>
                <Input
                  label="First Name"
                  name="firstName"
                  type="text"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={handleChange}
                  error={errors.firstName}
                  required
                  autoComplete="given-name"
                />
              </FormGroup>
              <FormGroup>
                <Input
                  label="Last Name"
                  name="lastName"
                  type="text"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={handleChange}
                  error={errors.lastName}
                  required
                  autoComplete="family-name"
                />
              </FormGroup>
            </FormRow>

            <FormGroup>
              <Input
                label="Password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                required
                hint="At least 8 characters"
                autoComplete="new-password"
              />
              <PasswordHint>
                Must contain: <strong>uppercase</strong>, <strong>lowercase</strong>, <strong>number</strong>, <strong>special char (@$!%*?&)</strong>
              </PasswordHint>
            </FormGroup>

            <FormGroup>
              <Input
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                required
                autoComplete="new-password"
              />
            </FormGroup>

            <CheckboxContainer>
              <CheckboxInput
                type="checkbox"
                id="agreeToTerms"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleChange}
              />
              <div style={{ flex: 1 }}>
                <CheckboxLabel htmlFor="agreeToTerms">
                  I agree to the <a href="/terms" target="_blank" rel="noopener noreferrer">Terms and Conditions</a> and <a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
                </CheckboxLabel>
                {errors.agreeToTerms && (
                  <CheckboxError>{errors.agreeToTerms}</CheckboxError>
                )}
              </div>
            </CheckboxContainer>

            <SubmitButton
              type="submit"
              size="full"
              loading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </SubmitButton>
          </FormContent>

          <LoginLink>
            Already have an account? <Link href="/login">Sign in</Link>
          </LoginLink>
        </FormContainer>
      </RightSection>
    </PageContainer>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterPageInner />
    </Suspense>
  );
}
