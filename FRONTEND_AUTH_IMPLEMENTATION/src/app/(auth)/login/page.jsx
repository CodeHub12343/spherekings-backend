'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import Link from 'next/link';

import { useAuth } from '@/contexts/AuthContext';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/components/ui/Toast';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { validateLoginForm } from '@/utils/validation';

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

const SubmitButton = styled(Button)`
  margin-top: 8px;
`;

const FooterLinks = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 24px;
  font-size: 14px;
  flex-wrap: wrap;
  gap: 8px;

  a {
    color: #5b4dff;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s ease;

    &:hover {
      color: #4c3fcc;
    }
  }
`;

const SignUpLink = styled.div`
  text-align: center;
  font-size: 14px;
  font-weight: 400;
  color: #6b7280;
  margin-top: 16px;

  a {
    color: #5b4dff;
    text-decoration: none;
    font-weight: 600;

    &:hover {
      color: #4c3fcc;
    }
  }
`;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const { success, error } = useToast();
  const { token } = useAuthStore();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  // Get redirect param from URL - defaults to /products
  const redirectPath = searchParams.get('redirect') || '/products';

  // Only redirect if BOTH AuthContext AND Zustand agree user is authenticated
  useEffect(() => {
    // Wait to ensure auth is fully loaded before redirecting
    if (!hasCheckedAuth && !authLoading) {
      setHasCheckedAuth(true);
    }
  }, [authLoading, hasCheckedAuth]);

  useEffect(() => {
    // Only redirect if we've checked auth and BOTH contexts confirm authentication
    if (hasCheckedAuth && isAuthenticated && token) {
      router.push(redirectPath);
    }
  }, [hasCheckedAuth, isAuthenticated, token, router, redirectPath]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
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

    const { isValid, errors: validationErrors } = validateLoginForm(formData);

    if (!isValid) {
      setErrors(validationErrors);
      error('Please fix the errors below');
      return;
    }

    setIsLoading(true);

    try {
      const response = await login({
        email: formData.email,
        password: formData.password
      });

      // Sync Zustand store with login response
      // This fixes the redirect loop between login and form pages
      if (response?.accessToken) {
        useAuthStore.setState({
          token: response.accessToken,
          refreshToken: response.refreshToken || null,
          user: response.user || null,
          isAuthenticated: true,
          error: null,
        });
      }

      success('Login successful! Redirecting...');

      setTimeout(() => {
        router.push(redirectPath);
      }, 500);
    } catch (err) {
      const errorMessage = err?.message || 'Login failed. Please try again.';

      if (err?.status === 401) {
        setServerError('Invalid email or password.');
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
          Welcome back! Sign in to manage your store and earnings.
        </BrandSubtitle>
      </LeftSection>

      <RightSection>
        <FormContainer
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Title>Welcome Back</Title>
          <Subtitle>Sign in to your account</Subtitle>

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
                autoComplete="current-password"
              />
            </FormGroup>

            <SubmitButton
              type="submit"
              size="full"
              loading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </SubmitButton>
          </FormContent>

          <FooterLinks>
            <Link href="/forgot-password">Forgot password?</Link>
          </FooterLinks>

          <SignUpLink>
            Don't have an account? <Link href="/register">Create one</Link>
          </SignUpLink>
        </FormContainer>
      </RightSection>
    </PageContainer>
  );
}
