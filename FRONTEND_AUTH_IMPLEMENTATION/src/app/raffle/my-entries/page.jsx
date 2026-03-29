'use client';

import styled from 'styled-components';
import { useUserRaffleEntries } from '@/api/hooks/useRaffle';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Trophy, Calendar, CheckCircle, Clock } from 'lucide-react';

const Container = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px 20px;

  @media (max-width: 768px) {
    padding: 24px 16px;
  }
`;

const Header = styled.div`
  margin-bottom: 40px;

  h1 {
    font-size: 32px;
    font-weight: 700;
    color: #1f2937;
    margin-bottom: 8px;

    @media (max-width: 768px) {
      font-size: 24px;
    }
  }

  p {
    font-size: 16px;
    color: #6b7280;
    margin: 0;
  }
`;

const EmptyState = styled.div`
  background: #f9fafb;
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  padding: 60px 20px;
  text-align: center;
`;

const EmptyIcon = styled.div`
  margin-bottom: 16px;

  svg {
    width: 48px;
    height: 48px;
    color: #9ca3af;
  }
`;

const EmptyTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
`;

const EmptyText = styled.p`
  font-size: 14px;
  color: #6b7280;
  max-width: 400px;
  margin: 0 auto 24px;
`;

const CTA = styled.a`
  display: inline-block;
  background: #5b4dff;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;

  &:hover {
    background: #4c3fd1;
    transform: translateY(-2px);
  }
`;

const EntriesGrid = styled.div`
  display: grid;
  gap: 16px;
`;

const EntryCard = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 20px;
  align-items: center;
  transition: all 0.3s ease;

  &:hover {
    border-color: #5b4dff;
    box-shadow: 0 4px 12px rgba(91, 77, 255, 0.1);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    padding: 16px;
  }
`;

const EntryInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const EntryName = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
`;

const EntryMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;

  @media (max-width: 768px) {
    gap: 12px;
  }
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #6b7280;

  svg {
    width: 16px;
    height: 16px;
    color: #9ca3af;
  }
`;

const StatusBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
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

  svg {
    width: 14px;
    height: 14px;
  }
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #6b7280;
`;

const Spinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid #e5e7eb;
  border-top-color: #5b4dff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const RaffleMyEntries = () => {
  const { user } = useAuth();
  const router = useRouter();
  const { data: entries, isLoading } = useUserRaffleEntries();

  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=/raffle/my-entries');
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  if (isLoading) {
    return (
      <Container>
        <Header>
          <h1>My Raffle Entries</h1>
        </Header>
        <LoadingState>
          <Spinner />
          <p style={{ marginTop: '16px' }}>Loading your entries...</p>
        </LoadingState>
      </Container>
    );
  }

  if (!entries || entries.length === 0) {
    return (
      <Container>
        <Header>
          <h1>My Raffle Entries</h1>
        </Header>
        <EmptyState>
          <EmptyIcon>
            <Trophy />
          </EmptyIcon>
          <EmptyTitle>No Raffle Entries Yet</EmptyTitle>
          <EmptyText>
            You haven't entered the raffle yet. Try your luck with a $1 entry 
            for a chance to win an exclusive SphereKings board!
          </EmptyText>
          <CTA href="/#raffle">Enter the Raffle</CTA>
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <h1>My Raffle Entries</h1>
        <p>You have {entries.length} active raffle entry{entries.length !== 1 ? 'ies' : ''}</p>
      </Header>

      <EntriesGrid>
        {entries.map((entry) => (
          <EntryCard key={entry._id}>
            <EntryInfo>
              <EntryName>{entry.fullName}</EntryName>
              <EntryMeta>
                <MetaItem>
                  <Calendar />
                  Entered: {formatDate(entry.createdAt)}
                </MetaItem>
                {entry.paidAt && (
                  <MetaItem>
                    <CheckCircle />
                    Paid: {formatDate(entry.paidAt)}
                  </MetaItem>
                )}
              </EntryMeta>
              <EntryMeta>
                <MetaItem>
                  Cycle: <strong>{entry.cyclePeriod}</strong>
                </MetaItem>
                <MetaItem>
                  Email: <strong>{entry.email}</strong>
                </MetaItem>
              </EntryMeta>
            </EntryInfo>

            <StatusBadge status={entry.status}>
              {entry.status === 'completed' && <CheckCircle />}
              {entry.status === 'pending' && <Clock />}
              {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
            </StatusBadge>
          </EntryCard>
        ))}
      </EntriesGrid>
    </Container>
  );
};

export default RaffleMyEntries;
