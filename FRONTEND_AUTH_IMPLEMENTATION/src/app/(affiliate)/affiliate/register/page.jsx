/**
 * Affiliate Registration Page
 * Form for users to register as affiliates
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import {
  useRegisterAffiliate,
  useAffiliateDashboard,
} from '@/hooks/useAffiliates';
import { useAuth } from '@/contexts/AuthContext';
import { AlertCircle, CheckCircle } from 'lucide-react';

const Container = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 40px 24px;
`;

const Card = styled.div`
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 40px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

const Title = styled.h1`
  margin: 0 0 12px 0;
  font-size: 28px;
  font-weight: 700;
  color: #333;
`;

const Subtitle = styled.p`
  margin: 0 0 32px 0;
  font-size: 16px;
  color: #666;
  line-height: 1.5;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: #333;

  span {
    color: #e74c3c;
    margin-left: 2px;
  }
`;

const Input = styled.input`
  padding: 12px 14px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #4a90e2;
    box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
  }

  &:disabled {
    background-color: #f5f5f5;
    color: #999;
    cursor: not-allowed;
  }
`;

const Textarea = styled.textarea`
  padding: 12px 14px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  min-height: 100px;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #4a90e2;
    box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
  }

  &:disabled {
    background-color: #f5f5f5;
    color: #999;
    cursor: not-allowed;
  }
`;

const HelperText = styled.p`
  margin: 0;
  font-size: 12px;
  color: #999;
  line-height: 1.4;
`;

const Alert = styled.div`
  display: flex;
  gap: 12px;
  padding: 16px;
  border-radius: 6px;
  font-size: 14px;
  line-height: 1.5;

  ${(props) => {
    switch (props.$type) {
      case 'success':
        return `
          background-color: #d4edda;
          border-left: 4px solid #28a745;
          color: #155724;
        `;
      case 'error':
        return `
          background-color: #f8d7da;
          border-left: 4px solid #dc3545;
          color: #721c24;
        `;
      case 'info':
        return `
          background-color: #d1ecf1;
          border-left: 4px solid #17a2b8;
          color: #0c5460;
        `;
      default:
        return ``;
    }
  }}
`;

const Button = styled.button`
  padding: 12px 24px;
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background-color: #357abd;
    box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3);
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const LinkText = styled.p`
  text-align: center;
  margin-top: 24px;
  font-size: 14px;
  color: #666;

  a {
    color: #4a90e2;
    text-decoration: none;
    font-weight: 600;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const BenefitsContainer = styled.div`
  background-color: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 32px;
`;

const BenefitsTitle = styled.h3`
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
`;

const BenefitsList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
`;

const BenefitItem = styled.li`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;

  &::before {
    content: '✓';
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    background-color: #28a745;
    color: white;
    border-radius: 50%;
    flex-shrink: 0;
    font-weight: 600;
    font-size: 12px;
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background-color: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
`;

const CheckboxInput = styled.input`
  margin-top: 4px;
  cursor: pointer;
  width: 18px;
  height: 18px;
  flex-shrink: 0;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const CheckboxLabel = styled.label`
  font-size: 14px;
  color: #333;
  cursor: pointer;
  flex: 1;
  line-height: 1.4;

  a {
    color: #4a90e2;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  &:has(input:disabled) {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

export default function AffiliateRegisterPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { dashboard } = useAffiliateDashboard(undefined, false);

  const {
    registerAffiliate,
    isLoading,
    isSuccess,
    error,
  } = useRegisterAffiliate();

  const [formData, setFormData] = useState({
    marketingChannels: '',
    website: '',
    expectedMonthlyReferrals: '',
    termsAccepted: false,
  });

  // Redirect if already an affiliate
  useEffect(() => {
    if (dashboard) {
      router.push('/affiliate/dashboard');
    }
  }, [dashboard, router]);

  // Auto-redirect after successful registration
  useEffect(() => {
    if (isSuccess) {
      // Wait 2 seconds then redirect to dashboard
      const timer = setTimeout(() => {
        router.push('/affiliate/dashboard');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, router]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if authenticated before submitting
    if (!isAuthenticated || !user) {
      router.push('/login?redirect=/affiliate/register');
      return;
    }

    // Ensure termsAccepted is true (double-check, button should be disabled if false)
    if (!formData.termsAccepted) {
      return;
    }
    
    // Prepare payload - convert expectedMonthlyReferrals to number
    const payload = {
      marketingChannels: formData.marketingChannels.trim(),
      website: formData.website.trim(),
      expectedMonthlyReferrals: parseInt(formData.expectedMonthlyReferrals, 10) || 0,
      termsAccepted: formData.termsAccepted,
    };

    registerAffiliate(payload);
  };

  // Show loading state while checking if already an affiliate
  if (!isAuthenticated || !user) {
    return (
      <Container>
        <Card>
          <Title>Join Our Affiliate Program</Title>
          <Subtitle style={{ marginBottom: '32px' }}>
            You need to be logged in to register as an affiliate.
          </Subtitle>
          <Button onClick={() => router.push('/login?redirect=/affiliate/register')}>
            Go to Login
          </Button>
        </Card>
      </Container>
    );
  }

  return (
    <Container>
      <Card>
        {/* Benefits Section */}
        <BenefitsContainer>
          <BenefitsTitle>Why Become an Affiliate?</BenefitsTitle>
          <BenefitsList>
            <BenefitItem>Earn Commissions 💰</BenefitItem>
            <BenefitItem>Real-time Tracking 📊</BenefitItem>
            <BenefitItem>Weekly Payouts 🏦</BenefitItem>
            <BenefitItem>Dedicated Support 📞</BenefitItem>
            <BenefitItem>Marketing Materials 📱</BenefitItem>
            <BenefitItem>Performance Bonuses 🎁</BenefitItem>
          </BenefitsList>
        </BenefitsContainer>

        <Title>Join Our Affiliate Program</Title>
        <Subtitle>
          Start earning commissions by referring Sphere of Kings to your audience.
          Fill out the form below to get started.
        </Subtitle>

        {/* Error Alert */}
        {error && (
          <Alert $type="error">
            <AlertCircle size={16} />
            <div>{error}</div>
          </Alert>
        )}

        {/* Success Alert */}
        {isSuccess && (
          <Alert $type="success">
            <CheckCircle size={16} />
            <div>
              Registration successful! Redirecting to your dashboard...
            </div>
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          {/* User Name Display */}
          <FormGroup>
            <Label>Your Name</Label>
            <Input
              type="text"
              value={user?.name || ''}
              disabled
              style={{ backgroundColor: '#f5f5f5' }}
            />
          </FormGroup>

          {/* Email Display */}
          <FormGroup>
            <Label>Email Address</Label>
            <Input
              type="email"
              value={user?.email || ''}
              disabled
              style={{ backgroundColor: '#f5f5f5' }}
            />
          </FormGroup>

          {/* Marketing Channels */}
          <FormGroup>
            <Label>
              Where will you promote us? <span>*</span>
            </Label>
            <Textarea
              name="marketingChannels"
              value={formData.marketingChannels}
              onChange={handleChange}
              placeholder="e.g., Instagram, YouTube, Email Newsletter, Blog, etc."
              disabled={isLoading}
              required
            />
            <HelperText>
              Tell us about your marketing channels and audience size
            </HelperText>
          </FormGroup>

          {/* Website */}
          <FormGroup>
            <Label>Website or Social Media Profile</Label>
            <Input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="https://yourwebsite.com"
              disabled={isLoading}
            />
            <HelperText>Optional: Link to your primary website or profile</HelperText>
          </FormGroup>

          {/* Expected Referrals */}
          <FormGroup>
            <Label>Expected Monthly Referrals</Label>
            <Input
              type="number"
              name="expectedMonthlyReferrals"
              value={formData.expectedMonthlyReferrals}
              onChange={handleChange}
              placeholder="0"
              min="0"
              disabled={isLoading}
            />
            <HelperText>
              This helps us understand your expected performance
            </HelperText>
          </FormGroup>

          {/* Terms Acceptance */}
          <CheckboxGroup>
            <CheckboxInput
              type="checkbox"
              id="termsAccepted"
              name="termsAccepted"
              checked={formData.termsAccepted}
              onChange={handleChange}
              disabled={isLoading}
            />
            <CheckboxLabel htmlFor="termsAccepted">
              I agree to the{' '}
              <a href="/terms" target="_blank" rel="noopener noreferrer">
                Affiliate Terms & Conditions
              </a>{' '}
              and{' '}
              <a href="/privacy" target="_blank" rel="noopener noreferrer">
                Privacy Policy
              </a>
              <span style={{ color: '#e74c3c' }}>*</span>
            </CheckboxLabel>
          </CheckboxGroup>

          {/* Submit Button */}
          <Button type="submit" disabled={isLoading || !formData.termsAccepted}>
            {isLoading ? 'Creating Account...' : 'Register as Affiliate'}
          </Button>
        </Form>

        <LinkText>
          Already registered? <a href="/affiliate/dashboard">Go to Dashboard</a>
        </LinkText>

        <LinkText styl={{ marginTop: '16px', fontSize: '12px' }}>
          By registering, you agree to our{' '}
          <a href="/terms" style={{ fontSize: '12px' }}>
            Terms & Conditions
          </a>{' '}
          and{' '}
          <a href="/privacy" style={{ fontSize: '12px' }}>
            Privacy Policy
          </a>
        </LinkText>
      </Card>
    </Container>
  );
}
