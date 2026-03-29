'use client';

import styled from 'styled-components';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRaffleAdminStats, useRaffleAdminEntries, useSelectRaffleWinner, useVerifyP2PEntry } from '@/api/hooks/useRaffle';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { Trophy, Users, DollarSign, Calendar, ChevronLeft, ChevronRight, Zap, AlertCircle, Eye } from 'lucide-react';
import Button from '@/components/ui/Button';
import P2PVerificationModal from '@/components/admin/raffle/P2PVerificationModal';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 20px 16px;
  }

  @media (max-width: 480px) {
    padding: 16px 12px;
  }
`;

const Header = styled.div`
  margin-bottom: 32px;

  h1 {
    font-size: 32px;
    font-weight: 700;
    color: #1f2937;
    margin: 0;
    line-height: 1.2;

    @media (max-width: 768px) {
      font-size: 24px;
      margin-bottom: 8px;
    }

    @media (max-width: 480px) {
      font-size: 20px;
    }
  }
`;

// ===== STATS GRID (Mobile Responsive) =====
const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 32px;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    margin-bottom: 24px;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 10px;
    margin-bottom: 20px;
  }
`;

const StatCard = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 14px;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    border-color: #d1d5db;
  }

  svg {
    width: 32px;
    height: 32px;
    color: #5b4dff;
    flex-shrink: 0;

    @media (max-width: 480px) {
      width: 28px;
      height: 28px;
    }
  }

  @media (max-width: 768px) {
    padding: 16px;
    gap: 12px;
  }

  @media (max-width: 480px) {
    padding: 14px;
    gap: 10px;
  }
`;

const StatContent = styled.div`
  flex: 1;
  min-width: 0; // Prevent text overflow
`;

const StatLabel = styled.div`
  font-size: 11px;
  color: #6b7280;
  margin-bottom: 6px;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.5px;

  @media (max-width: 480px) {
    font-size: 10px;
    margin-bottom: 4px;
  }
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  word-break: break-word;

  @media (max-width: 768px) {
    font-size: 20px;
  }

  @media (max-width: 480px) {
    font-size: 18px;
  }
`;

// ===== SECTION =====
const Section = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 20px;
    margin-bottom: 20px;
  }

  @media (max-width: 480px) {
    padding: 16px;
    margin-bottom: 16px;
    border-radius: 8px;
  }
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
  gap: 10px;

  svg {
    width: 20px;
    height: 20px;
    color: #5b4dff;
    flex-shrink: 0;
  }

  @media (max-width: 768px) {
    font-size: 16px;
    margin-bottom: 16px;
  }

  @media (max-width: 480px) {
    font-size: 14px;
    margin-bottom: 12px;
    gap: 8px;

    svg {
      width: 18px;
      height: 18px;
    }
  }
`;

// ===== ACTION BOX (Mobile Responsive) =====
const ActionBox = styled.div`
  background: #f0f4ff;
  border: 1px solid #d1c4ff;
  border-radius: 10px;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;

  @media (max-width: 768px) {
    padding: 16px;
    gap: 12px;
  }

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: stretch;
    padding: 14px;
    gap: 12px;
  }
`;

const ActionText = styled.div`
  font-size: 14px;
  color: #4c3fd1;
  font-weight: 500;
  flex: 1;

  @media (max-width: 480px) {
    font-size: 13px;
    text-align: center;
  }
`;

const SelectWinnerButton = styled(Button)`
  background: #5b4dff;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  font-size: 14px;
  white-space: nowrap;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover:not(:disabled) {
    background: #4c3fd1;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(91, 77, 255, 0.3);
  }

  &:disabled {
    background: #d1d5db;
    cursor: not-allowed;
    opacity: 0.6;
  }

  @media (max-width: 768px) {
    padding: 10px 20px;
    font-size: 13px;
    min-height: 40px;
  }

  @media (max-width: 480px) {
    width: 100%;
    padding: 12px 16px;
    font-size: 14px;
    min-height: 44px;
  }
`;

