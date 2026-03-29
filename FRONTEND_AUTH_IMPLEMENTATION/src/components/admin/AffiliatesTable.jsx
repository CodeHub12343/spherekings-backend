/**
 * AffiliatesTable - Table component for displaying affiliates
 */

'use client';

import styled from 'styled-components';
import { StatusBadge } from './StatusBadge';

const TableContainer = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  thead {
    background: #f9fafb;
    border-bottom: 1px solid #e5e7eb;
  }

  th {
    padding: 12px 16px;
    text-align: left;
    font-size: 12px;
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  td {
    padding: 12px 16px;
    border-bottom: 1px solid #f3f4f6;
    font-size: 13px;
    color: #374151;
  }

  tbody tr {
    transition: background-color 0.2s ease;

    &:hover {
      background-color: #f9fafb;
    }
  }
`;

const LoadingRow = styled.tr`
  td {
    text-align: center;
    padding: 32px 16px;
    color: #9ca3af;
  }
`;

const EmptyRow = styled.tr`
  td {
    text-align: center;
    padding: 32px 16px;
    color: #9ca3af;
  }
`;

const EarningsCell = styled.td`
  font-weight: 600;
  color: #10b981;
`;

interface Affiliate {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  status: string;
  affiliateDetails?: {
    totalCommissionsEarned?: number;
    totalPayoutsReceived?: number;
    availableBalance?: number;
    createdAt?: string;
  };
  commissionStats?: {
    totalAmount: number;
  };
  createdAt: string;
}

interface AffiliatesTableProps {
  affiliates: Affiliate[];
  isLoading?: boolean;
  onAffiliateClick?: (affiliate: Affiliate) => void;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export function AffiliatesTable({
  affiliates = [],
  isLoading = false,
  onAffiliateClick
}: AffiliatesTableProps) {
  if (isLoading) {
    return (
      <TableContainer>
        <Table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Commissions Earned</th>
              <th>Payouts Received</th>
              <th>Status</th>
              <th>Date Joined</th>
            </tr>
          </thead>
          <tbody>
            <LoadingRow>
              <td colSpan={6}>Loading affiliates...</td>
            </LoadingRow>
          </tbody>
        </Table>
      </TableContainer>
    );
  }

  if (affiliates.length === 0) {
    return (
      <TableContainer>
        <Table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Commissions Earned</th>
              <th>Payouts Received</th>
              <th>Status</th>
              <th>Date Joined</th>
            </tr>
          </thead>
          <tbody>
            <EmptyRow>
              <td colSpan={6}>No affiliates found</td>
            </EmptyRow>
          </tbody>
        </Table>
      </TableContainer>
    );
  }

  return (
    <TableContainer>
      <Table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Commissions Earned</th>
            <th>Payouts Received</th>
            <th>Status</th>
            <th>Date Joined</th>
          </tr>
        </thead>
        <tbody>
          {affiliates.map((affiliate) => (
            <tr
              key={affiliate._id || affiliate.id}
              onClick={() => onAffiliateClick?.(affiliate)}
              style={{ cursor: onAffiliateClick ? 'pointer' : 'default' }}
            >
              <td style={{ fontWeight: 500 }}>{affiliate.name}</td>
              <td>{affiliate.email}</td>
              <EarningsCell>
                {formatCurrency(
                  affiliate.affiliateDetails?.totalCommissionsEarned ||
                    affiliate.commissionStats?.totalAmount ||
                    0
                )}
              </EarningsCell>
              <td>
                {formatCurrency(
                  affiliate.affiliateDetails?.totalPayoutsReceived || 0
                )}
              </td>
              <td>
                <StatusBadge status={affiliate.status} />
              </td>
              <td>
                {formatDate(
                  affiliate.affiliateDetails?.createdAt || affiliate.createdAt
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </TableContainer>
  );
}
