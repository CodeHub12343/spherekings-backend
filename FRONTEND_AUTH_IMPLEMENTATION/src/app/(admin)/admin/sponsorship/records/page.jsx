'use client';

import { useState, useMemo } from 'react';
import styled from 'styled-components';
import { useSponsorshipRecordsList, useAddVideoLink, useUpdateSponsorshipStatus } from '@/api/hooks/useSponsorship';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { formatCurrency } from '@/utils/currencyUtils';

const PageContainer = styled.div`
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 1rem;
  }

  @media (max-width: 480px) {
    padding: 0.75rem;
  }
`;

const Header = styled.div`
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    margin-bottom: 1.5rem;
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 0.5rem 0;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }

  @media (max-width: 480px) {
    font-size: 1.25rem;
  }
`;

const Subtitle = styled.p`
  color: #666;
  margin: 0;
  font-size: 0.95rem;

  @media (max-width: 480px) {
    font-size: 0.85rem;
  }
`;

const ControlsSection = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }

  @media (max-width: 480px) {
    gap: 0.5rem;
    margin-bottom: 1rem;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const FilterSelect = styled.select`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.95rem;
  background-color: white;
  cursor: pointer;
  transition: border-color 0.2s;
  min-height: 44px;

  @media (max-width: 768px) {
    width: 100%;
    padding: 0.9rem;
    font-size: 1rem;
  }

  &:hover {
    border-color: #999;
  }

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }
`;

const StatCard = styled.div`
  background: white;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;

  h3 {
    color: #666;
    font-size: 0.9rem;
    font-weight: 600;
    margin: 0 0 0.5rem 0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .number {
    font-size: 2rem;
    font-weight: 700;
    color: #1a1a1a;
  }

  .amount {
    font-size: 0.95rem;
    color: #667eea;
    margin-top: 0.25rem;
  }

  @media (max-width: 768px) {
    padding: 1rem;

    h3 {
      font-size: 0.8rem;
      margin-bottom: 0.4rem;
    }

    .number {
      font-size: 1.5rem;
    }

    .amount {
      font-size: 0.85rem;
    }
  }

  @media (max-width: 480px) {
    padding: 0.75rem;

    h3 {
      font-size: 0.75rem;
      margin-bottom: 0.3rem;
    }

    .number {
      font-size: 1.25rem;
    }

    .amount {
      font-size: 0.75rem;
      margin-top: 0.15rem;
    }
  }
`;

const TableContainer = styled.div`
  background: white;
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;

  @media (max-width: 768px) {
    border: none;
    background: transparent;
    overflow: visible;
  }
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;

  thead {
    background-color: #f5f5f5;
    border-bottom: 2px solid #eee;
  }

  th {
    padding: 1rem;
    text-align: left;
    font-weight: 600;
    color: #1a1a1a;
    font-size: 0.9rem;
  }

  td {
    padding: 1rem;
    border-bottom: 1px solid #eee;
    color: #555;
  }

  tbody tr:hover {
    background-color: #f9f9f9;
  }

  @media (max-width: 768px) {
    display: block;

    thead {
      display: none;
    }

    tbody {
      display: block;
    }

    tbody tr {
      display: block;
      margin-bottom: 1.5rem;
      border: 1px solid #eee;
      border-radius: 8px;
      background: white;
      overflow: hidden;
    }

    tbody tr:hover {
      background-color: white;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    td {
      display: block;
      text-align: left;
      padding: 0.75rem 1rem;
      border-bottom: none;
      border-top: 1px solid #f0f0f0;
      position: relative;
      padding-left: 48%;
      min-height: 44px;
      display: flex;
      align-items: center;
    }

    td:first-child {
      border-top: none;
      padding-left: 1rem;
    }

    td::before {
      content: attr(data-label);
      position: absolute;
      left: 1rem;
      font-weight: 600;
      color: #1a1a1a;
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      width: 45%;
    }

    tbody tr:nth-child(even) {
      background-color: #fafafa;
    }
  }

  @media (max-width: 480px) {
    tbody tr {
      margin-bottom: 1rem;
    }

    td {
      padding: 0.6rem 0.75rem;
      padding-left: 42%;
      font-size: 0.9rem;
    }

    td:first-child {
      padding-left: 0.75rem;
    }

    td::before {
      font-size: 0.75rem;
      left: 0.75rem;
      width: 40%;
    }
  }
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: capitalize;

  background-color: ${props => {
    switch (props.status) {
      case 'pending_payment':
        return '#fff3cd';
      case 'active':
        return '#d1ecf1';
      case 'in_progress':
        return '#cfe2ff';
      case 'completed':
        return '#d1e7dd';
      case 'overdue':
        return '#f8d7da';
      case 'failed':
        return '#f8d7da';
      default:
        return '#e2e3e5';
    }
  }};

  color: ${props => {
    switch (props.status) {
      case 'pending_payment':
        return '#856404';
      case 'active':
        return '#0c5460';
      case 'in_progress':
        return '#084298';
      case 'completed':
        return '#0f5132';
      case 'overdue':
        return '#721c24';
      case 'failed':
        return '#721c24';
      default:
        return '#383d41';
    }
  }};
`;

const ProgressBar = styled.div`
  background-color: #eee;
  border-radius: 10px;
  height: 24px;
  overflow: hidden;
  display: flex;
  align-items: center;
  position: relative;
  width: 100%;
  min-width: unset;

  .fill {
    background-color: #667eea;
    height: 100%;
    border-radius: 10px;
    transition: width 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .text {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    font-size: 0.75rem;
    font-weight: 600;
    color: #1a1a1a;
    white-space: nowrap;
  }

  @media (max-width: 768px) {
    height: 28px;

    .text {
      font-size: 0.7rem;
    }
  }

  @media (max-width: 480px) {
    height: 24px;

    .text {
      font-size: 0.65rem;
    }
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    gap: 0.6rem;
    flex-direction: column;
  }

  @media (max-width: 480px) {
    gap: 0.5rem;
  }
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  color: #1a1a1a;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.2s;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 768px) {
    padding: 0.75rem 1.2rem;
    font-size: 0.9rem;
    width: 100%;
  }

  @media (max-width: 480px) {
    padding: 0.7rem 1rem;
    font-size: 0.85rem;
  }

  &:hover {
    background-color: #f5f5f5;
    border-color: #999;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &.primary {
    background-color: #667eea;
    color: white;
    border-color: #667eea;

    &:hover {
      background-color: #5568d3;
      border-color: #5568d3;
    }
  }

  &.danger {
    background-color: #dc3545;
    color: white;
    border-color: #dc3545;

    &:hover {
      background-color: #c82333;
      border-color: #c82333;
    }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #666;

  h3 {
    margin: 0 0 0.5rem 0;
    color: #1a1a1a;
  }

  p {
    margin: 0;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 8px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  max-height: 80vh;
  overflow-y: auto;

  @media (max-width: 768px) {
    padding: 1.5rem;
    max-width: 95%;
    width: 95%;
    max-height: 90vh;
  }

  @media (max-width: 480px) {
    padding: 1rem;
    width: 100%;
    border-radius: 12px 12px 0 0;
    max-height: 95vh;
  }
`;

const ModalHeader = styled.h2`
  margin: 0 0 1rem 0;
  color: #1a1a1a;

  @media (max-width: 480px) {
    font-size: 1.3rem;
    margin-bottom: 0.75rem;
  }
`;

const ModalBody = styled.div`
  margin-bottom: 1.5rem;

  @media (max-width: 480px) {
    margin-bottom: 1rem;
  }

  p {
    @media (max-width: 480px) {
      font-size: 0.9rem;
    }
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;

  label {
    display: block;
    margin-bottom: 0.5rem;
    color: #1a1a1a;
    font-weight: 500;
    font-size: 0.9rem;
  }

  input,
  textarea,
  select {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 0.95rem;
    font-family: inherit;
    box-sizing: border-box;
    min-height: 44px;

    @media (max-width: 480px) {
      padding: 0.9rem;
      font-size: 1rem;
      border-radius: 6px;
    }

    &:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
  }

  textarea {
    resize: vertical;
    min-height: 100px;

    @media (max-width: 480px) {
      min-height: 120px;
    }
  }

  @media (max-width: 480px) {
    margin-bottom: 0.75rem;

    label {
      font-size: 0.85rem;
      margin-bottom: 0.4rem;
    }
  }
`;

const ModalFooter = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;

  @media (max-width: 768px) {
    gap: 0.75rem;
    flex-direction: column-reverse;
  }

  @media (max-width: 480px) {
    gap: 0.5rem;
  }

  button {
    @media (max-width: 768px) {
      flex: 1;
    }
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 2rem;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    gap: 0.4rem;
    margin-top: 1.5rem;
  }

  @media (max-width: 480px) {
    gap: 0.3rem;
    margin-top: 1rem;
  }
`;

const PaginationButton = styled.button`
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  background-color: white;
  border-radius: 4px;
  cursor: pointer;
  color: #1a1a1a;
  font-weight: 500;
  transition: all 0.2s;
  min-height: 40px;
  min-width: 40px;

  @media (max-width: 768px) {
    padding: 0.5rem 0.75rem;
    font-size: 0.9rem;
  }

  @media (max-width: 480px) {
    padding: 0.4rem 0.6rem;
    font-size: 0.8rem;
    min-width: 36px;
    min-height: 36px;
  }

  &:hover:not(:disabled) {
    background-color: #f5f5f5;
    border-color: #999;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &.active {
    background-color: #667eea;
    color: white;
    border-color: #667eea;
  }
`;

export default function SponsorshipRecordsPage() {
  const { isAuthenticated, user } = useAuth();
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [modal, setModal] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [modalData, setModalData] = useState({});

  // Fetch sponsorship records
  const { data: recordsData, isLoading, error } = useSponsorshipRecordsList({
    page,
    status: statusFilter === 'all' ? null : statusFilter,
  });

  // Mutations
  const { addVideoLink, isLoading: addVideoLoading } = useAddVideoLink();
  const { updateStatus, isLoading: updateStatusLoading } = useUpdateSponsorshipStatus();

  // Auth check
  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <PageContainer>
        <EmptyState>
          <h3>Access Denied</h3>
          <p>You must be an admin to access this page.</p>
        </EmptyState>
      </PageContainer>
    );
  }

  const records = recordsData?.data || [];
  const total = recordsData?.pagination?.total || 0;
  const pages = Math.ceil(total / 10);

  // Calculate stats
  const stats = useMemo(() => {
    if (!recordsData?.data) return { active: 0, completed: 0, revenue: 0, totalRevenue: 0 };
    const allRecs = recordsData.data;
    const revenue = allRecs
      .filter(r => r.paymentStatus === 'completed')
      .reduce((sum, r) => sum + r.amount, 0);
    
    return {
      active: allRecs.filter(r => r.status === 'active' || r.status === 'in_progress').length,
      completed: allRecs.filter(r => r.status === 'completed').length,
      totalRevenue: revenue,
      avgDeal: allRecs.length > 0 ? Math.round(allRecs.reduce((sum, r) => sum + r.amount, 0) / allRecs.length) : 0,
    };
  }, [recordsData]);

  const handleAddVideo = async () => {
    try {
      if (!modalData.url || !modalData.platform) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Format date properly
      let postedAtISO;
      if (modalData.postedAt) {
        const dateObj = new Date(modalData.postedAt);
        if (isNaN(dateObj.getTime())) {
          toast.error('Invalid date format');
          return;
        }
        // Set to noon UTC to avoid timezone issues
        dateObj.setUTCHours(12, 0, 0, 0);
        postedAtISO = dateObj.toISOString();
      } else {
        // Use current date if not provided
        const dateObj = new Date();
        dateObj.setUTCHours(12, 0, 0, 0);
        postedAtISO = dateObj.toISOString();
      }

      const success = await addVideoLink(selectedRecord._id, {
        videoUrl: modalData.url,
        platform: modalData.platform,
        title: modalData.title,
        postedAt: postedAtISO,
      });
      if (success) {
        toast.success('Video link added successfully');
        setModal(null);
        setSelectedRecord(null);
      }
    } catch (err) {
      console.error('Add video error:', err);
      toast.error(err?.message || 'Failed to add video link');
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      const success = await updateStatus(selectedRecord._id, {
        status: newStatus,
        adminNotes: modalData.notes,
      });
      if (success) {
        toast.success(`Status updated to ${newStatus}`);
        setModal(null);
        setSelectedRecord(null);
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const openVideoModal = (record) => {
    setSelectedRecord(record);
    setModalData({ url: '', platform: 'instagram', title: '' });
    setModal('video');
  };

  const openStatusModal = (record) => {
    setSelectedRecord(record);
    setModalData({ notes: '' });
    setModal('status');
  };

  if (isLoading) {
    return (
      <PageContainer>
        <LoadingSpinner />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <EmptyState>
          <h3>Error Loading Records</h3>
          <p>{error.message || 'Failed to load sponsorship records'}</p>
        </EmptyState>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Header>
        <Title>Sponsorship Records</Title>
        <Subtitle>Manage sponsorship campaigns and track video delivery</Subtitle>
      </Header>

      <StatsGrid>
        <StatCard>
          <h3>Active Campaigns</h3>
          <div className="number">{stats.active}</div>
        </StatCard>
        <StatCard>
          <h3>Completed</h3>
          <div className="number">{stats.completed}</div>
        </StatCard>
        <StatCard>
          <h3>Total Revenue</h3>
          <div className="number">{formatCurrency(stats.totalRevenue)}</div>
          <div className="amount">Avg: {formatCurrency(stats.avgDeal)}</div>
        </StatCard>
        <StatCard>
          <h3>Total Records</h3>
          <div className="number">{total}</div>
        </StatCard>
      </StatsGrid>

      <ControlsSection>
        <FilterGroup>
          <FilterSelect value={statusFilter} onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}>
            <option value="all">All Statuses</option>
            <option value="pending_payment">Pending Payment</option>
            <option value="active">Active</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="overdue">Overdue</option>
            <option value="failed">Failed</option>
          </FilterSelect>
        </FilterGroup>
      </ControlsSection>

      {records.length === 0 ? (
        <EmptyState>
          <h3>No Records</h3>
          <p>No sponsorship records found for this filter.</p>
        </EmptyState>
      ) : (
        <>
          <TableContainer>
            <StyledTable>
              <thead>
                <tr>
                  <th>Sponsor</th>
                  <th>Tier</th>
                  <th>Amount</th>
                  <th>Videos</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => {
                  const progressPercent = record.videoMentions > 0 
                    ? Math.round((record.videosCompleted / record.videoMentions) * 100) 
                    : 0;

                  return (
                    <tr key={record._id}>
                      <td data-label="Sponsor">
                        <strong>{record.sponsorName}</strong>
                        <div style={{ fontSize: '0.85rem', color: '#999' }}>{record.sponsorEmail}</div>
                      </td>
                      <td data-label="Tier">{record.tierName}</td>
                      <td data-label="Amount"><strong>{formatCurrency(record.amount)}</strong></td>
                      <td data-label="Videos">
                        <ProgressBar>
                          <div className="fill" style={{ width: `${progressPercent}%` }} />
                          <div className="text">{record.videosCompleted}/{record.videoMentions}</div>
                        </ProgressBar>
                      </td>
                      <td data-label="Status">
                        <StatusBadge status={record.status}>
                          {record.status.replace('_', ' ')}
                        </StatusBadge>
                      </td>
                      <td data-label="Payment">
                        <StatusBadge status={record.paymentStatus}>
                          {record.paymentStatus.replace('_', ' ')}
                        </StatusBadge>
                      </td>
                      <td data-label="Actions">
                        <ActionButtons>
                          {(record.status === 'active' || record.status === 'in_progress') && (
                            <>
                              <Button onClick={() => openVideoModal(record)}>
                                Add Video
                              </Button>
                              <Button className="primary" onClick={() => openStatusModal(record)}>
                                Update
                              </Button>
                            </>
                          )}
                          {record.status === 'completed' && (
                            <Button disabled>Completed</Button>
                          )}
                        </ActionButtons>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </StyledTable>
          </TableContainer>

          {pages > 1 && (
            <PaginationContainer>
              <PaginationButton
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </PaginationButton>
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <PaginationButton
                  key={p}
                  className={p === page ? 'active' : ''}
                  onClick={() => setPage(p)}
                >
                  {p}
                </PaginationButton>
              ))}
              <PaginationButton
                disabled={page === pages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </PaginationButton>
            </PaginationContainer>
          )}
        </>
      )}

      {/* Add Video Modal */}
      {modal === 'video' && (
        <ModalOverlay onClick={() => setModal(null)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>Add Video Link</ModalHeader>
            <ModalBody>
              <p><strong>{selectedRecord.sponsorName}</strong> - {selectedRecord.tierName}</p>
              <p>Videos Completed: {selectedRecord.videosCompleted}/{selectedRecord.videoMentions}</p>
              <FormGroup>
                <label>Platform (required)</label>
                <FilterSelect
                  value={modalData.platform || 'instagram'}
                  onChange={(e) => setModalData({ ...modalData, platform: e.target.value })}
                >
                  <option value="instagram">Instagram</option>
                  <option value="tiktok">TikTok</option>
                  <option value="youtube">YouTube</option>
                  <option value="twitter">Twitter/X</option>
                  <option value="facebook">Facebook</option>
                </FilterSelect>
              </FormGroup>
              <FormGroup>
                <label>Video URL (required)</label>
                <input
                  type="url"
                  value={modalData.url || ''}
                  onChange={(e) => setModalData({ ...modalData, url: e.target.value })}
                  placeholder="https://..."
                />
              </FormGroup>
              <FormGroup>
                <label>Video Title</label>
                <input
                  type="text"
                  value={modalData.title || ''}
                  onChange={(e) => setModalData({ ...modalData, title: e.target.value })}
                  placeholder="Video title..."
                />
              </FormGroup>
              <FormGroup>
                <label>Posted Date</label>
                <input
                  type="date"
                  value={modalData.postedAt || ''}
                  onChange={(e) => setModalData({ ...modalData, postedAt: e.target.value })}
                />
              </FormGroup>

              {/* Show uploaded videos */}
              {selectedRecord?.videoLinks && selectedRecord.videoLinks.length > 0 && (
                <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                    ✅ Uploaded Videos ({selectedRecord.videoLinks.length})
                  </label>
                  <div style={{ display: 'grid', gap: '0.75rem' }}>
                    {selectedRecord.videoLinks.map((video, idx) => (
                      <div
                        key={video._id}
                        style={{
                          padding: '0.75rem',
                          background: '#f9fafb',
                          border: '1px solid #e5e7eb',
                          borderRadius: '4px',
                          fontSize: '0.9rem',
                        }}
                      >
                        <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                          {idx + 1}. {video.title || 'Untitled'} ({video.platform})
                        </div>
                        <a
                          href={video.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: '#667eea',
                            textDecoration: 'none',
                            fontSize: '0.85rem',
                            wordBreak: 'break-all',
                          }}
                        >
                          {video.url}
                        </a>
                        <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                          Posted: {new Date(video.postedAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button onClick={() => setModal(null)}>Cancel</Button>
              <Button className="primary" onClick={handleAddVideo} disabled={addVideoLoading}>
                {addVideoLoading ? 'Adding...' : 'Add Video'}
              </Button>
            </ModalFooter>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* Update Status Modal */}
      {modal === 'status' && (
        <ModalOverlay onClick={() => setModal(null)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>Update Sponsorship Status</ModalHeader>
            <ModalBody>
              <p><strong>{selectedRecord.sponsorName}</strong> - {selectedRecord.tierName}</p>
              <p>Current Status: <StatusBadge status={selectedRecord.status}>{selectedRecord.status.replace('_', ' ')}</StatusBadge></p>
              <FormGroup>
                <label>New Status (required)</label>
                <FilterSelect
                  onChange={(e) => setModalData({ ...modalData, status: e.target.value })}
                >
                  <option value="">Select status...</option>
                  <option value="active">Active</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="overdue">Overdue</option>
                  <option value="failed">Failed</option>
                </FilterSelect>
              </FormGroup>
              <FormGroup>
                <label>Admin Notes</label>
                <textarea
                  value={modalData.notes || ''}
                  onChange={(e) => setModalData({ ...modalData, notes: e.target.value })}
                  placeholder="Add admin notes..."
                />
              </FormGroup>
            </ModalBody>
            <ModalFooter>
              <Button onClick={() => setModal(null)}>Cancel</Button>
              <Button 
                className="primary" 
                onClick={() => handleUpdateStatus(modalData.status)} 
                disabled={updateStatusLoading || !modalData.status}
              >
                {updateStatusLoading ? 'Updating...' : 'Update Status'}
              </Button>
            </ModalFooter>
          </ModalContent>
        </ModalOverlay>
      )}
    </PageContainer>
  );
}
