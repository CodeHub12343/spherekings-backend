/**
 * Referral Link Card Component
 * Displays affiliate referral URL with copy-to-clipboard functionality
 */

'use client';

import { useState, useRef } from 'react';
import styled from 'styled-components';
import { Copy, Check } from 'lucide-react';

const Card = styled.div`
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const Title = styled.h3`
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
`;

const Description = styled.p`
  margin: 0 0 16px 0;
  font-size: 14px;
  color: #666;
  line-height: 1.5;
`;

const LinkContainer = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const LinkInput = styled.input`
  flex: 1;
  padding: 10px 14px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  font-family: 'Monaco', 'Courier New', monospace;
  background-color: #f9f9f9;
  color: #333;
  cursor: text;
  user-select: all;

  &:focus {
    outline: none;
    border-color: #4a90e2;
    background-color: #fff;
    box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
  }

  &:disabled {
    background-color: #f5f5f5;
    color: #999;
  }
`;

const CopyButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background-color: #357abd;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    background-color: #9ccc65;
    cursor: default;
    transform: none;
  }
`;

const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #4a90e2;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const TopTip = styled.div`
  background-color: #e3f2fd;
  border-left: 4px solid #4a90e2;
  padding: 12px 16px;
  margin-top: 16px;
  border-radius: 4px;
  font-size: 13px;
  color: #1565c0;
  line-height: 1.5;
`;

export const ReferralLinkCard = ({
  referralUrl,
  affiliateCode,
  stats = {
    totalClicks: 0,
    totalConversions: 0,
    conversionRate: 0,
  },
}) => {
  const [copied, setCopied] = useState(false);
  const inputRef = useRef(null);

  const handleCopyToClipboard = async () => {
    if (!referralUrl) return;

    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);

      // Reset after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);

      // Fallback: select text manually
      if (inputRef.current) {
        inputRef.current.select();
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  return (
    <Card>
      <Title>🔗 Your Referral Link</Title>
      <Description>
        Share this link with others to earn commissions on every purchase they make
      </Description>

      <LinkContainer>
        <LinkInput
          ref={inputRef}
          type="text"
          value={referralUrl || ''}
          readOnly
          disabled={!referralUrl}
        />
        <CopyButton
          onClick={handleCopyToClipboard}
          disabled={!referralUrl || copied}
        >
          {copied ? (
            <>
              <Check size={16} />
              Copied!
            </>
          ) : (
            <>
              <Copy size={16} />
              Copy
            </>
          )}
        </CopyButton>
      </LinkContainer>

      <TopTip>
        💡 Tip: Share your link on social media, email, and forums to maximize
        referrals!
      </TopTip>

      {stats && (
        <Stats>
          <StatItem>
            <StatValue>{stats.totalClicks || 0}</StatValue>
            <StatLabel>Total Clicks</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>{stats.totalConversions || 0}</StatValue>
            <StatLabel>Conversions</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>{(stats.conversionRate || 0).toFixed(1)}%</StatValue>
            <StatLabel>Conversion Rate</StatLabel>
          </StatItem>
        </Stats>
      )}
    </Card>
  );
};

export default ReferralLinkCard;
