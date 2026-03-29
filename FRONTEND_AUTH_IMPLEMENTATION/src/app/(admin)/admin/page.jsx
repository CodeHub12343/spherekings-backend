'use client';

import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

const PageContainer = styled.div`
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 0.5rem 0;
`;

const Subtitle = styled.p`
  color: #666;
  margin: 0;
`;

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
`;

const Card = styled(Link)`
  display: block;
  background: white;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 2rem;
  text-decoration: none;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    border-color: #667eea;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
    transform: translateY(-2px);
  }

  .icon {
    font-size: 2.5rem;
    margin-bottom: 1rem;
  }

  h2 {
    margin: 0 0 0.5rem 0;
    font-size: 1.3rem;
    color: #1a1a1a;
  }

  p {
    margin: 0 0 1rem 0;
    color: #666;
    font-size: 0.95rem;
    line-height: 1.4;
  }

  .arrow {
    color: #667eea;
    font-weight: 600;
  }
`;

const Section = styled.div`
  margin-bottom: 3rem;

  h2 {
    font-size: 1.3rem;
    font-weight: 700;
    color: #1a1a1a;
    margin-bottom: 1.5rem;
  }
`;

const QuickLinks = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
`;

const QuickLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: white;
  border: 1px solid #eee;
  border-radius: 6px;
  text-decoration: none;
  color: #667eea;
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    border-color: #667eea;
    background-color: #f8f8ff;
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

export default function AdminDashboard() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

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

  return (
    <PageContainer>
      <Header>
        <Title>Admin Dashboard</Title>
        <Subtitle>Manage influencers, sponsorships, and platform operations</Subtitle>
      </Header>

      <Section>
        <h2>Management Tools</h2>
        <DashboardGrid>
          <Card href="/admin/influencer/applications">
            <div className="icon">👥</div>
            <h2>Influencer Applications</h2>
            <p>Review and manage influencer applications, approvals, and product assignments.</p>
            <span className="arrow">Go to Management →</span>
          </Card>

          <Card href="/admin/sponsorship/records">
            <div className="icon">💰</div>
            <h2>Sponsorship Records</h2>
            <p>Track sponsorship campaigns, video delivery, and payment statuses.</p>
            <span className="arrow">Go to Management →</span>
          </Card>

          <Card href="/admin/products">
            <div className="icon">📦</div>
            <h2>Products</h2>
            <p>Manage product catalog, inventory, and product assignments to influencers.</p>
            <span className="arrow">Go to Management →</span>
          </Card>

          <Card href="/admin/users">
            <div className="icon">🔐</div>
            <h2>Users & Roles</h2>
            <p>Manage user accounts, roles, and platform permissions.</p>
            <span className="arrow">Go to Management →</span>
          </Card>
        </DashboardGrid>
      </Section>

      <Section>
        <h2>Quick Links</h2>
        <QuickLinks>
          <QuickLink href="/admin/influencer/applications">
            <span>📋</span> Influencers
          </QuickLink>
          <QuickLink href="/admin/sponsorship/records">
            <span>💵</span> Sponsorships
          </QuickLink>
          <QuickLink href="/admin/products">
            <span>📦</span> Products
          </QuickLink>
          <QuickLink href="/admin/users">
            <span>👤</span> Users
          </QuickLink>
          <QuickLink href="/admin/analytics">
            <span>📊</span> Analytics
          </QuickLink>
          <QuickLink href="/admin/settings">
            <span>⚙️</span> Settings
          </QuickLink>
        </QuickLinks>
      </Section>
    </PageContainer>
  );
}
