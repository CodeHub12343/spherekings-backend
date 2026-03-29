/**
 * CommissionsTable & PayoutsTable - Tables for commission and payout records
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

const AmountCell = styled.td`
  font-weight: 600;
  color: #10b981;
`;

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
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// ============================================================================
// COMMISSIONS TABLE
// ============================================================================

interface Commission {
  _id?: string;
  id?: string;
  affiliateId?: { name?: string; email?: string } | string;
  commissionAmount: number;
  status: string;
  orderId?: { _id?: string; totalAmount?: number } | string;
  rate?: number;
  createdAt: string;
}

interface CommissionsTableProps {
  commissions: Commission[];
  isLoading?: boolean;
  onCommissionClick?: (commission: Commission) => void;
}

export function CommissionsTable({
  commissions = [],
  isLoading = false,
  onCommissionClick
}: CommissionsTableProps) {
  if (isLoading) {
    return (
      <TableContainer>
        <Table>
          <thead>
            <tr>
              <th>Affiliate</th>
              <th>Commission Amount</th>
              <th>Commission Rate</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            <LoadingRow>
              <td colSpan={5}>Loading commissions...</td>
            </LoadingRow>
          </tbody>
        </Table>
      </TableContainer>
    );
  }

  if (commissions.length === 0) {
    return (
      <TableContainer>
        <Table>
          <thead>
            <tr>
              <th>Affiliate</th>
              <th>Commission Amount</th>
              <th>Commission Rate</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            <EmptyRow>
              <td colSpan={5}>No commissions found</td>
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
            <th>Affiliate</th>
            <th>Commission Amount</th>
            <th>Commission Rate</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {commissions.map((commission) => {
            const affiliateName =
              typeof commission.affiliateId === 'object'
                ? commission.affiliateId?.name
                : commission.affiliateId;

            return (
              <tr
                key={commission._id || commission.id}
                onClick={() => onCommissionClick?.(commission)}
                style={{ cursor: onCommissionClick ? 'pointer' : 'default' }}
              >
                <td>{affiliateName || '-'}</td>
                <AmountCell>{formatCurrency(commission.commissionAmount)}</AmountCell>
                <td>{commission.rate ? `${commission.rate}%` : '-'}</td>
                <td>
                  <StatusBadge status={commission.status} />
                </td>
                <td>{formatDate(commission.createdAt)}</td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </TableContainer>
  );
}

// ============================================================================
// PAYOUTS TABLE
// ============================================================================

interface Payout {
  _id?: string;
  id?: string;
  affiliateId?: { name?: string; email?: string } | string;
  amount: number;
  status: string;
  paymentMethod?: string;
  createdAt: string;
  processedAt?: string;
}

interface PayoutsTableProps {
  payouts: Payout[];
  isLoading?: boolean;
  onPayoutClick?: (payout: Payout) => void;
}

export function PayoutsTable({
  payouts = [],
  isLoading = false,
  onPayoutClick
}: PayoutsTableProps) {
  if (isLoading) {
    return (
      <TableContainer>
        <Table>
          <thead>
            <tr>
              <th>Affiliate</th>
              <th>Amount</th>
              <th>Payment Method</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            <LoadingRow>
              <td colSpan={5}>Loading payouts...</td>
            </LoadingRow>
          </tbody>
        </Table>
      </TableContainer>
    );
  }

  if (payouts.length === 0) {
    return (
      <TableContainer>
        <Table>
          <thead>
            <tr>
              <th>Affiliate</th>
              <th>Amount</th>
              <th>Payment Method</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            <EmptyRow>
              <td colSpan={5}>No payouts found</td>
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
            <th>Affiliate</th>
            <th>Amount</th>
            <th>Payment Method</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {payouts.map((payout) => {
            const affiliateName =
              typeof payout.affiliateId === 'object'
                ? payout.affiliateId?.name
                : payout.affiliateId;

            return (
              <tr
                key={payout._id || payout.id}
                onClick={() => onPayoutClick?.(payout)}
                style={{ cursor: onPayoutClick ? 'pointer' : 'default' }}
              >
                <td>{affiliateName || '-'}</td>
                <AmountCell>{formatCurrency(payout.amount)}</AmountCell>
                <td>{payout.paymentMethod || '-'}</td>
                <td>
                  <StatusBadge status={payout.status} />
                </td>
                <td>{formatDate(payout.createdAt)}</td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </TableContainer>
  );
}