// ===== TABLE & CARD LAYOUT =====
const TableWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  margin: 0;
  padding: 0;

  @media (max-width: 768px) {
    overflow-x: visible;
    width: calc(100% + 32px);
    margin-left: -16px;
    margin-right: -16px;
    padding: 0 16px;
  }

  @media (max-width: 480px) {
    width: calc(100% + 32px);
    margin-left: -16px;
    margin-right: -16px;
    padding: 0 16px;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  display: table;

  @media (max-width: 768px) {
    display: block;
    border: none;
    width: 100%;
  }

  th {
    background: #f9fafb;
    padding: 14px 12px;
    text-align: left;
    font-size: 12px;
    font-weight: 600;
    color: #374151;
    border-bottom: 2px solid #e5e7eb;
    text-transform: uppercase;
    letter-spacing: 0.5px;

    @media (max-width: 768px) {
      display: none;
    }

    @media (max-width: 480px) {
      padding: 12px 10px;
      font-size: 11px;
    }
  }

  td {
    padding: 16px 12px;
    border-bottom: 1px solid #e5e7eb;
    font-size: 14px;
    color: #374151;

    @media (max-width: 768px) {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 16px;
      border: none;
      border-bottom: 1px solid #f3f4f6;
      font-size: 14px;
      min-height: auto;
      width: 100%;
      box-sizing: border-box;
      gap: 12px;

      &:last-child {
        border-bottom: none;
      }

      &::before {
        content: attr(data-label);
        font-weight: 600;
        color: #6b7280;
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        min-width: 80px;
        flex-shrink: 0;
        text-align: left;
      }
    }

    @media (max-width: 480px) {
      font-size: 13px;
      padding: 12px 14px;
      gap: 10px;

      &::before {
        font-size: 10px;
        min-width: 70px;
      }
    }
  }

  tbody tr {
    @media (max-width: 768px) {
      display: flex;
      flex-direction: column;
      row-gap: 0;
      margin-bottom: 14px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      overflow: hidden;
      background: white;
      width: 100%;
    }

    @media (max-width: 480px) {
      margin-bottom: 12px;
      border-radius: 6px;
      width: 100%;
    }

    &:hover {
      background: #f9fafb;

      @media (max-width: 768px) {
        background: white;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      }
    }

    &:last-child td {
      border-bottom: none;
    }
  }
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  background: ${(props) => {
    if (props.status === 'completed') return '#dbeafe';
    if (props.status === 'pending') return '#fef3c7';
    return '#f3f4f6';
  }};
  color: ${(props) => {
    if (props.status === 'completed') return '#0369a1';
    if (props.status === 'pending') return '#92400e';
    return '#4b5563';
  }};

  @media (max-width: 768px) {
    padding: 6px 10px;
    font-size: 11px;
    flex-shrink: 0;
  }

  @media (max-width: 480px) {
    font-size: 10px;
    padding: 5px 8px;
  }
`;

const ViewButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 6px;
  background: #5b4dff;
  color: white;
  border: none;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 40px;
  white-space: nowrap;

  &:hover {
    background: #4c3fd1;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  svg {
    width: 14px;
    height: 14px;
  }

  @media (max-width: 768px) {
    min-height: 44px;
    padding: 12px 20px;
    font-size: 13px;
    align-self: flex-end;
  }

  @media (max-width: 480px) {
    min-height: 44px;
    padding: 12px 16px;
    font-size: 12px;
    align-self: stretch;
    width: auto;
  }
`;

// ===== PAGINATION =====
const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    gap: 8px;
    margin-top: 16px;
    padding-top: 16px;
  }

  @media (max-width: 480px) {
    gap: 6px;
    margin-top: 12px;
    padding-top: 12px;
  }
`;

const PaginationButton = styled.button`
  background: white;
  border: 1px solid #d1d5db;
  padding: 10px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  min-height: 40px;
  color: #6b7280;
  font-weight: 500;

  &:hover:not(:disabled) {
    background: #f3f4f6;
    border-color: #9ca3af;
    color: #374151;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  svg {
    width: 18px;
    height: 18px;
  }

  @media (max-width: 480px) {
    min-width: 36px;
    min-height: 36px;
    padding: 8px 10px;

    svg {
      width: 16px;
      height: 16px;
    }
  }
