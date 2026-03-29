/**
 * Sponsorship Tiers Page
 * Display sponsorship tier options and initiate purchases
 */

'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/navigation';
import { useSponsorshipTiers, useInitiatePurchase } from '@/api/hooks/useSponsorship';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toast';
import SponsorshipTierCard from '@/components/sponsorship/SponsorshipTierCard';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

const PageContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  padding: 80px 20px;

  @media (max-width: 768px) {
    padding: 60px 16px;
  }
`;

const ContentWrapper = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 64px;

  @media (max-width: 768px) {
    margin-bottom: 48px;
  }
`;

const Heading = styled.h1`
  font-size: 52px;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 16px 0;
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: 36px;
  }

  @media (max-width: 480px) {
    font-size: 28px;
  }
`;

const Subheading = styled.p`
  font-size: 18px;
  color: #6b7280;
  margin: 0;
  line-height: 1.6;
  max-width: 600px;
  margin: 0 auto;

  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const TiersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 32px;
  margin-bottom: 64px;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;

const LoadingContainer = styled.div`
  text-align: center;
  padding: 60px 20px;

  p {
    font-size: 16px;
    color: #6b7280;
  }
`;

const ErrorContainer = styled.div`
  background: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 24px;
  text-align: center;
  color: #991b1b;

  h3 {
    margin: 0 0 12px 0;
    font-size: 18px;
    font-weight: 600;
  }

  p {
    margin: 0;
    font-size: 14px;
  }
`;

const CTASection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 48px 32px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  @media (max-width: 768px) {
    padding: 32px 24px;
  }
`;

const CTATitle = styled.h2`
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 16px 0;
`;

const CTAText = styled.p`
  font-size: 16px;
  color: #6b7280;
  margin: 0 0 24px 0;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
`;

const PurchaseModal = styled(Modal)`
  .modal-content {
    max-width: 480px;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
  text-align: left;

  &:last-child {
    margin-bottom: 0;
  }
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: #5b4dff;
    box-shadow: 0 0 0 3px rgba(91, 77, 255, 0.1);
  }

  &:disabled {
    background: #f3f4f6;
    cursor: not-allowed;
  }
`;

const ModalActions = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
`;

export default function SponsorshipTiersPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();
  const { data: tiersData, isLoading, error } = useSponsorshipTiers();
  const { mutate: initiatePurchase, isPending: isProcessing } = useInitiatePurchase();

  const [selectedTier, setSelectedTier] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [purchaseData, setPurchaseData] = useState({
    sponsorName: user?.name || '',
    sponsorEmail: user?.email || '',
    sponsorCompany: '',
  });

  const handleTierSelect = (tier) => {
    if (!isAuthenticated) {
      toast.info('Please sign in to purchase a sponsorship');
      router.push('/login');
      return;
    }

    setSelectedTier(tier);
    setPurchaseData((prev) => ({
      ...prev,
      sponsorName: user?.name || '',
      sponsorEmail: user?.email || '',
    }));
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPurchaseData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePurchase = () => {
    if (!selectedTier) return;

    // Validate required fields
    if (!purchaseData.sponsorName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    if (!purchaseData.sponsorEmail.trim()) {
      toast.error('Please enter your email');
      return;
    }

    // Initiate purchase
    initiatePurchase(
      {
        tierId: selectedTier._id,
        sponsorName: purchaseData.sponsorName,
        sponsorEmail: purchaseData.sponsorEmail,
        sponsorCompany: purchaseData.sponsorCompany || undefined,
      },
      {
        onSuccess: (response) => {
          if (response.success && response.checkoutUrl) {
            // Redirect to Stripe checkout
            window.location.href = response.checkoutUrl;
          } else {
            toast.error(response.error || 'Failed to initiate purchase');
          }
        },
        onError: (error) => {
          toast.error('Failed to process sponsorship');
          console.error('Purchase error:', error);
        },
      }
    );
  };

  const tiers = tiersData?.data || [];
  // Sort by displayOrder and separate featured
  const sortedTiers = [...tiers].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  const featuredTier = sortedTiers.find((t) => t.featured);

  return (
    <PageContainer>
      <ContentWrapper>
        <Header>
          <Heading>Sponsorship Tiers</Heading>
          <Subheading>
            Boost your brand visibility with our flexible sponsorship packages. Simple pricing,
            guaranteed video mentions, and measurable results.
          </Subheading>
        </Header>

        {isLoading ? (
          <LoadingContainer>
            <p>Loading sponsorship tiers...</p>
          </LoadingContainer>
        ) : error ? (
          <ErrorContainer>
            <h3>Unable to Load Tiers</h3>
            <p>We're having trouble loading sponsorship options. Please try again later.</p>
          </ErrorContainer>
        ) : tiers.length === 0 ? (
          <ErrorContainer>
            <h3>No Tiers Available</h3>
            <p>Sponsorship tiers are not currently available. Please check back later.</p>
          </ErrorContainer>
        ) : (
          <>
            <TiersGrid>
              {sortedTiers.map((tier) => (
                <SponsorshipTierCard
                  key={tier._id}
                  tier={tier}
                  featured={tier.featured !== false && tier === featuredTier}
                  onSelect={handleTierSelect}
                  actionLabel="Choose Plan"
                />
              ))}
            </TiersGrid>

            <CTASection>
              <CTATitle>Have Questions?</CTATitle>
              <CTAText>
                Our sponsorship specialists are ready to help you find the perfect package for your
                brand. Get in touch with our team for custom options.
              </CTAText>
              <Button variant="outline" onClick={() => router.push('/contact')}>
                Contact Us
              </Button>
            </CTASection>
          </>
        )}
      </ContentWrapper>

      <PurchaseModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedTier(null);
        }}
        title={`Complete Your Purchase: ${selectedTier?.name}`}
      >
        <FormGroup>
          <Label>Your Name *</Label>
          <Input
            type="text"
            name="sponsorName"
            value={purchaseData.sponsorName}
            onChange={handleInputChange}
            placeholder="Your full name"
            disabled={isProcessing}
          />
        </FormGroup>

        <FormGroup>
          <Label>Email Address *</Label>
          <Input
            type="email"
            name="sponsorEmail"
            value={purchaseData.sponsorEmail}
            onChange={handleInputChange}
            placeholder="your@email.com"
            disabled={isProcessing}
          />
        </FormGroup>

        <FormGroup>
          <Label>Company (Optional)</Label>
          <Input
            type="text"
            name="sponsorCompany"
            value={purchaseData.sponsorCompany}
            onChange={handleInputChange}
            placeholder="Your company name"
            disabled={isProcessing}
          />
        </FormGroup>

        <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#f3f4f6', borderRadius: '6px' }}>
          <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
            <strong>Price:</strong> ${(selectedTier?.price / 100).toFixed(2)}
          </p>
          <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#6b7280' }}>
            <strong>Videos:</strong> {selectedTier?.videoMentions} mentions included
          </p>
        </div>

        <ModalActions>
          <Button
            variant="ghost"
            onClick={() => {
              setShowModal(false);
              setSelectedTier(null);
            }}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handlePurchase}
            disabled={isProcessing}
            style={{ flex: 1 }}
          >
            {isProcessing ? 'Processing...' : 'Proceed to Payment'}
          </Button>
        </ModalActions>
      </PurchaseModal>
    </PageContainer>
  );
}
