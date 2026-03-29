/**
 * Affiliate Payout Request Page
 * /affiliate/payouts/request
 *
 * Allows affiliate to submit new payout request
 */

'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { useAuth } from '@/contexts/AuthContext';
import { useRequestPayout } from '@/api/hooks/usePayouts';
import { useAffiliateDashboard } from '@/hooks/useAffiliates';
import PayoutRequestForm from '@/components/payouts/PayoutRequestForm';

const PageContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const PageHeader = styled.div`
  margin-bottom: 30px;

  h1 {
    margin: 0 0 8px 0;
    font-size: 28px;
    font-weight: 700;
  }

  p {
    margin: 0;
    color: #666;
    font-size: 14px;
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: #999;
  font-size: 16px;
`;

const SuccessMessage = styled.div`
  background-color: #d4edda;
  color: #155724;
  padding: 16px;
  border-radius: 4px;
  margin-bottom: 20px;
  border: 1px solid #c3e6cb;
`;

export default function AffiliatePayoutRequestPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, user, updateUser } = useAuth();
  const [availableBalance, setAvailableBalance] = React.useState(0);
  const [successMessage, setSuccessMessage] = React.useState('');
  const [requestedAmount, setRequestedAmount] = React.useState(0);

  // Fetch affiliate dashboard data (includes approved earnings)
  const { dashboard, isLoading: dashboardLoading } = useAffiliateDashboard();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // Get available balance from dashboard approved earnings (not pending)
  // Approved earnings are ready for payout request
  useEffect(() => {
    if (dashboard?.earnings?.approvedEarnings) {
      setAvailableBalance(dashboard.earnings.approvedEarnings);
    } else if (dashboard?.earnings?.totalEarnings) {
      // Fallback to total earnings if approved not available
      setAvailableBalance(dashboard.earnings.totalEarnings);
    }
  }, [dashboard]);

  // Request payout mutation
  const requestMutation = useRequestPayout({
    onSuccess: (data) => {
      // Update the user's available balance locally
      if (user?.affiliateDetails) {
        const updatedAffiliateDetails = {
          ...user.affiliateDetails,
          availableBalance: availableBalance - requestedAmount,
        };
        updateUser({
          affiliateDetails: updatedAffiliateDetails,
        });
      }
      
      setSuccessMessage('Payout request submitted successfully!');
      setTimeout(() => {
        router.push('/affiliate/payouts');
      }, 2000);
    },
    onError: (error) => {
      console.error('Failed to request payout:', error);
    }
  });

  if (authLoading) {
    return (
      <PageContainer>
        <LoadingMessage>Verifying authentication...</LoadingMessage>
      </PageContainer>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (dashboardLoading) {
    return (
      <PageContainer>
        <LoadingMessage>Loading your approved balance...</LoadingMessage>
      </PageContainer>
    );
  }

  const handleSubmit = (formData) => {
    // Store the requested amount for balance update on success
    setRequestedAmount(parseFloat(formData.amount));
    
    // Ensure form data is properly formatted before sending
    const payoutData = {
      amount: parseFloat(formData.amount),
      method: formData.method,
      beneficiary: {
        accountHolderName: formData.beneficiary.accountHolderName,
        accountNumber: formData.beneficiary.accountNumber,
        routingNumber: formData.beneficiary.routingNumber || '',
        bankName: formData.beneficiary.bankName,
      },
      notes: formData.notes || '',
    };
    
    console.log('📤 [PAYOUT-REQUEST] Sending to POST /api/payouts/request', payoutData);
    requestMutation.mutate(payoutData);
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <PageContainer>
      <PageHeader>
        <h1>Request Payout</h1>
        <p>Submit a new affiliate payout request</p>
      </PageHeader>

      {successMessage && (
        <SuccessMessage>{successMessage}</SuccessMessage>
      )}

      <PayoutRequestForm
        availableBalance={availableBalance}
        onSubmit={handleSubmit}
        isLoading={requestMutation.isPending}
        onCancel={handleCancel}
      />
    </PageContainer>
  );
}