`;

const PageInfo = styled.span`
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
  white-space: nowrap;
  padding: 0 4px;

  @media (max-width: 480px) {
    font-size: 12px;
    padding: 0 2px;
  }
`;

const RaffleAdminDashboard = () => {
  const { user } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [filterStatus, setFilterStatus] = useState('all'); // all, pending_verification, approved, rejected
  const [selectedEntry, setSelectedEntry] = useState(null);

  const { data: stats, isLoading: statsLoading } = useRaffleAdminStats();
  const { data: entriesData, isLoading: entriesLoading } = useRaffleAdminEntries(page, limit, {});
  const { mutate: selectWinner, isPending: isSelectingWinner } = useSelectRaffleWinner();
  const { mutate: verifyEntry, isPending: isVerifying } = useVerifyP2PEntry();

  // Check admin access
  if (user?.role !== 'admin') {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <AlertCircle style={{ width: '48px', height: '48px', margin: '0 auto 16px', color: '#dc2626' }} />
          <h2 style={{ color: '#1f2937', marginBottom: '8px' }}>Access Denied</h2>
          <p style={{ color: '#6b7280' }}>You don't have permission to access this page.</p>
        </div>
      </Container>
    );
  }

  const handleSelectWinner = () => {
    if (!stats?.currentCycle?._id) {
      toast.error('No active raffle cycle');
      return;
    }

    selectWinner(stats.currentCycle._id, {
      onSuccess: (response) => {
        if (response.success) {
          toast.success(`Winner selected: ${response.data.winnerName}!`);
        }
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to select winner');
      },
    });
  };

  const handleApproveEntry = (entryId) => {
    verifyEntry(
      { entryId, approved: true },
      {
        onSuccess: () => {
          toast.success('Entry approved!');
          setSelectedEntry(null);
        },
        onError: (error) => {
          toast.error(error.message || 'Failed to approve entry');
        },
      }
    );
  };

  const handleRejectEntry = (entryId, reason) => {
    verifyEntry(
      { entryId, approved: false, rejectionReason: reason },
      {
        onSuccess: () => {
          toast.success('Entry rejected');
          setSelectedEntry(null);
        },
        onError: (error) => {
          toast.error(error.message || 'Failed to reject entry');
        },
      }
    );
  };

  // Filter entries based on payment status
  const filteredEntries = entriesData?.entries?.filter((entry) => {
    if (filterStatus === 'all') return true;
    return entry.paymentStatus === filterStatus;
  }) || [];

  return (
    <Container>
      <Header>
        <h1>Raffle Admin Dashboard</h1>
      </Header>

      {/* Stats Grid */}
      <StatsGrid>
        <StatCard>
          <Trophy />
          <StatContent>
            <StatLabel>Current Winner</StatLabel>
            <StatValue>
              {stats?.currentCycle?.winnerId ? 'Selected ✓' : 'Pending'}
            </StatValue>
          </StatContent>
        </StatCard>

        <StatCard>
          <Users />
          <StatContent>
            <StatLabel>Total Entries</StatLabel>
            <StatValue>{stats?.currentCycle?.totalEntries || 0}</StatValue>
          </StatContent>
        </StatCard>

        <StatCard>
          <DollarSign />
          <StatContent>
            <StatLabel>Pot Value</StatLabel>
            <StatValue>${stats?.currentCycle?.totalRevenue || '0.00'}</StatValue>
          </StatContent>
        </StatCard>

        <StatCard>
          <Calendar />
          <StatContent>
            <StatLabel>Draw Date</StatLabel>
            <StatValue>
              {stats?.currentCycle?.endDate
                ? new Date(stats.currentCycle.endDate).toLocaleDateString()
                : 'N/A'}
            </StatValue>
          </StatContent>
        </StatCard>
      </StatsGrid>

      {/* Winner Selection */}
      <Section>
        <SectionTitle>
          <Zap />
          Winner Selection
        </SectionTitle>

        <ActionBox>
          <ActionText>
            {stats?.currentCycle?.winnerId
              ? '✓ Winner already selected for this cycle'
              : '⚠️ Select a winner for the current raffle cycle'}
          </ActionText>
          <SelectWinnerButton
            onClick={handleSelectWinner}
            disabled={isSelectingWinner || !!stats?.currentCycle?.winnerId}
          >
            {isSelectingWinner ? 'Selecting...' : 'Select Winner'}
          </SelectWinnerButton>
        </ActionBox>
      </Section>

      {/* Entries Table */}
      <Section>
        <SectionTitle>
          <Users />
          Raffle Entries ({entriesData?.pagination?.total || 0})
        </SectionTitle>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {['all', 'pending_verification', 'approved', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              style={{
                padding: '8px 16px',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: filterStatus === status ? '600' : '500',
                fontSize: '13px',
                textTransform: 'capitalize',
                background: filterStatus === status ? '#3b82f6' : '#f3f4f6',
                color: filterStatus === status ? 'white' : '#374151',
                transition: 'all 0.2s',
              }}
            >
              {status.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        {entriesLoading ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#6b7280' }}>
            Loading entries...
          </div>
        ) : filteredEntries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#6b7280' }}>
            No entries found
          </div>
        ) : (
          <>
            <TableWrapper>
              <Table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Payment Method</th>
                    <th>Submitted</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEntries.map((entry) => (
                    <tr key={entry._id}>
                      <td data-label="Name">
                        <strong>{entry.fullName}</strong>
                      </td>
                      <td data-label="Email">{entry.email}</td>
                      <td data-label="Payment Method">
                        {entry.paymentMethod === 'stripe' ? (
                          <span style={{ fontSize: '12px', background: '#dbeafe', color: '#0369a1', padding: '4px 8px', borderRadius: '4px' }}>
                            Stripe ✓
                          </span>
                        ) : (
                          <span style={{ fontSize: '12px', background: '#fef3c7', color: '#92400e', padding: '4px 8px', borderRadius: '4px', textTransform: 'capitalize' }}>
                            {entry.paymentMethod.replace(/_/g, ' ')}
                          </span>
                        )}
                      </td>
                      <td data-label="Submitted">
                        {new Date(entry.createdAt).toLocaleDateString()}
                      </td>
                      <td data-label="Status">
                        <StatusBadge status={entry.paymentStatus || entry.status}>
                          {entry.paymentStatus
                            ? entry.paymentStatus.replace(/_/g, ' ').charAt(0).toUpperCase() + entry.paymentStatus.replace(/_/g, ' ').slice(1)
                            : entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                        </StatusBadge>
                      </td>
                      <td data-label="Action">
                        {entry.paymentStatus === 'pending_verification' ? (
                          <button
                            onClick={() => setSelectedEntry(entry)}
                            style={{
                              background: '#f59e0b',
                              color: 'white',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: '600',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                            }}
                          >
                            <Eye size={14} />
                            Verify
                          </button>
                        ) : (
                          <ViewButton onClick={() => router.push(`/admin/raffle/${entry._id}`)}>
                            <Eye />
                            View
                          </ViewButton>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </TableWrapper>

            {/* Pagination */}
            {entriesData?.pagination?.pages > 1 && (
              <Pagination>
                <PaginationButton
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft />
                </PaginationButton>

                <PageInfo>
                  Page {page} of {entriesData.pagination.pages}
                </PageInfo>

                <PaginationButton
                  onClick={() => setPage(p => p + 1)}
                  disabled={page >= entriesData.pagination.pages}
                >
                  <ChevronRight />
                </PaginationButton>
              </Pagination>
            )}
          </>
        )}
      </Section>

      {/* P2P Verification Modal */}
      {selectedEntry && selectedEntry.paymentStatus === 'pending_verification' && (
        <P2PVerificationModal
          entry={selectedEntry}
          onClose={() => setSelectedEntry(null)}
          onApprove={handleApproveEntry}
          onReject={handleRejectEntry}
          isLoading={isVerifying}
        />
      )}
    </Container>
  );
};

export default RaffleAdminDashboard;
