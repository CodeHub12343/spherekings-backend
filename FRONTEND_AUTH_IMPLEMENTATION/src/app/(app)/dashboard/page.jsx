'use client';

import styled from 'styled-components';
import { motion } from 'framer-motion';
import { LogOut, User, Mail, Phone } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

const DashboardContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  padding: 24px;
`;

const Header = styled(motion.div)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  padding: 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #0f172a;
`;

const LogoutBtn = styled(Button)`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ContentGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
`;

const Card = styled(motion.div)`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const CardTitle = styled.h3`
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
  display: flex;
  align-items: center;
  gap: 8px;

  svg {
    color: #5b4dff;
  }
`;

const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #e5e7eb;

  &:last-child {
    border-bottom: none;
  }
`;

const Label = styled.span`
  color: #6b7280;
  font-size: 13px;
  font-weight: 500;
`;

const Value = styled.span`
  color: #0f172a;
  font-size: 14px;
  font-weight: 600;
`;

const WelcomeCard = styled(Card)`
  background: linear-gradient(135deg, #5b4dff 0%, #4c3fcc 100%);
  color: white;

  ${CardTitle} {
    color: white;

    svg {
      color: rgba(255, 255, 255, 0.8);
    }
  }

  ${Label} {
    color: rgba(255, 255, 255, 0.7);
  }

  ${Value} {
    color: white;
  }
`;

const LoadingPlaceholder = styled.div`
  padding: 24px;
  text-align: center;
  color: #6b7280;
  font-size: 14px;
`;

function DashboardContent() {
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();
  const { success, error: showError } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      success('Logged out successfully');
      router.push('/login');
    } catch (err) {
      showError('Failed to logout');
    }
  };

  if (isLoading) {
    return (
      <DashboardContainer>
        <LoadingPlaceholder>Loading your dashboard...</LoadingPlaceholder>
      </DashboardContainer>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  };

  return (
    <DashboardContainer>
      <Header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Title>Dashboard</Title>
        <LogoutBtn
          variant="secondary"
          size="md"
          onClick={handleLogout}
        >
          <LogOut size={18} />
          Logout
        </LogoutBtn>
      </Header>

      <ContentGrid
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Welcome Card */}
        <WelcomeCard variants={itemVariants}>
          <CardTitle>
            <User size={20} />
            Welcome Back!
          </CardTitle>
          <CardContent>
            <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.5 }}>
              Hi {user?.firstName || 'User'}, welcome to your dashboard. This is your personal space to manage your account and activities.
            </p>
          </CardContent>
        </WelcomeCard>

        {/* Profile Information */}
        <Card variants={itemVariants}>
          <CardTitle>
            <User size={20} />
            Profile Information
          </CardTitle>
          <CardContent>
            <InfoRow>
              <Label>Full Name:</Label>
              <Value>
                {user?.firstName} {user?.lastName}
              </Value>
            </InfoRow>
            <InfoRow>
              <Label>Email:</Label>
              <Value>{user?.email}</Value>
            </InfoRow>
            <InfoRow>
              <Label>Role:</Label>
              <Value>{user?.role || 'User'}</Value>
            </InfoRow>
            <InfoRow>
              <Label>Account Status:</Label>
              <Value
                style={{
                  color: user?.isActive ? '#10b981' : '#ef4444',
                }}
              >
                {user?.isActive ? 'Active' : 'Inactive'}
              </Value>
            </InfoRow>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card variants={itemVariants}>
          <CardTitle>
            <Mail size={20} />
            Contact Information
          </CardTitle>
          <CardContent>
            <InfoRow>
              <Label>Primary Email:</Label>
              <Value>{user?.email}</Value>
            </InfoRow>
            <InfoRow>
              <Label>Phone:</Label>
              <Value>{user?.phone || 'Not provided'}</Value>
            </InfoRow>
            <InfoRow>
              <Label>Email Verified:</Label>
              <Value
                style={{
                  color: user?.emailVerified ? '#10b981' : '#f59e0b',
                }}
              >
                {user?.emailVerified ? 'Yes' : 'Pending'}
              </Value>
            </InfoRow>
          </CardContent>
        </Card>

        {/* Account Summary */}
        <Card variants={itemVariants}>
          <CardTitle>
            <User size={20} />
            Account Summary
          </CardTitle>
          <CardContent>
            <InfoRow>
              <Label>Member Since:</Label>
              <Value>
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : 'Recently'}
              </Value>
            </InfoRow>
            <InfoRow>
              <Label>Last Updated:</Label>
              <Value>
                {user?.updatedAt
                  ? new Date(user.updatedAt).toLocaleDateString()
                  : 'N/A'}
              </Value>
            </InfoRow>
            <InfoRow>
              <Label>Account ID:</Label>
              <Value
                style={{
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  wordBreak: 'break-all',
                }}
              >
                {user?.id || 'N/A'}
              </Value>
            </InfoRow>
          </CardContent>
        </Card>
      </ContentGrid>
    </DashboardContainer>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
