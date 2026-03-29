'use client';

import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useMyInfluencerApplication } from '@/api/hooks/useInfluencerApplication';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const PageContainer = styled.div`
  width: 100%;
  max-width: 1200px;
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

const StatusGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatusCard = styled.div`
  background: white;
  border: 2px solid #eee;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

  h3 {
    font-size: 0.9rem;
    color: #666;
    margin: 0 0 0.75rem 0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 600;
  }

  .value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1a1a1a;
  }
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: capitalize;
  margin-top: 0.5rem;

  background-color: ${props => {
    switch (props.status) {
      case 'pending':
        return '#fff3cd';
      case 'approved':
        return '#d4edda';
      case 'rejected':
        return '#f8d7da';
      default:
        return '#e2e3e5';
    }
  }};

  color: ${props => {
    switch (props.status) {
      case 'pending':
        return '#856404';
      case 'approved':
        return '#155724';
      case 'rejected':
        return '#721c24';
      default:
        return '#383d41';
    }
  }};
`;

const FulfillmentBadge = styled.span`
  display: inline-block;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: capitalize;
  margin-top: 0.5rem;

  background-color: ${props => {
    switch (props.status) {
      case 'pending':
        return '#e2e3e5';
      case 'assigned':
        return '#cfe2ff';
      case 'shipped':
        return '#d1ecf1';
      case 'delivered':
        return '#d1e7dd';
      default:
        return '#e2e3e5';
    }
  }};

  color: ${props => {
    switch (props.status) {
      case 'pending':
        return '#383d41';
      case 'assigned':
        return '#084298';
      case 'shipped':
        return '#0c5460';
      case 'delivered':
        return '#0f5132';
      default:
        return '#383d41';
    }
  }};
`;

const DetailCard = styled.div`
  background: white;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 2rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  box-sizing: border-box;
  overflow-x: hidden;

  h2 {
    font-size: 1.25rem;
    font-weight: 700;
    color: #1a1a1a;
    margin: 0 0 1.5rem 0;
    padding-bottom: 1rem;
    border-bottom: 2px solid #eee;
    word-break: break-word;
  }

  @media (max-width: 768px) {
    padding: 1.25rem;
    margin-bottom: 1rem;

    h2 {
      font-size: 1.1rem;
      margin: 0 0 1rem 0;
      padding-bottom: 0.75rem;
    }
  }
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1rem 0;
  border-bottom: 1px solid #eee;
  gap: 1rem;

  &:last-child {
    border-bottom: none;
  }

  label {
    color: #666;
    font-weight: 600;
    font-size: 0.95rem;
    flex-shrink: 0;
    min-width: 120px;
  }

  .value {
    color: #1a1a1a;
    font-weight: 500;
    word-break: break-word;
    word-wrap: break-word;
    overflow-wrap: break-word;
    flex: 1;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;

    label {
      font-weight: 700;
      min-width: auto;
    }

    .value {
      width: 100%;
    }
  }
