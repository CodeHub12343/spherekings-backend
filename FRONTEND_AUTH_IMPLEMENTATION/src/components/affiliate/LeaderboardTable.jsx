/**
 * Leaderboard Table Component
 * Displays top affiliates by performance metrics
 */

import styled from 'styled-components';
import { Trophy, TrendingUp, Users, DollarSign } from 'lucide-react';

const Container = styled.div`
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const Header = styled.div`
  padding: 24px;
  border-bottom: 1px solid #f0f0f0;
`;

const Title = styled.h2`
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 700;
  color: #333;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Subtitle = styled.p`
  margin: 0;
  font-size: 14px;
  color: #666;
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 16px;
`;

const FilterButton = styled.button`
  padding: 8px 16px;
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  color: #333;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background-color: #e8e8e8;
    border-color: #ccc;
  }

  &.active {
    background-color: #4a90e2;
    color: white;
    border-color: #4a90e2;
  }
`;

const TableWrapper = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  thead {
    background-color: #f9f9f9;
    border-bottom: 2px solid #e0e0e0;
  }

  th {
    padding: 12px 16px;
    text-align: left;
    font-size: 12px;
    font-weight: 600;
    color: #666;
    text-transform: uppercase;
    letter-spacing: 0.5px;

    &:first-child {
      text-align: center;
      width: 60px;
    }
  }

  td {
    padding: 16px;
    border-bottom: 1px solid #f0f0f0;
    font-size: 14px;
    color: #333;

    &:first-child {
      text-align: center;
    }
  }

  tbody tr {
    transition: background-color 0.15s ease;

    &:hover {
      background-color: #f9f9f9;
    }

    &:last-child td {
      border-bottom: none;
    }

    &.top-3 {
      background-color: #fffacd;
    }
  }
`;

const RankBadge = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 16px;
  font-weight: 700;
  background-color: #f0f0f0;
  color: #333;

  ${(props) => {
    switch (props.$rank) {
      case 1:
        return `
          background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
          color: #333;
          box-shadow: 0 4px 12px rgba(255, 215, 0, 0.4);
        `;
      case 2:
        return `
          background: linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 100%);
          color: #333;
          box-shadow: 0 4px 12px rgba(192, 192, 192, 0.4);
        `;
      case 3:
        return `
          background: linear-gradient(135deg, #cd7f32 0%, #e8a760 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(205, 127, 50, 0.4);
        `;
      default:
        return `
          background-color: #f0f0f0;
          color: #666;
        `;
    }
  }}
`;

const AffiliateInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  text-align: left;
`;

const AffiliateAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
  font-weight: 600;
  flex-shrink: 0;
`;

const AffiliateDetails = styled.div``;

const AffiliateName = styled.div`
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
`;

const AffiliateCode = styled.code`
  font-size: 12px;
  color: #999;
  font-family: 'Monaco', 'Courier New', monospace;
`;

const StatCell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const StatValue = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: #333;
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: #999;
`;

const EmptyState = styled.div`
  padding: 48px 24px;
  text-align: center;
  color: #999;

  p {
    margin: 0;
    font-size: 16px;
  }
`;

export const LeaderboardTable = ({
  affiliates = [],
  sortBy = 'totalEarnings',
  onSortChange,
  isLoading = false,
}) => {
  const sortOptions = [
    { value: 'totalEarnings', label: 'By Earnings', icon: DollarSign },
    { value: 'totalSales', label: 'By Sales', icon: TrendingUp },
    { value: 'totalClicks', label: 'By Clicks', icon: Users },
  ];

  const getMedalEmoji = (rank) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return null;
    }
  };

  const getAvatarInitial = (name) => {
    return name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || '?';
  };

  return (
    <Container>
      <Header>
        <Title>
          <Trophy size={24} style={{ color: '#ffd700' }} />
          Top Affiliates
        </Title>
        <Subtitle>
          View the top-performing affiliates on the Sphere of Kings network
        </Subtitle>

        <FilterContainer>
          {sortOptions.map((option) => (
            <FilterButton
              key={option.value}
              className={sortBy === option.value ? 'active' : ''}
              onClick={() => onSortChange?.(option.value)}
            >
              <option.icon size={14} style={{ display: 'inline', marginRight: '4px' }} />
              {option.label}
            </FilterButton>
          ))}
        </FilterContainer>
      </Header>

      {isLoading ? (
        <EmptyState>
          <p>Loading leaderboard...</p>
        </EmptyState>
      ) : affiliates.length === 0 ? (
        <EmptyState>
          <p>No affiliates yet. Be the first to join!</p>
        </EmptyState>
      ) : (
        <TableWrapper>
          <Table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Affiliate</th>
                <th style={{ textAlign: 'right' }}>Total Earnings</th>
                <th style={{ textAlign: 'center' }}>Total Sales</th>
                <th style={{ textAlign: 'center' }}>Total Clicks</th>
                <th style={{ textAlign: 'center' }}>Conversion Rate</th>
              </tr>
            </thead>
            <tbody>
              {affiliates.map((affiliate, index) => {
                const rank = index + 1;
                const isTopThree = rank <= 3;

                return (
                  <tr key={affiliate._id} className={isTopThree ? 'top-3' : ''}>
                    <td>
                      <RankBadge $rank={rank}>
                        {getMedalEmoji(rank) || rank}
                      </RankBadge>
                    </td>
                    <td>
                      <AffiliateInfo>
                        <AffiliateAvatar>
                          {getAvatarInitial(affiliate.userId?.name)}
                        </AffiliateAvatar>
                        <AffiliateDetails>
                          <AffiliateName>
                            {affiliate.userId?.name || 'Unknown'}
                          </AffiliateName>
                          <AffiliateCode>{affiliate.affiliateCode}</AffiliateCode>
                        </AffiliateDetails>
                      </AffiliateInfo>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <StatCell>
                        <StatValue>
                          ${affiliate.totalEarnings?.toFixed(2) || '0.00'}
                        </StatValue>
                      </StatCell>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <StatCell>
                        <StatValue>{affiliate.totalSales || 0}</StatValue>
                      </StatCell>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <StatCell>
                        <StatValue>{affiliate.totalClicks || 0}</StatValue>
                      </StatCell>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <StatCell>
                        <StatValue>
                          {(affiliate.conversionRate || 0).toFixed(1)}%
                        </StatValue>
                      </StatCell>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </TableWrapper>
      )}
    </Container>
  );
};

export default LeaderboardTable;
