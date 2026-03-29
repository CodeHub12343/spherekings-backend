/**
 * SponsorshipTierCard Component
 * Displays a sponsorship tier with benefits and pricing
 */

'use client';

import styled from 'styled-components';
import Button from '@/components/ui/Button';

const Card = styled.div`
  background: ${(props) => props.cardColor || '#ffffff'};
  border: 2px solid ${(props) => (props.featured ? '#5b4dff' : '#e5e7eb')};
  border-radius: 12px;
  padding: 32px 24px;
  display: flex;
  flex-direction: column;
  position: relative;
  transition: all 0.3s ease;
  height: 100%;

  ${(props) =>
    props.featured &&
    `
    box-shadow: 0 20px 40px rgba(91, 77, 255, 0.15);
    transform: translateY(-8px);

    &:hover {
      box-shadow: 0 30px 60px rgba(91, 77, 255, 0.25);
    }
  `}

  &:hover {
    border-color: #5b4dff;
  }

  @media (max-width: 768px) {
    padding: 24px 18px;
  }
`;

const Badge = styled.div`
  position: absolute;
  top: -12px;
  right: 24px;
  background: #5b4dff;
  color: white;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Icon = styled.div`
  font-size: 40px;
  margin-bottom: 16px;
`;

const TierName = styled.h3`
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px 0;
  line-height: 1.2;
`;

const TierSlug = styled.p`
  font-size: 12px;
  color: #9ca3af;
  margin: 0 0 16px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const PriceSection = styled.div`
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e5e7eb;
`;

const Price = styled.div`
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-bottom: 8px;

  .currency {
    font-size: 18px;
    color: #6b7280;
  }

  .amount {
    font-size: 48px;
    font-weight: 700;
    color: #1f2937;
  }

  .period {
    font-size: 14px;
    color: #6b7280;
  }
`;

const VideoMentions = styled.div`
  font-size: 14px;
  color: #5b4dff;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;

  .video-icon {
    font-size: 18px;
  }
`;

const PercentageBreakdown = styled.div`
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
`;

const BenefitsSummary = styled.p`
  font-size: 14px;
  color: #4b5563;
  margin: 0 0 20px 0;
  line-height: 1.6;
  font-weight: 500;
`;

const BenefitsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 24px 0;
  flex-grow: 1;

  li {
    font-size: 14px;
    color: #374151;
    padding: 10px 0;
    padding-left: 24px;
    position: relative;
    line-height: 1.5;

    &:before {
      content: '✓';
      position: absolute;
      left: 0;
      color: #10b981;
      font-weight: 700;
      font-size: 16px;
    }
  }
`;

const Description = styled.p`
  font-size: 13px;
  color: #6b7280;
  line-height: 1.6;
  margin-bottom: 20px;
`;

const ButtonWrapper = styled.div`
  display: flex;
  gap: 12px;

  button {
    flex: 1;
  }
`;

const FillPercentage = styled.div`
  font-size: 12px;
  color: #9ca3af;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e5e7eb;
`;

export default function SponsorshipTierCard({
  tier,
  featured = false,
  onSelect,
  showFillPercentage = false,
  actionLabel = 'Select Tier',
  onSecondaryAction,
  secondaryActionLabel,
  disabled = false,
}) {
  const priceInDollars = (tier.price / 100).toFixed(2);
  const videoCount = tier.videoMentions || 0;

  return (
    <Card featured={featured} cardColor={tier.cardColor}>
      {featured && <Badge>{tier.badgeText || 'MOST POPULAR'}</Badge>}

      {tier.icon && <Icon>{tier.icon}</Icon>}

      <TierName>{tier.name}</TierName>
      <TierSlug>{tier.slug}</TierSlug>

      <PriceSection>
        <Price>
          <span className="currency">$</span>
          <span className="amount">{priceInDollars}</span>
          <span className="period">one-time</span>
        </Price>

        <VideoMentions>
          <span className="video-icon">🎬</span>
          <span>{videoCount} video mentions</span>
        </VideoMentions>

        <PercentageBreakdown>
          ${(tier.price / 10000).toFixed(2)} per mention
        </PercentageBreakdown>
      </PriceSection>

      <BenefitsSummary>{tier.benefitsSummary}</BenefitsSummary>

      <BenefitsList>
        {tier.benefits?.map((benefit, idx) => (
          <li key={idx}>{benefit}</li>
        ))}
      </BenefitsList>

      {tier.description && <Description>{tier.description}</Description>}

      {showFillPercentage && (
        <FillPercentage>
          {tier.maxSponsors ? (
            <>
              {tier.sponsorCount || 0} / {tier.maxSponsors} sponsors
              {' '}
              ({Math.round(((tier.sponsorCount || 0) / tier.maxSponsors) * 100)}%)
            </>
          ) : (
            'Unlimited sponsors'
          )}
        </FillPercentage>
      )}

      <ButtonWrapper>
        <Button
          onClick={() => onSelect?.(tier)}
          variant={featured ? 'primary' : 'outline'}
          disabled={disabled}
          fullWidth
        >
          {actionLabel}
        </Button>

        {onSecondaryAction && (
          <Button
            onClick={() => onSecondaryAction?.(tier)}
            variant="ghost"
            disabled={disabled}
            title={secondaryActionLabel}
          >
            ⋮
          </Button>
        )}
      </ButtonWrapper>
    </Card>
  );
}