`;

const ProductCard = styled.div`
  background: linear-gradient(135deg, #f5f3ff 0%, #faf5ff 100%);
  border: 2px solid #667eea;
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 1rem;
  box-sizing: border-box;
  word-wrap: break-word;
  overflow-wrap: break-word;

  h3 {
    margin: 0 0 1rem 0;
    color: #667eea;
    font-size: 1.1rem;
    font-weight: 700;
    word-break: break-word;
  }

  img {
    max-width: 100%;
    height: auto;
    border-radius: 4px;
    margin-bottom: 1rem;
    max-height: 200px;
  }

  @media (max-width: 768px) {
    padding: 1rem;
    margin-top: 0.75rem;

    h3 {
      font-size: 1rem;
    }
  }
`;

const InfoBox = styled.div`
  background-color: #e7f3ff;
  border-left: 4px solid #667eea;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;

  &.warning {
    background-color: #fff3cd;
    border-left-color: #ffc107;
  }

  &.success {
    background-color: #d4edda;
    border-left-color: #28a745;
  }

  &.error {
    background-color: #f8d7da;
    border-left-color: #dc3545;
  }

  p {
    margin: 0;
    color: #1a1a1a;
    font-size: 0.95rem;
  }

  strong {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 700;
  }
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  color: #1a1a1a;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    background-color: #f5f5f5;
    border-color: #999;
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

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const LoadingContainer = styled.div`
  text-align: center;
  padding: 3rem;

  div {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  background: white;
  border: 1px solid #eee;
  border-radius: 8px;

  h3 {
    margin: 0 0 0.5rem 0;
    color: #1a1a1a;
  }

  p {
    margin: 0;
    color: #666;
  }

  a {
    display: inline-block;
    margin-top: 1rem;
    padding: 0.75rem 1.5rem;
    background-color: #667eea;
    color: white;
    border-radius: 4px;
    text-decoration: none;
    transition: background-color 0.2s;

    &:hover {
      background-color: #5568d3;
    }
  }
`;

const ContentLinksCard = styled.div`
  background: linear-gradient(135deg, #fff5f7 0%, #fffbf5 100%);
  border: 2px solid #ff6b9d;
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 1rem;

  h3 {
    margin: 0 0 1rem 0;
    color: #ff6b9d;
    font-size: 1.1rem;
    font-weight: 700;
  }
`;

const ContentLinkItem = styled.div`
  background: white;
  border: 1px solid #eee;
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 0.75rem;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .link-info {
    flex: 1;

    .platform {
      font-size: 0.85rem;
      color: #666;
      font-weight: 600;
      margin-bottom: 0.25rem;
    }

    .url {
      color: #667eea;
      text-decoration: none;
      word-break: break-all;
      font-size: 0.9rem;

      &:hover {
        text-decoration: underline;
      }
    }

    .date {
      font-size: 0.8rem;
      color: #999;
      margin-top: 0.25rem;
    }
  }

  .link-stats {
    text-align: right;
    margin-left: 1rem;

    .views {
      font-size: 0.9rem;
      color: #666;
      margin-bottom: 0.5rem;
    }
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;

  label {
    display: block;
    margin-bottom: 0.5rem;
    color: #1a1a1a;
    font-weight: 600;
  }

  input,
  select {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 0.95rem;
    box-sizing: border-box;

    &:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: ${props => props.$isOpen ? 'flex' : 'none'};
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

  h2 {
    margin: 0 0 1rem 0;
    color: #1a1a1a;
  }

  .error {
    background-color: #f8d7da;
    color: #721c24;
    padding: 0.75rem;
    border-radius: 4px;
    margin-bottom: 1rem;
    font-size: 0.9rem;
  }
`;

const ModalActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
`;

const CommissionCard = styled.div`
  background: linear-gradient(135deg, #d4f1d4 0%, #e8f5e9 100%);
  border: 2px solid #28a745;
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 1rem;

  h3 {
    margin: 0 0 0.75rem 0;
    color: #155724;
    font-size: 1.1rem;
    font-weight: 700;
  }

  .commission-info {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;

    .item {
      label {
        display: block;
        color: #666;
        font-size: 0.85rem;
        font-weight: 600;
        margin-bottom: 0.25rem;
      }

      .value {
        font-size: 1.25rem;
        font-weight: 700;
        color: #155724;
      }
    }
  }
`;


export default function InfluencerDashboardPage() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Fetch using hook
  const { data: application, isLoading, error, refetch } = useMyInfluencerApplication();

  // Content submission state
  const [showContentModal, setShowContentModal] = useState(false);
  const [contentFormData, setContentFormData] = useState({ url: '', platform: 'Instagram', title: '' });
  const [contentError, setContentError] = useState('');
  const [isSubmittingContent, setIsSubmittingContent] = useState(false);

  // Guard: redirect to login if not authenticated
  // Use a combination of both checks for robustness
  useEffect(() => {
    // Wait a bit for store to hydrate
    const timer = setTimeout(() => {
      if (!token && !isAuthenticated) {
        console.log('❌ No token found, redirecting to login');
        router.push('/login?redirect=/influencer/dashboard');
      } else {
        console.log('✅ User authenticated with token');
        // Refetch application data on mount
        refetch();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [token, isAuthenticated, router]);

  // Debug: Log application data when it changes
  useEffect(() => {
    if (application?.data) {
      console.log('📋 Application Data Loaded:', {
        email: application.data.email,
        name: application.data.name,
        status: application.data.status,
        id: application.data._id,
        userId: application.data.userId,
      });
    }
  }, [application]);

  // Handle content link submission
  const handleSubmitContent = async () => {
    // Validation
    if (!contentFormData.url.trim()) {
      setContentError('Please enter a valid URL');
      return;
    }

    if (!contentFormData.platform) {
      setContentError('Please select a platform');
      return;
    }

    // Clean URL - remove any special characters that might have been pasted
    const cleanUrl = contentFormData.url.trim().replace(/ː/g, ':');
    
    // Basic URL validation - must be a full post/video URL
    if (!/^https?:\/\/.+/.test(cleanUrl)) {
      setContentError('❌ Invalid URL format. Please enter the full post/video URL starting with http:// or https://');
      return;
    }

    // Check if URL is too short (likely incomplete)
    if (cleanUrl.length < 20) {
      setContentError('❌ URL seems incomplete. Please enter the full link to your specific post/video.');
      return;
    }

    // Validate platform-specific URLs
    const platformChecks = {
      Instagram: /instagram\.com/i,
      TikTok: /tiktok\.com/i,
      YouTube: /youtube\.com|youtu\.be/i,
      Twitter: /twitter\.com|x\.com/i,
      Twitch: /twitch\.tv/i,
      Facebook: /facebook\.com/i,
    };

    const isValidForPlatform = platformChecks[contentFormData.platform]?.test(cleanUrl);
    if (!isValidForPlatform) {
      setContentError(`❌ This URL doesn't look like a valid ${contentFormData.platform} link. Did you paste the correct link?`);
      return;
    }

    setIsSubmittingContent(true);
    setContentError('');

    try {
      const appId = application.data._id;
      console.log('📤 Submitting content link for app:', appId);

      const response = await axios.put(
        `http://localhost:5000/api/v1/influencer/${appId}/add-content`,
        {
          url: cleanUrl,
          platform: contentFormData.platform,
          title: contentFormData.title || undefined,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('✅ Content submitted:', response.data);

      if (response.data.success) {
        setShowContentModal(false);
        setContentFormData({ url: '', platform: 'Instagram', title: '' });
        refetch(); // Refresh dashboard data
        alert('✅ Content link submitted successfully! Thank you for your partnership.');
      } else {
        setContentError(response.data.message || 'Failed to submit content');
      }
    } catch (err) {
      console.error('❌ Content submission error:', err);
      setContentError(err.response?.data?.message || err.message || 'Failed to submit content');
    } finally {
      setIsSubmittingContent(false);
    }
  };

  // If no token, show loading to prevent showing the "No Application" state
  if (!token && !isAuthenticated) {
    return (
      <PageContainer>
        <LoadingContainer>
          <div />
        </LoadingContainer>
      </PageContainer>
    );
  }

  if (isLoading) {
    return (
      <PageContainer>
        <LoadingContainer>
          <div />
        </LoadingContainer>
      </PageContainer>
    );
  }

  if (error || application?.notFound) {
    return (
      <PageContainer>
        <Header>
          <Title>Application Status</Title>
          <Subtitle>View your influencer application details</Subtitle>
        </Header>

        <InfoBox className="error">
          <strong>⚠️ No Application Found</strong>
          <p>
            We couldn't find an influencer application linked to your account. 
            This might happen if your application was submitted before your account was fully authenticated.
          </p>
        </InfoBox>

        <EmptyState>
          <h3>Ready to Join Our Influencer Program?</h3>
          <p>
            Submit a new application to get started with exclusive product partnerships and earning opportunities.
          </p>
          <a href="/influencer/apply/form">Submit Application</a>
        </EmptyState>

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <Button onClick={() => refetch()}>Try Again</Button>
        </div>
      </PageContainer>
    );
  }

  const app = application?.data || application;

  // Safety check: if app is still not valid, show loading state
  if (!app || !app.email) {
    return (
      <PageContainer>
        <EmptyState>
          <h3>Loading Application...</h3>
          <p>Please wait while we load your application details...</p>
        </EmptyState>
      </PageContainer>
    );
  }

  const statusMessages = {
    pending: 'Your application is under review. We will contact you shortly with our decision.',
    approved: 'Congratulations! Your application has been approved. An admin will assign a product to you soon.',
    rejected: 'Unfortunately, your application was not approved at this time.',
  };

  return (
    <PageContainer>
      <Header>
        <Title>Application Status</Title>
        <Subtitle>View your influencer application and partnership details</Subtitle>
      </Header>

      {/* Status Message */}
      <InfoBox className={app.status === 'approved' ? 'success' : app.status === 'rejected' ? 'error' : 'warning'}>
        <strong>{app.status.charAt(0).toUpperCase() + app.status.slice(1)} Application</strong>
        <p>{statusMessages[app.status]}</p>
      </InfoBox>

      {/* Key Status Cards */}
      <StatusGrid>
        <StatusCard>
          <h3>Application Status</h3>
          <StatusBadge status={app.status}>
            {app.status}
          </StatusBadge>
        </StatusCard>

        {app.status === 'approved' && (
          <StatusCard>
            <h3>Fulfillment Status</h3>
            <FulfillmentBadge status={app.fulfillmentStatus || 'pending'}>
              {app.fulfillmentStatus || 'pending'}
            </FulfillmentBadge>
          </StatusCard>
        )}

        <StatusCard>
          <h3>Application Date</h3>
          <div className="value">
            {new Date(app.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </div>
        </StatusCard>
      </StatusGrid>

      {/* Personal Information */}
      <DetailCard>
        <h2>Personal Information</h2>
        <DetailRow>
          <label>Name</label>
          <div className="value">{app.name}</div>
        </DetailRow>
        <DetailRow>
          <label>Email</label>
          <div className="value">{app.email}</div>
        </DetailRow>
        <DetailRow>
          <label>Phone Number</label>
          <div className="value">{app.phoneNumber}</div>
        </DetailRow>
        <DetailRow>
          <label>Social Media Platforms</label>
          <div className="value">
            {app.platforms && app.platforms.length > 0
              ? app.platforms.join(', ')
              : 'N/A'}
          </div>
        </DetailRow>
        <DetailRow>
          <label>Follower Count</label>
          <div className="value">
            {app.followerCount?.toLocaleString() || 'N/A'}
          </div>
        </DetailRow>
      </DetailCard>

      {/* Application Details */}
      <DetailCard>
        <h2>Application Details</h2>
        {app.contentCommitment && (
          <DetailRow>
            <label>Content Commitment</label>
            <div className="value">
              {app.contentCommitment === 'total_videos'
                ? `${app.totalVideos} Total Videos`
                : app.contentCommitment === 'videos_per_month'
                ? `${app.videosPerMonth} Videos per Month`
                : app.contentCommitment === 'content_links'
                ? 'Content Links'
                : app.contentCommitment}
            </div>
          </DetailRow>
        )}

        {app.approvalNotes && (
          <DetailRow>
            <label>Admin Notes</label>
            <div className="value">{app.approvalNotes}</div>
          </DetailRow>
        )}

        {app.rejectionReason && (
          <DetailRow>
            <label>Rejection Reason</label>
            <div className="value">{app.rejectionReason}</div>
          </DetailRow>
        )}

        {app.approvedAt && (
          <DetailRow>
            <label>Approval Date</label>
            <div className="value">
              {new Date(app.approvedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </div>
          </DetailRow>
        )}

        {app.rejectedAt && (
          <DetailRow>
            <label>Rejection Date</label>
            <div className="value">
              {new Date(app.rejectedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </div>
          </DetailRow>
        )}
      </DetailCard>

      {/* Assigned Product */}
      {app.status === 'approved' && app.productAssigned && (
        <DetailCard>
          <h2>🎁 Assigned Product</h2>
          <ProductCard>
            <h3>{app.productAssigned.name}</h3>
            {app.productAssigned.images && app.productAssigned.images.length > 0 && (
              <img src={app.productAssigned.images[0]} alt={app.productAssigned.name} />
            )}
            <DetailRow>
              <label>Description</label>
              <div className="value">{app.productAssigned.description}</div>
            </DetailRow>
            <DetailRow>
              <label>Price</label>
              <div className="value">
                ${app.productAssigned.price?.toFixed(2)}
              </div>
            </DetailRow>

            {app.fulfillmentStatus === 'shipped' && app.trackingNumber && (
              <InfoBox className="success">
                <strong>📦 Shipment Tracking</strong>
                <p>Tracking Number: <strong>{app.trackingNumber}</strong></p>
                <p>Your product is on its way! Use the tracking number to check delivery status.</p>
              </InfoBox>
            )}

            {app.fulfillmentStatus === 'processing' && (
              <InfoBox className="warning">
                <strong>⏳ Preparing for Shipment</strong>
                <p>Your product has been approved for shipment. You'll receive tracking information and shipping details soon.</p>
              </InfoBox>
            )}

            {app.fulfillmentStatus === 'assigned' && (
              <InfoBox className="warning">
                <strong>⏳ Preparing for Shipment</strong>
                <p>Your product has been assigned and is being prepared for shipment. You'll receive tracking information soon.</p>
              </InfoBox>
            )}

            {app.fulfillmentStatus === 'delivered' && (
              <InfoBox className="success">
                <strong>✅ Delivered</strong>
                <p>Your product has been delivered. Thank you for your partnership!</p>
              </InfoBox>
            )}
          </ProductCard>
        </DetailCard>
      )}

      {/* Content Submission Section (only show when product shipped or delivered) */}
      {app.status === 'approved' && app.productAssigned && app.fulfillmentStatus !== 'pending' && (
        <DetailCard>
          <h2>📹 Content Submission</h2>
          
          <DetailRow>
            <label>Content Required</label>
            <div className="value">
              {app.totalVideos} {app.totalVideos === 1 ? 'video' : 'videos'}
            </div>
          </DetailRow>

          <DetailRow>
            <label>Content Submitted</label>
            <div className="value">
              {app.videosDelivered || 0} / {app.totalVideos}
            </div>
          </DetailRow>

          {/* Submitted Content Links */}
          {app.contentLinks && app.contentLinks.length > 0 && (
            <ContentLinksCard>
              <h3>✅ Submitted Links ({app.contentLinks.length})</h3>
              {app.contentLinks.map((link, idx) => (
                <ContentLinkItem key={idx}>
                  <div className="link-info">
                    <div className="platform">{link.platform}</div>
                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="url">
                      {link.title || link.url}
                    </a>
                    <div className="date">
                      Submitted: {link.postedAt || link.addedAt ? new Date(link.postedAt || link.addedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      }) : 'Date not available'}
                    </div>
                  </div>
                  <div className="link-stats">
                    {link.views && (
                      <div className="views">👁️ {link.views.toLocaleString()} views</div>
                    )}
                  </div>
                </ContentLinkItem>
              ))}
            </ContentLinksCard>
          )}

          {/* Submit More Content Button */}
          {(app.videosDelivered || 0) < app.totalVideos && (
            <div style={{ marginTop: '1rem' }}>
              <Button
                className="primary"
                onClick={() => setShowContentModal(true)}
              >
                Submit Content Link
              </Button>
            </div>
          )}

          {/* Completion Status */}
          {app.videosDelivered >= app.totalVideos && (
            <InfoBox className="success">
              <strong>✅ Content Fulfillment Complete!</strong>
              <p>You have submitted all required content. Thank you for completing your partnership commitment!</p>
            </InfoBox>
          )}
        </DetailCard>
      )}

      {/* Product Exchange Status */}
      {app.status === 'approved' && app.videosDelivered >= app.totalVideos && (
        <CommissionCard>
          <h3>🎁 Product Exchange Status</h3>
          <div className="commission-info">
            <div className="item">
              <label>Exchange Type</label>
              <div className="value">Content for Product</div>
            </div>
            <div className="item">
              <label>Status</label>
              <div className="value">{app.fulfillmentStatus === 'shipped' ? '📦 Shipped' : app.fulfillmentStatus === 'delivered' ? '✅ Delivered' : app.fulfillmentStatus === 'processing' ? '⏳ Processing' : 'Pending'}</div>
            </div>
          </div>
          <p style={{ marginTop: '1rem', color: '#155724', fontSize: '0.9rem' }}>
            {app.fulfillmentStatus === 'processing' ? 'Your content has been approved! We are preparing your free product for shipment.' : app.fulfillmentStatus === 'shipped' ? 'Your product is on the way!' : app.fulfillmentStatus === 'delivered' ? 'You have received your product. Thank you for your partnership!' : 'We will ship your product soon.'}
          </p>
        </CommissionCard>
      )}

      {/* Action Buttons */}
      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
        <Button onClick={() => refetch()}>Refresh Status</Button>
        <Button onClick={() => router.push('/influencer/apply/form')}>
          View Application Form
        </Button>
      </div>

      {/* Content Submission Modal */}
      <ModalOverlay $isOpen={showContentModal} onClick={() => setShowContentModal(false)}>
        <ModalContent onClick={(e) => e.stopPropagation()}>
          <h2>📹 Submit Content Link</h2>
          <p style={{ color: '#666', marginBottom: '1.5rem' }}>
            Share your content link showing the product. Accepted platforms: TikTok, Instagram, YouTube, Twitter, Twitch, Facebook
          </p>

          {contentError && <div className="error">{contentError}</div>}

          <FormGroup>
            <label>
              Platform
              <span style={{ color: '#dc3545', marginLeft: '0.25rem' }}>*</span>
            </label>
            <select
              value={contentFormData.platform}
              onChange={(e) => setContentFormData({ ...contentFormData, platform: e.target.value })}
            >
              <option value="Instagram">Instagram (Post or Reel)</option>
              <option value="TikTok">TikTok (Video)</option>
              <option value="YouTube">YouTube (Video or Short)</option>
              <option value="Twitter">Twitter/X (Post)</option>
              <option value="Twitch">Twitch (Stream or VOD)</option>
              <option value="Facebook">Facebook (Post or Video)</option>
            </select>
          </FormGroup>

          <FormGroup>
            <label>
              Content Link
              <span style={{ color: '#dc3545', marginLeft: '0.25rem' }}>*</span>
            </label>
            <input
              type="url"
              value={contentFormData.url}
              onChange={(e) => setContentFormData({ ...contentFormData, url: e.target.value })}
              placeholder="https://www.instagram.com/p/ABC123..."
            />
            <div style={{ fontSize: '0.85rem', color: '#999', marginTop: '0.5rem' }}>
              💡 Example: Paste the full URL of your specific post/video<br/>
              ✅ https://www.instagram.com/p/ABC123def456/<br/>
              ❌ https://www.instagram.com (missing post ID)
            </div>
          </FormGroup>

          <FormGroup>
            <label>Title (Optional)</label>
            <input
              type="text"
              value={contentFormData.title}
              onChange={(e) => setContentFormData({ ...contentFormData, title: e.target.value })}
              placeholder="e.g., Never thought this would be my favorite..."
            />
          </FormGroup>

          <ModalActions>
            <Button onClick={() => setShowContentModal(false)}>Cancel</Button>
            <Button
              className="primary"
              onClick={handleSubmitContent}
              disabled={isSubmittingContent || !contentFormData.url}
            >
              {isSubmittingContent ? 'Submitting...' : 'Submit Content'}
            </Button>
          </ModalActions>
        </ModalContent>
      </ModalOverlay>
    </PageContainer>
  );
}
