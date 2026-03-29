'use client';

import { useParams } from 'next/navigation';
import styled from 'styled-components';
import { useRetailLocation } from '@/api/hooks/useRetailLocations';
import { MapPin, Phone, Globe, ExternalLink, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f9fafb 0%, #f3f0ff 100%);
  padding: 40px 20px;

  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const ContentWrapper = styled.div`
  max-width: 1000px;
  margin: 0 auto;
`;

const BackButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  color: #6b7280;
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 24px;
  transition: all 0.2s;

  &:hover {
    background: #f9fafb;
    border-color: #d1d5db;
    color: #1f2937;
  }

  svg {
    width: 16px;
    height: 16px;
  }

  @media (max-width: 768px) {
    margin-bottom: 20px;
    padding: 9px 12px;
    font-size: 13px;
  }
`;

const Card = styled.div`
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f0f0;

  @media (max-width: 768px) {
    border-radius: 12px;
  }
`;

const LogoContainer = styled.div`
  width: 100%;
  height: 400px;
  background: linear-gradient(135deg, #f9fafb 0%, #f3f0ff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;

  @media (max-width: 768px) {
    height: 300px;
  }

  @media (max-width: 480px) {
    height: 220px;
  }
`;

const Logo = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const LogoPlaceholder = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: #d1d5db;
  font-size: 80px;

  @media (max-width: 768px) {
    font-size: 60px;
  }
`;

const BadgeContainer = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;

  @media (max-width: 480px) {
    top: 12px;
    right: 12px;
  }
`;

const Badge = styled.span`
  background: rgba(91, 77, 255, 0.9);
  color: white;
  padding: 8px 16px;
  border-radius: 24px;
  font-size: 13px;
  font-weight: 600;
  backdrop-filter: blur(4px);

  @media (max-width: 480px) {
    padding: 6px 12px;
    font-size: 12px;
  }
`;

const Content = styled.div`
  padding: 48px;

  @media (max-width: 768px) {
    padding: 32px;
  }

  @media (max-width: 480px) {
    padding: 20px;
  }
`;

const Header = styled.div`
  margin-bottom: 40px;

  @media (max-width: 768px) {
    margin-bottom: 28px;
  }
`;

const Title = styled.h1`
  font-size: 36px;
  font-weight: 800;
  color: #1f2937;
  margin: 0 0 12px;
  letter-spacing: -0.5px;

  @media (max-width: 768px) {
    font-size: 28px;
  }

  @media (max-width: 480px) {
    font-size: 24px;
  }
`;

const LocationInfo = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  color: #6b7280;
  font-size: 15px;

  @media (max-width: 480px) {
    font-size: 14px;
  }
`;

const LocationIcon = styled.div`
  flex-shrink: 0;
  margin-top: 2px;
  color: #5b4dff;
`;

const LocationText = styled.div`
  line-height: 1.5;
`;

const SectionDivider = styled.hr`
  border: none;
  border-top: 1px solid #f3f4f6;
  margin: 40px 0;

  @media (max-width: 768px) {
    margin: 28px 0;
  }
`;

const Section = styled.div`
  margin-bottom: 40px;

  @media (max-width: 768px) {
    margin-bottom: 28px;
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 16px;

  @media (max-width: 768px) {
    font-size: 18px;
  }
`;

const DescriptionText = styled.p`
  font-size: 15px;
  line-height: 1.8;
  color: #4b5563;
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;

  @media (max-width: 480px) {
    font-size: 14px;
  }
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;

const InfoItem = styled.div`
  padding: 20px;
  background: #f9fafb;
  border-radius: 12px;
  border: 1px solid #f3f4f6;

  @media (max-width: 480px) {
    padding: 16px;
  }
`;

const InfoLabel = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
`;

const InfoValue = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
  word-break: break-all;

  @media (max-width: 480px) {
    font-size: 14px;
  }
`;

const ActionsContainer = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 40px;
  padding-top: 40px;
  border-top: 1px solid #f3f4f6;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
  }
`;

const ActionButton = styled.a`
  flex: 1;
  padding: 14px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
  border: 1px solid transparent;
  cursor: pointer;
  text-align: center;

  svg {
    width: 16px;
    height: 16px;
  }

  &:hover {
    transform: translateY(-2px);
  }

  @media (max-width: 480px) {
    padding: 12px 16px;
    font-size: 13px;
  }
`;

const DirectionsButton = styled(ActionButton)`
  background: linear-gradient(135deg, #5b4dff 0%, #7c3aed 100%);
  color: white;

  &:hover {
    box-shadow: 0 4px 12px rgba(91, 77, 255, 0.4);
  }
`;

const CallButton = styled(ActionButton)`
  background: white;
  color: #5b4dff;
  border: 1px solid #5b4dff;

  &:hover {
    background: #f3f0ff;
  }
`;

const WebsiteButton = styled(ActionButton)`
  background: white;
  color: #6b7280;
  border: 1px solid #e5e7eb;

  &:hover {
    background: #f9fafb;
    border-color: #d1d5db;
    color: #1f2937;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 100px 20px;
  color: #6b7280;
  font-size: 16px;
`;

const ErrorContainer = styled.div`
  padding: 40px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  text-align: center;
  color: #dc2626;
`;

const ErrorTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px;
`;

const ErrorText = styled.p`
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 24px;
`;

/**
 * Public Retail Location Detail Page
 * Displays full details for a single retail location
 */
export default function RetailLocationDetailPage() {
  const params = useParams();
  const locationId = params?.id;

  const { data: location, isLoading, error } = useRetailLocation(locationId);

  if (isLoading) {
    return (
      <PageContainer>
        <ContentWrapper>
          <LoadingContainer>Loading store details...</LoadingContainer>
        </ContentWrapper>
      </PageContainer>
    );
  }

  if (error || !location) {
    return (
      <PageContainer>
        <ContentWrapper>
          <BackButton href="/stores">
            <ArrowLeft />
            Back to Stores
          </BackButton>
          <ErrorContainer>
            <ErrorTitle>Store Not Found</ErrorTitle>
            <ErrorText>
              {error?.message || 'This store could not be found'}
            </ErrorText>
            <BackButton href="/stores">
              <ArrowLeft />
              Return to Store Locator
            </BackButton>
          </ErrorContainer>
        </ContentWrapper>
      </PageContainer>
    );
  }

  const {
    name,
    address,
    city,
    state,
    country,
    description,
    logoUrl,
    isFeatured,
    phone,
    websiteUrl,
  } = location;

  // Build Google Maps URL
  const mapsQuery = encodeURIComponent(`${address}, ${city}, ${state}, ${country}`);
  const mapsUrl = `https://maps.google.com/?q=${mapsQuery}`;

  // Format full address
  const fullAddress = `${address}, ${city}, ${state} ${country}`;

  return (
    <PageContainer>
      <ContentWrapper>
        <BackButton href="/stores">
          <ArrowLeft />
          Back to Stores
        </BackButton>

        <Card>
          <LogoContainer>
            {logoUrl ? (
              <Logo src={logoUrl} alt={name} />
            ) : (
              <LogoPlaceholder>
                <MapPin size={64} />
              </LogoPlaceholder>
            )}
            {isFeatured && (
              <BadgeContainer>
                <Badge>Featured Store</Badge>
              </BadgeContainer>
            )}
          </LogoContainer>

          <Content>
            <Header>
              <Title>{name}</Title>
              <LocationInfo>
                <LocationIcon>
                  <MapPin size={18} />
                </LocationIcon>
                <LocationText>
                  {fullAddress}
                </LocationText>
              </LocationInfo>
            </Header>

            <Section>
              <SectionTitle>About This Store</SectionTitle>
              <DescriptionText>{description}</DescriptionText>
            </Section>

            <SectionDivider />

            <Section>
              <SectionTitle>Store Information</SectionTitle>
              <InfoGrid>
                <InfoItem>
                  <InfoLabel>City</InfoLabel>
                  <InfoValue>{city}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>State/Province</InfoLabel>
                  <InfoValue>{state}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Country</InfoLabel>
                  <InfoValue>{country}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Address</InfoLabel>
                  <InfoValue>{address}</InfoValue>
                </InfoItem>
                {phone && (
                  <InfoItem>
                    <InfoLabel>Phone</InfoLabel>
                    <InfoValue>{phone}</InfoValue>
                  </InfoItem>
                )}
                {websiteUrl && (
                  <InfoItem>
                    <InfoLabel>Website</InfoLabel>
                    <InfoValue>
                      <a
                        href={websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#5b4dff', textDecoration: 'none' }}
                      >
                        Visit Website
                      </a>
                    </InfoValue>
                  </InfoItem>
                )}
              </InfoGrid>
            </Section>

            <ActionsContainer>
              <DirectionsButton
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Get directions on Google Maps"
              >
                <MapPin size={16} />
                Get Directions
              </DirectionsButton>
              {phone && (
                <CallButton
                  href={`tel:${phone}`}
                  title="Call the store"
                >
                  <Phone size={16} />
                  Call Store
                </CallButton>
              )}
              {websiteUrl && (
                <WebsiteButton
                  href={websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Visit store website"
                >
                  <Globe size={16} />
                  Website
                </WebsiteButton>
              )}
            </ActionsContainer>
          </Content>
        </Card>
      </ContentWrapper>
    </PageContainer>
  );
}
