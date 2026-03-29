'use client';

import styled from 'styled-components';
import { MapPin, Phone, Globe, ExternalLink } from 'lucide-react';

const Card = styled.div`
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  border: 1px solid #f0f0f0;
  height: 100%;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 16px rgba(0, 0, 0, 0.1);
    border-color: #5b4dff;
  }

  @media (max-width: 768px) {
    border-radius: 12px;
  }
`;

const LogoContainer = styled.div`
  width: 100%;
  height: 200px;
  background: linear-gradient(135deg, #f9fafb 0%, #f3f0ff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;

  @media (max-width: 480px) {
    height: 160px;
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
  font-size: 56px;
`;

const BadgeContainer = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const Badge = styled.span`
  background: rgba(91, 77, 255, 0.9);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  backdrop-filter: blur(4px);
`;

const Content = styled.div`
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;

  @media (max-width: 480px) {
    padding: 16px;
    gap: 12px;
  }
`;

const Header = styled.div``;

const Name = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px;

  @media (max-width: 480px) {
    font-size: 16px;
  }
`;

const Address = styled.div`
  font-size: 13px;
  color: #6b7280;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 4px;
`;

const AddressIcon = styled.div`
  flex-shrink: 0;
  margin-top: 2px;
  color: #5b4dff;
`;

const AddressText = styled.div`
  line-height: 1.4;
`;

const City = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #1f2937;
  margin-top: 8px;
`;

const Description = styled.p`
  font-size: 13px;
  color: #6b7280;
  line-height: 1.6;
  margin: 0;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const Actions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid #f3f4f6;
`;

const ActionButton = styled.a`
  flex: 1;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s;
  border: 1px solid transparent;
  cursor: pointer;
  text-align: center;

  svg {
    width: 14px;
    height: 14px;
  }

  &:hover {
    transform: translateY(-2px);
  }

  @media (max-width: 480px) {
    padding: 9px 12px;
    font-size: 12px;
  }
`;

const DirectionsButton = styled(ActionButton)`
  background: linear-gradient(135deg, #5b4dff 0%, #7c3aed 100%);
  color: white;

  &:hover {
    box-shadow: 0 4px 12px rgba(91, 77, 255, 0.4);
  }
`;

const SecondaryButton = styled(ActionButton)`
  background: white;
  color: #6b7280;
  border: 1px solid #e5e7eb;

  &:hover {
    background: #f9fafb;
    border-color: #d1d5db;
    color: #1f2937;
  }
`;

/**
 * Retail Location Card
 * Displays a single retail location with key info and navigation
 */
export default function RetailLocationCard({ location }) {
  const {
    _id,
    name,
    address,
    city,
    state,
    country,
    description,
    logoUrl,
    isFeatured,
  } = location;

  // Build Google Maps URL
  const mapsQuery = encodeURIComponent(`${address}, ${city}, ${state}, ${country}`);
  const mapsUrl = `https://maps.google.com/?q=${mapsQuery}`;

  // Format full address
  const fullAddress = `${address}, ${city}, ${state} ${country}`;

  return (
    <Card>
      <LogoContainer>
        {logoUrl ? (
          <Logo src={logoUrl} alt={name} />
        ) : (
          <LogoPlaceholder>
            <MapPin size={48} />
          </LogoPlaceholder>
        )}
        {isFeatured && (
          <BadgeContainer>
            <Badge>Featured</Badge>
          </BadgeContainer>
        )}
      </LogoContainer>

      <Content>
        <Header>
          <Name>{name}</Name>
          <Address>
            <AddressIcon>
              <MapPin size={16} />
            </AddressIcon>
            <AddressText>{fullAddress}</AddressText>
          </Address>
          <City>
            {city}, {state}
          </City>
        </Header>

        <Description>{description}</Description>

        <Actions>
          <DirectionsButton
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Get directions on Google Maps"
          >
            <MapPin size={14} />
            Directions
          </DirectionsButton>
          <SecondaryButton
            href={`/stores/${_id}`}
            title="View store details"
          >
            <ExternalLink size={14} />
            Details
          </SecondaryButton>
        </Actions>
      </Content>
    </Card>
  );
}
