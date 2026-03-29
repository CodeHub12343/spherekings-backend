/**
 * Affiliate Settings Page
 * Configure payout settings and account preferences
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import {
  useAffiliateDashboard,
  useAffiliatePayoutFlow,
} from '@/hooks/useAffiliates';
import { PayoutSettingsForm } from '@/components/affiliate';
import { useAuth } from '@/contexts/AuthContext';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
`;

const PageHeader = styled.div`
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 2px solid #f0f0f0;
`;

const Title = styled.h1`
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 700;
  color: #333;
`;

const Subtitle = styled.p`
  margin: 0;
  font-size: 14px;
  color: #666;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 60px 24px;
  color: #999;
  font-size: 16px;
`;

const TabContainer = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 32px;
  border-bottom: 2px solid #f0f0f0;
`;

const Tab = styled.button`
  padding: 12px 20px;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  color: #666;
  transition: all 0.2s ease;

  &:hover {
    color: #333;
  }

  &.active {
    color: #4a90e2;
    border-bottom-color: #4a90e2;
  }
`;

const Section = styled.div`
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
`;

const SectionTitle = styled.h2`
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 700;
  color: #333;
`;

const SettingItem = styled.div`
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;

  &:last-child {
    border-bottom: none;
  }
`;

const SettingInfo = styled.div`
  flex: 1;
`;

const SettingLabel = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
`;

const SettingDescription = styled.div`
  font-size: 13px;
  color: #999;
  line-height: 1.4;
`;

const Badge = styled.span`
  display: inline-block;
  padding: 4px 10px;
  background-color: #e3f2fd;
  color: #1565c0;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
`;

const InfoBox = styled.div`
  background-color: #d1ecf1;
  border: 1px solid #bee5eb;
  border-radius: 6px;
  padding: 16px;
  margin-bottom: 24px;
  color: #0c5460;
  font-size: 14px;
  line-height: 1.5;

  strong {
    display: block;
    margin-bottom: 8px;
  }
`;

export default function AffiliateSettingsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('payout');
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const { dashboard, isLoading: dashboardLoading } = useAffiliateDashboard();
  const {
    handleUpdatePayout,
    isLoading: payoutLoading,
    isSuccess,
    error,
  } = useAffiliatePayoutFlow();

  // All hooks MUST be called at the top, before any conditional returns
  // Redirect if not authenticated (only after auth has finished loading)
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // Show success message
  useEffect(() => {
    if (isSuccess) {
      setSuccessMessage('Payout settings updated successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  }, [isSuccess]);

  // Show error message
  useEffect(() => {
    if (error) {
      setErrorMessage(error);
      setTimeout(() => setErrorMessage(null), 3000);
    }
  }, [error]);

  const handlePayoutSubmit = async (formData) => {
    try {
      const success = await handleUpdatePayout(
        formData.payoutMethod,
        formData.payoutData,
        formData.minimumThreshold
      );
      if (success) {
        setSuccessMessage('Payout settings updated successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err) {
      setErrorMessage('Failed to update payout settings');
      setTimeout(() => setErrorMessage(null), 3000);
    }
  };

  // Now we can have early returns for rendering purposes
  if (authLoading) {
    return <LoadingMessage>Loading settings...</LoadingMessage>;
  }

  if (!isAuthenticated) {
    return <LoadingMessage>Redirecting...</LoadingMessage>;
  }

  if (dashboardLoading) {
    return <LoadingMessage>Loading settings...</LoadingMessage>;
  }

  return (
    <Container>
      {/* Header */}
      <PageHeader>
        <Title>⚙️ Settings</Title>
        <Subtitle>Manage your affiliate account settings and preferences</Subtitle>
      </PageHeader>

      {/* Tabs */}
      <TabContainer>
        <Tab
          className={activeTab === 'payout' ? 'active' : ''}
          onClick={() => setActiveTab('payout')}
        >
          Payout Settings
        </Tab>
        <Tab
          className={activeTab === 'account' ? 'active' : ''}
          onClick={() => setActiveTab('account')}
        >
          Account Information
        </Tab>
        <Tab
          className={activeTab === 'security' ? 'active' : ''}
          onClick={() => setActiveTab('security')}
        >
          Security
        </Tab>
      </TabContainer>

      {/* Payout Settings Tab */}
      {activeTab === 'payout' && (
        <div>
          <InfoBox>
            <strong>💡 Tip:</strong>
            Set up your preferred payout method to receive affiliate commissions. You'll receive
            an automatic payout whenever your earnings reach the minimum threshold you set.
          </InfoBox>
          <PayoutSettingsForm
            initialData={{
              payoutMethod: 'stripe',
              payoutData: {},
              minimumThreshold: 50,
            }}
            onSubmit={handlePayoutSubmit}
            isLoading={payoutLoading}
            successMessage={successMessage}
            errorMessage={errorMessage}
          />
        </div>
      )}

      {/* Account Information Tab */}
      {activeTab === 'account' && (
        <div>
          <Section>
            <SectionTitle>Account Information</SectionTitle>

            <SettingItem>
              <SettingInfo>
                <SettingLabel>Affiliate Code</SettingLabel>
                <SettingDescription>
                  Your unique affiliate identifier for tracking referrals
                </SettingDescription>
              </SettingInfo>
              <Badge>{dashboard?.affiliateCode}</Badge>
            </SettingItem>

            <SettingItem>
              <SettingInfo>
                <SettingLabel>Account Status</SettingLabel>
                <SettingDescription>
                  Current status of your affiliate account
                </SettingDescription>
              </SettingInfo>
              <Badge
                style={{
                  backgroundColor:
                    dashboard?.status === 'active'
                      ? '#d4edda'
                      : dashboard?.status === 'pending'
                        ? '#fff3cd'
                        : '#f8d7da',
                  color:
                    dashboard?.status?.isActive
                      ? '#155724'
                      : dashboard?.status?.hasAcceptedTerms
                        ? '#856404'
                        : '#721c24',
                }}
              >
                {dashboard?.status?.isActive ? 'Active' : dashboard?.status?.hasAcceptedTerms ? 'Pending' : 'Inactive'}
              </Badge>
            </SettingItem>

            <SettingItem>
              <SettingInfo>
                <SettingLabel>Join Date</SettingLabel>
                <SettingDescription>
                  When you created your affiliate account
                </SettingDescription>
              </SettingInfo>
              <div>{new Date().toLocaleDateString()}</div>
            </SettingItem>

            <SettingItem>
              <SettingInfo>
                <SettingLabel>Total Earnings</SettingLabel>
                <SettingDescription>
                  Lifetime earnings from affiliate commissions
                </SettingDescription>
              </SettingInfo>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#28a745' }}>
                ${dashboard?.earnings?.totalEarnings?.toFixed(2) || '0.00'}
              </div>
            </SettingItem>
          </Section>

          <Section>
            <SectionTitle>Statistics</SectionTitle>

            <SettingItem>
              <SettingInfo>
                <SettingLabel>Total Referral Clicks</SettingLabel>
                <SettingDescription>
                  Number of people who clicked your referral link
                </SettingDescription>
              </SettingInfo>
              <Badge>{dashboard?.stats?.totalClicks || 0}</Badge>
            </SettingItem>

            <SettingItem>
              <SettingInfo>
                <SettingLabel>Total Conversions</SettingLabel>
                <SettingDescription>
                  Number of referred customers who made a purchase
                </SettingDescription>
              </SettingInfo>
              <Badge>{dashboard?.stats?.totalConversions || 0}</Badge>
            </SettingItem>

            <SettingItem>
              <SettingInfo>
                <SettingLabel>Conversion Rate</SettingLabel>
                <SettingDescription>
                  Percentage of clicks that resulted in a purchase
                </SettingDescription>
              </SettingInfo>
              <Badge>{(dashboard?.stats?.conversionRate || 0).toFixed(1)}%</Badge>
            </SettingItem>
          </Section>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div>
          <InfoBox>
            <strong>🔒 Security:</strong>
            For additional security options like two-factor authentication, please visit your
            main account settings.
          </InfoBox>

          <Section>
            <SectionTitle>Password & Authentication</SectionTitle>

            <SettingItem>
              <SettingInfo>
                <SettingLabel>Password</SettingLabel>
                <SettingDescription>
                  Change your account password regularly for security
                </SettingDescription>
              </SettingInfo>
              <button
                style={{
                  padding: '8px 16px',
                  background: '#f5f5f5',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                }}
                onClick={() => router.push('/settings/password')}
              >
                Change Password
              </button>
            </SettingItem>

            <SettingItem>
              <SettingInfo>
                <SettingLabel>Two-Factor Authentication</SettingLabel>
                <SettingDescription>
                  Add an extra layer of security to your account
                </SettingDescription>
              </SettingInfo>
              <button
                style={{
                  padding: '8px 16px',
                  background: '#f5f5f5',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                }}
                onClick={() => router.push('/settings/2fa')}
              >
                Enable 2FA
              </button>
            </SettingItem>
          </Section>

          <Section>
            <SectionTitle>Active Sessions</SectionTitle>
            <SettingItem>
              <SettingInfo>
                <SettingLabel>Sessions</SettingLabel>
                <SettingDescription>
                  Manage your active login sessions and devices
                </SettingDescription>
              </SettingInfo>
              <button
                style={{
                  padding: '8px 16px',
                  background: '#f5f5f5',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                }}
                onClick={() => router.push('/settings/sessions')}
              >
                View Sessions
              </button>
            </SettingItem>
          </Section>
        </div>
      )}
    </Container>
  );
}
