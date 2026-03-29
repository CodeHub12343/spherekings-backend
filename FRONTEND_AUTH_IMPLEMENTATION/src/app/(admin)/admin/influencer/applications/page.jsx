'use client';

import { useState, useMemo, useEffect } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import axios from 'axios';
import { getProducts } from '@/api/services/productService';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

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

const TabsContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid #eee;
  flex-wrap: wrap;
  overflow-x: auto;

  @media (max-width: 768px) {
    gap: 0.5rem;
    margin-bottom: 1.5rem;
  }

  @media (max-width: 480px) {
    gap: 0.3rem;
  }
`;

const Tab = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  background-color: transparent;
  color: ${props => props.$active ? '#667eea' : '#666'};
  font-weight: ${props => props.$active ? '600' : '500'};
  font-size: 0.95rem;
  cursor: pointer;
  border-bottom: 3px solid ${props => props.$active ? '#667eea' : 'transparent'};
  transition: all 0.2s;
  margin-bottom: -2px;
  white-space: nowrap;

  @media (max-width: 768px) {
    padding: 0.6rem 1rem;
    font-size: 0.85rem;
  }

  @media (max-width: 480px) {
    padding: 0.5rem 0.75rem;
    font-size: 0.75rem;
  }

  &:hover {
    color: #667eea;
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
    grid-template-columns: repeat(3, 1fr);
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

  @media (max-width: 768px) {
    padding: 1rem;

    h3 {
      font-size: 0.75rem;
      margin-bottom: 0.3rem;
    }

    .number {
      font-size: 1.5rem;
    }
  }

  @media (max-width: 480px) {
    padding: 0.75rem;

    h3 {
      font-size: 0.65rem;
      margin-bottom: 0.2rem;
    }

    .number {
      font-size: 1.25rem;
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
      padding-left: 50%;
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
      case 'pending':
        return '#fff3cd';
      case 'approved':
        return '#d4edda';
      case 'rejected':
        return '#f8d7da';
      case 'assigned':
        return '#d1ecf1';
      case 'shipped':
        return '#cfe2ff';
      case 'delivered':
        return '#d1e7dd';
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
      case 'assigned':
        return '#0c5460';
      case 'shipped':
        return '#084298';
      case 'delivered':
        return '#0f5132';
      default:
        return '#383d41';
    }
  }};
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

  &.success {
    background-color: #28a745;
    color: white;
    border-color: #28a745;

    &:hover {
      background-color: #218838;
      border-color: #218838;
    }
  }

  &.info {
    background-color: #17a2b8;
    color: white;
    border-color: #17a2b8;

    &:hover {
      background-color: #138496;
      border-color: #138496;
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

const PlatformsList = styled.div`
  display: flex;
  gap: 0.25rem;
  flex-wrap: wrap;

  span {
    font-size: 0.8rem;
    padding: 0.25rem 0.5rem;
    background-color: #f0f0f0;
    border-radius: 3px;
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
  pointer-events: ${props => props.$isOpen ? 'auto' : 'none'};
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

const ModalActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;

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

const DetailModalContent = styled.div`
  background: white;
  border-radius: 8px;
  padding: 2rem;
  max-width: 800px;
  width: 90%;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);

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

  h2 {
    margin: 0 0 1.5rem 0;
    color: #1a1a1a;
    font-size: 1.5rem;
    border-bottom: 2px solid #eee;
    padding-bottom: 1rem;
  }

  h3 {
    margin: 1.5rem 0 1rem 0;
    color: #1a1a1a;
    font-size: 1.1rem;
    border-top: 1px solid #eee;
    padding-top: 1rem;
  }

  .detail-row {
    display: flex;
    justify-content: space-between;
    padding: 0.75rem 0;
    border-bottom: 1px solid #f0f0f0;

    .label {
      color: #666;
      font-weight: 600;
      min-width: 150px;
    }

    .value {
      color: #1a1a1a;
      font-weight: 500;
      text-align: right;
      flex: 1;
      word-break: break-word;
    }
  }

  .info-box {
    background: #e7f3ff;
    border-left: 4px solid #667eea;
    padding: 1rem;
    border-radius: 4px;
    margin: 1rem 0;
    font-size: 0.9rem;

    &.success {
      background: #d4edda;
      border-left-color: #28a745;
    }

    &.warning {
      background: #fff3cd;
      border-left-color: #ffc107;
    }

    &.danger {
      background: #f8d7da;
      border-left-color: #dc3545;
    }

    strong {
      display: block;
      margin-bottom: 0.25rem;
    }
  }

  .content-link {
    background: white;
    border: 1px solid #eee;
    border-radius: 6px;
    padding: 0.75rem;
    margin: 0.5rem 0;
    font-size: 0.9rem;

    .platform {
      font-weight: 600;
      color: #667eea;
      margin-bottom: 0.25rem;
    }

    .url {
      color: #0066cc;
      text-decoration: none;
      word-break: break-all;

      &:hover {
        text-decoration: underline;
      }
    }

    .date {
      color: #999;
      font-size: 0.85rem;
      margin-top: 0.25rem;
    }
  }

  .status-badge {
    display: inline-block;
    padding: 0.4rem 0.8rem;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 600;
    text-transform: capitalize;
  }
`;

const LoadingSpinner = styled.div`
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

export default function InfluencerApplicationsPage() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState(null);
  const [selectedApp, setSelectedApp] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [modalData, setModalData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('applications'); // 'applications' or 'content-approval'
  const [pendingContentStats, setPendingContentStats] = useState(0);

  // Load products for assignment
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setProductsLoading(true);
        const response = await getProducts({ limit: 100, status: 'active' });
        if (response.success) {
          setProducts(response.data?.data || response.data || []);
        }
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setProductsLoading(false);
      }
    };

    if (modalType === 'assign') {
      loadProducts();
    }
  }, [modalType]);

  // Load applications
  useEffect(() => {
    const loadApplications = async () => {
      try {
        if (!isAuthenticated || !token) {
          router.push('/login?redirect=/admin/influencer/applications');
          return;
        }

        const response = await axios.get(
          `${API_BASE_URL}/influencer/applications`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        console.log('Applications response:', response.data);

        if (response.data.success) {
          const apps = response.data.data || [];
          setApplications(apps);

          // Calculate stats
          setStats({
            pending: apps.filter(a => a.status === 'pending').length,
            approved: apps.filter(a => a.status === 'approved').length,
            rejected: apps.filter(a => a.status === 'rejected').length,
          });

          // Count pending content approvals (approved apps with submitted content that need review)
          const pendingContent = apps.filter(a => 
            a.status === 'approved' && 
            a.productAssigned && 
            a.contentLinks && 
            a.contentLinks.length > 0
          ).length;
          setPendingContentStats(pendingContent);
        }
      } catch (err) {
        console.error('Failed to load applications:', err);
        setError(err.response?.data?.message || 'Failed to load applications');
      } finally {
        setIsLoading(false);
      }
    };

    loadApplications();
  }, [isAuthenticated, token, router]);

  // Filter applications
  const filteredApplications = useMemo(() => {
    if (statusFilter === 'all') return applications;
    return applications.filter(app => app.status === statusFilter);
  }, [applications, statusFilter]);

  // Get applications pending content approval
  const pendingContentApprovals = useMemo(() => {
    return applications.filter(app => 
      app.status === 'approved' && 
      app.productAssigned && 
      app.contentLinks && 
      app.contentLinks.length > 0 &&
      !app.contentApproved &&
      !app.contentRejected
    );
  }, [applications]);

  const handleApprove = async () => {
    if (!selectedApp) {
      alert('No application selected');
      return;
    }
    setIsSubmitting(true);

    try {
      console.log('Approving application:', selectedApp._id);
      const requestData = {
        approvalNotes: modalData.notes || '', // Changed from 'notes' to 'approvalNotes'
      };
      
      console.log('Request body:', requestData);

      const response = await axios.put(
        `${API_BASE_URL}/influencer/applications/${selectedApp._id}/approve`,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000, // 10 second timeout
        }
      );

      console.log('Approve response:', response.data);

      if (response.data.success) {
        // Update application in state with new status
        setApplications(prev =>
          prev.map(app =>
            app._id === selectedApp._id
              ? { 
                  ...app, 
                  status: 'approved',
                  approvedAt: new Date().toISOString(),
                  approvalNotes: modalData.notes || ''
                }
              : app
          )
        );
        setModalType(null);
        setSelectedApp(null);
        setModalData({});
        alert('✅ Application approved successfully! The influencer will be notified and can now proceed with partnership onboarding.');
      } else {
        alert(response.data.message || 'Failed to approve application');
      }
    } catch (err) {
      console.error('Approve error:', err);
      console.error('Error response:', err.response?.data); // Log full error details
      
      if (err.code === 'ECONNABORTED') {
        alert('Request timed out. Please try again.');
      } else if (err.response?.data?.errors) {
        // Show validation errors
        const errorText = Object.entries(err.response.data.errors)
          .map(([field, msg]) => `${field}: ${msg}`)
          .join('\n');
        alert(`Validation Error:\n${errorText}`);
      } else {
        alert(err.response?.data?.message || err.message || 'Failed to approve application');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!selectedApp) {
      alert('No application selected');
      return;
    }
    
    // Validate rejection reason (backend requires min 10 characters)
    if (!modalData.reason || modalData.reason.trim().length < 10) {
      alert('Rejection reason must be at least 10 characters');
      return;
    }
    
    setIsSubmitting(true);

    try {
      console.log('Rejecting application:', selectedApp._id);
      const requestData = {
        rejectionReason: modalData.reason, // Changed from 'reason' to 'rejectionReason'
      };
      
      console.log('Request body:', requestData);

      const response = await axios.put(
        `${API_BASE_URL}/influencer/applications/${selectedApp._id}/reject`,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000, // 10 second timeout
        }
      );

      console.log('Reject response:', response.data);

      if (response.data.success) {
        // Update application in state with new status
        setApplications(prev =>
          prev.map(app =>
            app._id === selectedApp._id
              ? { 
                  ...app, 
                  status: 'rejected',
                  rejectionReason: modalData.reason,
                  rejectedAt: new Date().toISOString()
                }
              : app
          )
        );
        setModalType(null);
        setSelectedApp(null);
        setModalData({});
        alert('✅ Application rejected successfully! The influencer has been notified of the rejection.');
      } else {
        alert(response.data.message || 'Failed to reject application');
      }
    } catch (err) {
      console.error('Reject error:', err);
      console.error('Error response:', err.response?.data); // Log full error details
      
      if (err.code === 'ECONNABORTED') {
        alert('Request timed out. Please try again.');
      } else if (err.response?.data?.errors) {
        // Show validation errors
        const errorText = Object.entries(err.response.data.errors)
          .map(([field, msg]) => `${field}: ${msg}`)
          .join('\n');
        alert(`Validation Error:\n${errorText}`);
      } else {
        alert(err.response?.data?.message || err.message || 'Failed to reject application');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignProduct = async () => {
    if (!selectedApp) {
      alert('No application selected');
      return;
    }

    if (!modalData.productId) {
      alert('Please select a product');
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('🎁 Assigning product to application:', selectedApp._id);
      const requestData = {
        productId: modalData.productId,
        ...(modalData.trackingNumber && { trackingNumber: modalData.trackingNumber }),
      };

      const response = await axios.put(
        `${API_BASE_URL}/influencer/applications/${selectedApp._id}/assign-product`,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      console.log('✅ Product assignment response:', response.data);

      if (response.data.success) {
        // Update application in state
        setApplications(prev =>
          prev.map(app =>
            app._id === selectedApp._id
              ? { 
                  ...app, 
                  productAssigned: response.data.data.productAssigned,
                  fulfillmentStatus: 'processing',
                  ...(!modalData.trackingNumber && { trackingNumber: null })
                }
              : app
          )
        );
        setModalType(null);
        setSelectedApp(null);
        setModalData({});
        alert('✅ Product assigned successfully! The influencer will see the product on their dashboard.');
      } else {
        alert(response.data.message || 'Failed to assign product');
      }
    } catch (err) {
      console.error('❌ Product assignment error:', err);
      alert(err.response?.data?.message || err.message || 'Failed to assign product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddTracking = async () => {
    if (!selectedApp) {
      alert('No application selected');
      return;
    }

    if (!modalData.trackingNumber) {
      alert('Please enter a tracking number');
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('📦 Adding tracking to application:', selectedApp._id);
      const requestData = {
        trackingNumber: modalData.trackingNumber,
        fulfillmentStatus: modalData.fulfillmentStatus || 'shipped',
      };

      const response = await axios.put(
        `${API_BASE_URL}/influencer/applications/${selectedApp._id}/fulfillment`,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      console.log('✅ Tracking update response:', response.data);

      if (response.data.success) {
        // Update application in state
        setApplications(prev =>
          prev.map(app =>
            app._id === selectedApp._id
              ? { 
                  ...app, 
                  trackingNumber: modalData.trackingNumber,
                  fulfillmentStatus: modalData.fulfillmentStatus,
                  shippedAt: new Date().toISOString()
                }
              : app
          )
        );
        setModalType(null);
        setSelectedApp(null);
        setModalData({});
        alert('✅ Tracking number added! The influencer will receive shipment notification.');
      } else {
        alert(response.data.message || 'Failed to update tracking');
      }
    } catch (err) {
      console.error('❌ Tracking update error:', err);
      alert(err.response?.data?.message || err.message || 'Failed to update tracking');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Content Approval Functions
  const handleApproveContent = async () => {
    if (!selectedApp) {
      alert('No application selected');
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('✅ Approving content for application:', selectedApp._id);
      const requestData = {
        contentApprovalNotes: modalData.contentApprovalNotes || '',
      };

      const response = await axios.put(
        `${API_BASE_URL}/influencer/applications/${selectedApp._id}/approve-content`,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      console.log('✅ Content approval response:', response.data);

      if (response.data.success) {
        // Update application in state
        const updatedApp = { 
          ...selectedApp,
          contentApproved: true,
          contentApprovedAt: new Date().toISOString(),
          contentApprovalNotes: modalData.contentApprovalNotes || ''
        };
        
        setApplications(prev =>
          prev.map(app =>
            app._id === selectedApp._id ? updatedApp : app
          )
        );
        
        // Close review modal and immediately open tracking modal for shipment
        setSelectedApp(updatedApp);
        setModalType('trigger-shipment');
        setModalData({ trackingNumber: '', fulfillmentStatus: 'shipped' });
        
        alert('✅ Content approved! Now let\'s trigger shipment...');
      } else {
        alert(response.data.message || 'Failed to approve content');
      }
    } catch (err) {
      console.error('❌ Content approval error:', err);
      alert(err.response?.data?.message || err.message || 'Failed to approve content');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectContent = async () => {
    if (!selectedApp) {
      alert('No application selected');
      return;
    }

    if (!modalData.contentRejectionReason || modalData.contentRejectionReason.trim().length < 10) {
      alert('Rejection reason must be at least 10 characters');
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('❌ Rejecting content for application:', selectedApp._id);
      const requestData = {
        contentRejectReason: modalData.contentRejectionReason,
      };

      const response = await axios.put(
        `${API_BASE_URL}/influencer/applications/${selectedApp._id}/reject-content`,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      console.log('✅ Content rejection response:', response.data);

      if (response.data.success) {
        // Update application in state
        setApplications(prev =>
          prev.map(app =>
            app._id === selectedApp._id
              ? { 
                  ...app, 
                  contentRejected: true,
                  contentRejectReason: modalData.contentRejectionReason,
                  contentRejectedAt: new Date().toISOString()
                }
              : app
          )
        );
        setModalType(null);
        setSelectedApp(null);
        setModalData({});
        alert('✅ Content rejected. The influencer has been notified to resubmit.');
      } else {
        alert(response.data.message || 'Failed to reject content');
      }
    } catch (err) {
      console.error('❌ Content rejection error:', err);
      alert(err.response?.data?.message || err.message || 'Failed to reject content');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <PageContainer>
        <LoadingSpinner>
          <div />
        </LoadingSpinner>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <EmptyState>
          <h3>Error</h3>
          <p>{error}</p>
        </EmptyState>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Header>
        <Title>Influencer Management</Title>
        <Subtitle>Manage applications, approvals, and content submissions</Subtitle>
      </Header>

      {/* Tab Navigation */}
      <TabsContainer>
        <Tab 
          $active={activeTab === 'applications'}
          onClick={() => setActiveTab('applications')}
        >
          📋 Applications
        </Tab>
        <Tab 
          $active={activeTab === 'content-approval'}
          onClick={() => setActiveTab('content-approval')}
        >
          📹 Content Approval {pendingContentStats > 0 && <span style={{ marginLeft: '0.5rem', background: '#dc3545', color: 'white', borderRadius: '12px', padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>{pendingContentStats}</span>}
        </Tab>
      </TabsContainer>

      {/* Applications Tab */}
      {activeTab === 'applications' && (
        <>
          <StatsGrid>
            <StatCard>
              <h3>Pending</h3>
              <div className="number">{stats.pending}</div>
            </StatCard>
            <StatCard>
              <h3>Approved</h3>
              <div className="number">{stats.approved}</div>
            </StatCard>
            <StatCard>
              <h3>Rejected</h3>
              <div className="number">{stats.rejected}</div>
            </StatCard>
          </StatsGrid>

          <ControlsSection>
            <FilterSelect
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Applications</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </FilterSelect>
          </ControlsSection>

          {filteredApplications.length === 0 ? (
            <EmptyState>
              <h3>No Applications</h3>
              <p>No influencer applications found</p>
            </EmptyState>
          ) : (
            <TableContainer>
              <StyledTable>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Platforms</th>
                    <th>Followers</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplications.map(app => (
                    <tr key={app._id}>
                      <td data-label="Name">{app.name}</td>
                      <td data-label="Email">{app.email}</td>
                      <td data-label="Platforms">{app.platforms?.join(', ') || 'N/A'}</td>
                      <td data-label="Followers">{app.followerCount?.toLocaleString() || 'N/A'}</td>
                      <td data-label="Status">
                        <StatusBadge $status={app.status}>
                          {app.status}
                        </StatusBadge>
                      </td>
                      <td data-label="Actions">
                        <ActionButtons>
                          {app.status === 'pending' && (
                            <>
                              <Button
                                className="primary"
                                onClick={() => {
                                  setSelectedApp(app);
                                  setModalType('approve');
                                  setModalData({ notes: '' });
                                }}
                              >
                                Approve
                              </Button>
                              <Button
                                className="danger"
                                onClick={() => {
                                  setSelectedApp(app);
                                  setModalType('reject');
                                  setModalData({ reason: '' });
                                }}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                          {app.status === 'approved' && !app.productAssigned && (
                            <Button
                              className="success"
                              onClick={() => {
                                setSelectedApp(app);
                                setModalType('assign');
                                setModalData({ productId: '', trackingNumber: '' });
                              }}
                            >
                              Assign Product
                            </Button>
                          )}
                          {app.status === 'approved' && app.productAssigned && !app.trackingNumber && (
                            <Button
                              className="info"
                              onClick={() => {
                                setSelectedApp(app);
                                setModalType('tracking');
                                setModalData({ trackingNumber: '', fulfillmentStatus: 'shipped' });
                              }}
                            >
                              Add Tracking
                            </Button>
                          )}
                          <Button
                            onClick={() => {
                              setSelectedApp(app);
                              setModalType('details');
                            }}
                          >
                            View Details
                          </Button>
                        </ActionButtons>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </StyledTable>
            </TableContainer>
          )}
        </>
      )}

      {/* Content Approval Tab */}
      {activeTab === 'content-approval' && (
        <>
          <StatsGrid>
            <StatCard>
              <h3>Pending Approval</h3>
              <div className="number">{pendingContentApprovals.length}</div>
            </StatCard>
            <StatCard>
              <h3>Approved</h3>
              <div className="number">{applications.filter(a => a.contentApproved).length}</div>
            </StatCard>
            <StatCard>
              <h3>Rejected</h3>
              <div className="number">{applications.filter(a => a.contentRejected).length}</div>
            </StatCard>
          </StatsGrid>

          {pendingContentApprovals.length === 0 ? (
            <EmptyState>
              <h3>No Pending Content Approvals</h3>
              <p>All submitted content has been reviewed or is waiting for verification</p>
            </EmptyState>
          ) : (
            <TableContainer>
              <StyledTable>
                <thead>
                  <tr>
                    <th>Influencer</th>
                    <th>Product</th>
                    <th>Content Submitted</th>
                    <th>Platforms</th>
                    <th>Submitted Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingContentApprovals.map(app => (
                    <tr key={app._id}>
                      <td>{app.name}</td>
                      <td>{app.productAssigned?.name || 'N/A'}</td>
                      <td>
                        <strong>{app.contentLinks?.length || 0} / {app.totalVideos}</strong> items
                      </td>
                      <td>
                        <PlatformsList>
                          {app.contentLinks?.map((link, idx) => (
                            <span key={idx}>{link.platform}</span>
                          ))}
                        </PlatformsList>
                      </td>
                      <td>
                        {app.contentLinks?.[0]?.addedAt ? new Date(app.contentLinks[0].addedAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td>
                        <ActionButtons>
                          <Button
                            className="primary"
                            onClick={() => {
                              setSelectedApp(app);
                              setModalType('review-content');
                              setModalData({ contentApprovalNotes: '' });
                            }}
                          >
                            Review & Approve
                          </Button>
                          <Button
                            className="danger"
                            onClick={() => {
                              setSelectedApp(app);
                              setModalType('reject-content');
                              setModalData({ contentRejectionReason: '' });
                            }}
                          >
                            Reject
                          </Button>
                        </ActionButtons>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </StyledTable>
            </TableContainer>
          )}
        </>
      )}

      {/* Approve Modal */}
      <ModalOverlay $isOpen={modalType === 'approve'}>
        <ModalContent>
          <ModalHeader>Approve Application</ModalHeader>
          <FormGroup>
            <label>Notes (Optional)</label>
            <textarea
              value={modalData.notes || ''}
              onChange={(e) => setModalData({ ...modalData, notes: e.target.value })}
              placeholder="Add any notes for the influencer..."
            />
          </FormGroup>
          <ModalActions>
            <Button onClick={() => setModalType(null)}>Cancel</Button>
            <Button
              className="primary"
              onClick={handleApprove}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Approving...' : 'Approve'}
            </Button>
          </ModalActions>
        </ModalContent>
      </ModalOverlay>

      {/* Reject Modal */}
      <ModalOverlay $isOpen={modalType === 'reject'}>
        <ModalContent>
          <ModalHeader>Reject Application</ModalHeader>
          <FormGroup>
            <label>
              Reason for Rejection 
              <span style={{ color: '#dc3545', marginLeft: '0.25rem' }}>*</span>
              <span style={{ display: 'block', fontSize: '0.85rem', color: '#666', marginTop: '0.25rem' }}>
                (minimum 10 characters required)
              </span>
            </label>
            <textarea
              value={modalData.reason || ''}
              onChange={(e) => setModalData({ ...modalData, reason: e.target.value })}
              placeholder="Explain why this application is being rejected (min. 10 characters)..."
            />
            <span style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem', display: 'block' }}>
              {modalData.reason ? modalData.reason.length : 0}/500 characters
            </span>
          </FormGroup>
          <ModalActions>
            <Button onClick={() => setModalType(null)}>Cancel</Button>
            <Button
              className="danger"
              onClick={handleReject}
              disabled={isSubmitting || !modalData.reason || modalData.reason.trim().length < 10}
            >
              {isSubmitting ? 'Rejecting...' : 'Reject'}
            </Button>
          </ModalActions>
        </ModalContent>
      </ModalOverlay>

      {/* Assign Product Modal */}
      <ModalOverlay $isOpen={modalType === 'assign'}>
        <ModalContent>
          <ModalHeader>🎁 Assign Product to Influencer</ModalHeader>
          
          {productsLoading ? (
            <div style={{ padding: '1.5rem', textAlign: 'center', color: '#666' }}>
              Loading products...
            </div>
          ) : (
            <>
              <FormGroup>
                <label>
                  Select Product
                  <span style={{ color: '#dc3545', marginLeft: '0.25rem' }}>*</span>
                </label>
                <select
                  value={modalData.productId || ''}
                  onChange={(e) => setModalData({ ...modalData, productId: e.target.value })}
                >
                  <option value="">-- Choose a product --</option>
                  {products.map(product => (
                    <option key={product._id} value={product._id}>
                      {product.name} - ${product.price?.toFixed(2)} {product.stock === 0 ? '(Out of Stock)' : `(${product.stock} available)`}
                    </option>
                  ))}
                </select>
              </FormGroup>

              <FormGroup>
                <label>Tracking Number (Optional)</label>
                <input
                  type="text"
                  value={modalData.trackingNumber || ''}
                  onChange={(e) => setModalData({ ...modalData, trackingNumber: e.target.value })}
                  placeholder="e.g., TRK123456789"
                />
              </FormGroup>

              {selectedApp && (
                <div style={{ 
                  background: '#f5f5f5', 
                  padding: '1rem', 
                  borderRadius: '4px', 
                  marginBottom: '1rem',
                  fontSize: '0.9rem'
                }}>
                  <strong>Influencer:</strong> {selectedApp.name} ({selectedApp.email})<br />
                  <strong>Followers:</strong> {selectedApp.followerCount?.toLocaleString()}<br />
                  <strong>Content Commitment:</strong> {selectedApp.contentCommitment}
                </div>
              )}
            </>
          )}

          <ModalActions>
            <Button onClick={() => setModalType(null)}>Cancel</Button>
            <Button
              className="primary"
              onClick={handleAssignProduct}
              disabled={isSubmitting || !modalData.productId || productsLoading}
            >
              {isSubmitting ? 'Assigning...' : 'Assign Product'}
            </Button>
          </ModalActions>
        </ModalContent>
      </ModalOverlay>

      {/* Add Tracking Modal */}
      <ModalOverlay $isOpen={modalType === 'tracking'}>
        <ModalContent>
          <ModalHeader>📦 Add Shipment Tracking</ModalHeader>
          
          <FormGroup>
            <label>
              Tracking Number
              <span style={{ color: '#dc3545', marginLeft: '0.25rem' }}>*</span>
            </label>
            <input
              type="text"
              value={modalData.trackingNumber || ''}
              onChange={(e) => setModalData({ ...modalData, trackingNumber: e.target.value })}
              placeholder="e.g., 1Z999AA10123456784"
            />
          </FormGroup>

          <FormGroup>
            <label>Fulfillment Status</label>
            <select
              value={modalData.fulfillmentStatus || 'shipped'}
              onChange={(e) => setModalData({ ...modalData, fulfillmentStatus: e.target.value })}
            >
              <option value="processing">Processing (Not Yet Shipped)</option>
              <option value="shipped">Shipped (In Transit)</option>
              <option value="delivered">Delivered</option>
            </select>
          </FormGroup>

          {selectedApp?.productAssigned && (
            <div style={{ 
              background: '#f5f5f5', 
              padding: '1rem', 
              borderRadius: '4px', 
              marginBottom: '1rem',
              fontSize: '0.9rem'
            }}>
              <strong>Influencer:</strong> {selectedApp.name}<br />
              <strong>Product:</strong> {selectedApp.productAssigned?.name || 'Unknown'}<br />
              <strong>Current Status:</strong> {selectedApp.fulfillmentStatus || 'Pending'}
            </div>
          )}

          <ModalActions>
            <Button onClick={() => setModalType(null)}>Cancel</Button>
            <Button
              className="primary"
              onClick={handleAddTracking}
              disabled={isSubmitting || !modalData.trackingNumber}
            >
              {isSubmitting ? 'Updating...' : 'Update Tracking'}
            </Button>
          </ModalActions>
        </ModalContent>
      </ModalOverlay>

      {/* Comprehensive Details Modal */}
      <ModalOverlay $isOpen={modalType === 'details'}>
        <DetailModalContent>
          <h2>📋 Application Details - {selectedApp?.name}</h2>

          {/* Personal Information Section */}
          <h3>👤 Personal Information</h3>
          <div className="detail-row">
            <span className="label">Name:</span>
            <span className="value">{selectedApp?.name}</span>
          </div>
          <div className="detail-row">
            <span className="label">Email:</span>
            <span className="value">{selectedApp?.email}</span>
          </div>
          <div className="detail-row">
            <span className="label">Phone:</span>
            <span className="value">{selectedApp?.phoneNumber || 'N/A'}</span>
          </div>
          <div className="detail-row">
            <span className="label">Platforms:</span>
            <span className="value">{selectedApp?.platforms?.join(', ') || 'N/A'}</span>
          </div>
          <div className="detail-row">
            <span className="label">Followers:</span>
            <span className="value">{selectedApp?.followerCount?.toLocaleString() || 'N/A'}</span>
          </div>
          {selectedApp?.averageEngagementRate && (
            <div className="detail-row">
              <span className="label">Avg. Engagement:</span>
              <span className="value">{selectedApp.averageEngagementRate}%</span>
            </div>
          )}

          {/* Shipping Address Section */}
          <h3>📍 Shipping Address</h3>
          {selectedApp?.shippingAddress ? (
            <>
              <div className="detail-row">
                <span className="label">Street:</span>
                <span className="value">{selectedApp.shippingAddress.street}</span>
              </div>
              <div className="detail-row">
                <span className="label">City:</span>
                <span className="value">{selectedApp.shippingAddress.city}</span>
              </div>
              <div className="detail-row">
                <span className="label">State/Province:</span>
                <span className="value">{selectedApp.shippingAddress.state}</span>
              </div>
              <div className="detail-row">
                <span className="label">Postal Code:</span>
                <span className="value">{selectedApp.shippingAddress.postalCode}</span>
              </div>
              <div className="detail-row">
                <span className="label">Country:</span>
                <span className="value">{selectedApp.shippingAddress.country}</span>
              </div>
            </>
          ) : (
            <div className="info-box warning">
              <strong>No shipping address provided</strong>
            </div>
          )}

          {/* Social Media Handles */}
          {selectedApp?.socialHandles && (Object.values(selectedApp.socialHandles).some(h => h)) && (
            <>
              <h3>🔗 Social Media Handles</h3>
              {selectedApp.socialHandles.instagram && (
                <div className="detail-row">
                  <span className="label">Instagram:</span>
                  <span className="value">@{selectedApp.socialHandles.instagram}</span>
                </div>
              )}
              {selectedApp.socialHandles.tiktok && (
                <div className="detail-row">
                  <span className="label">TikTok:</span>
                  <span className="value">@{selectedApp.socialHandles.tiktok}</span>
                </div>
              )}
              {selectedApp.socialHandles.youtube && (
                <div className="detail-row">
                  <span className="label">YouTube:</span>
                  <span className="value">{selectedApp.socialHandles.youtube}</span>
                </div>
              )}
              {selectedApp.socialHandles.twitter && (
                <div className="detail-row">
                  <span className="label">Twitter:</span>
                  <span className="value">@{selectedApp.socialHandles.twitter}</span>
                </div>
              )}
              {selectedApp.socialHandles.twitch && (
                <div className="detail-row">
                  <span className="label">Twitch:</span>
                  <span className="value">{selectedApp.socialHandles.twitch}</span>
                </div>
              )}
              {selectedApp.socialHandles.facebook && (
                <div className="detail-row">
                  <span className="label">Facebook:</span>
                  <span className="value">{selectedApp.socialHandles.facebook}</span>
                </div>
              )}
              {selectedApp.socialHandles.linkedin && (
                <div className="detail-row">
                  <span className="label">LinkedIn:</span>
                  <span className="value">{selectedApp.socialHandles.linkedin}</span>
                </div>
              )}
            </>
          )}

          {/* Application Status Section */}
          <h3>✅ Application Status</h3>
          <div className="detail-row">
            <span className="label">Status:</span>
            <span className="value">
              <span className={`status-badge ${selectedApp?.status}`} style={{
                backgroundColor: selectedApp?.status === 'approved' ? '#d4edda' : selectedApp?.status === 'rejected' ? '#f8d7da' : '#fff3cd',
                color: selectedApp?.status === 'approved' ? '#155724' : selectedApp?.status === 'rejected' ? '#721c24' : '#856404'
              }}>
                {selectedApp?.status}
              </span>
            </span>
          </div>
          {selectedApp?.approvalNotes && (
            <div className="detail-row">
              <span className="label">Approval Notes:</span>
              <span className="value">{selectedApp.approvalNotes}</span>
            </div>
          )}
          {selectedApp?.rejectionReason && (
            <div className="info-box danger">
              <strong>Rejection Reason:</strong>
              {selectedApp.rejectionReason}
            </div>
          )}
          <div className="detail-row">
            <span className="label">Applied:</span>
            <span className="value">{new Date(selectedApp?.createdAt).toLocaleDateString()}</span>
          </div>
          {selectedApp?.approvedAt && (
            <div className="detail-row">
              <span className="label">Approved:</span>
              <span className="value">{new Date(selectedApp.approvedAt).toLocaleDateString()}</span>
            </div>
          )}
          {selectedApp?.rejectedAt && (
            <div className="detail-row">
              <span className="label">Rejected:</span>
              <span className="value">{new Date(selectedApp.rejectedAt).toLocaleDateString()}</span>
            </div>
          )}

          {/* Product Assignment Section */}
          {selectedApp?.status === 'approved' && (
            <>
              <h3>🎁 Product Assignment</h3>
              {selectedApp?.productAssigned ? (
                <>
                  <div className="detail-row">
                    <span className="label">Product:</span>
                    <span className="value">{selectedApp.productAssigned?.name || 'Loading...'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Price:</span>
                    <span className="value">${selectedApp.productAssigned?.price ? selectedApp.productAssigned.price.toFixed(2) : 'N/A'}</span>
                  </div>
                  {selectedApp.productAssigned?.description && (
                    <div className="detail-row">
                      <span className="label">Description:</span>
                      <span className="value">{selectedApp.productAssigned.description}</span>
                    </div>
                  )}
                  {selectedApp.productAssigned?.sku && (
                    <div className="detail-row">
                      <span className="label">SKU:</span>
                      <span className="value">{selectedApp.productAssigned.sku}</span>
                    </div>
                  )}
                </>
              ) : (
                <div className="info-box warning">
                  <strong>No product assigned yet</strong>
                  Product will be assigned after approval
                </div>
              )}
            </>
          )}

          {/* Content Commitment */}
          <h3>📝 Content Commitment</h3>
          <div className="detail-row">
            <span className="label">Commitment Type:</span>
            <span className="value">
              {selectedApp?.contentCommitment === 'total_videos' ? 'Total Videos' : 'Videos Per Day'}
            </span>
          </div>
          <div className="detail-row">
            <span className="label">Total Required:</span>
            <span className="value">{selectedApp?.totalVideos || 0} videos</span>
          </div>
          {selectedApp?.contentCommitment === 'videos_per_day' && selectedApp?.videosPerDay && (
            <div className="detail-row">
              <span className="label">Per Day:</span>
              <span className="value">{selectedApp.videosPerDay} videos</span>
            </div>
          )}

          {/* Fulfillment Status Section */}
          {selectedApp?.status === 'approved' && selectedApp?.productAssigned && (
            <>
              <h3>📦 Fulfillment Status</h3>
              <div className="detail-row">
                <span className="label">Status:</span>
                <span className="value">
                  <span className="status-badge" style={{
                    backgroundColor: selectedApp?.fulfillmentStatus === 'delivered' ? '#d1e7dd' : selectedApp?.fulfillmentStatus === 'shipped' ? '#d1ecf1' : selectedApp?.fulfillmentStatus === 'processing' ? '#cfe2ff' : '#e2e3e5',
                    color: selectedApp?.fulfillmentStatus === 'delivered' ? '#0f5132' : selectedApp?.fulfillmentStatus === 'shipped' ? '#0c5460' : selectedApp?.fulfillmentStatus === 'processing' ? '#084298' : '#383d41'
                  }}>
                    {selectedApp?.fulfillmentStatus || 'Pending'}
                  </span>
                </span>
              </div>
              {selectedApp?.trackingNumber && (
                <div className="info-box success">
                  <strong>📬 Tracking Number:</strong>
                  {selectedApp.trackingNumber}
                </div>
              )}
              <div className="detail-row">
                <span className="label">Product Assigned:</span>
                <span className="value">{selectedApp?.productAssigned?.name || 'N/A'}</span>
              </div>
              {selectedApp?.shippedAt && (
                <div className="detail-row">
                  <span className="label">Shipped Date:</span>
                  <span className="value">{new Date(selectedApp.shippedAt).toLocaleDateString()}</span>
                </div>
              )}
              {selectedApp?.deliveredAt && (
                <div className="detail-row">
                  <span className="label">Delivered Date:</span>
                  <span className="value">{new Date(selectedApp.deliveredAt).toLocaleDateString()}</span>
                </div>
              )}
              {selectedApp?.fulfillmentStatus === 'delivered' && !selectedApp?.deliveredAt && (
                <div className="info-box warning">
                  <strong>⚠️ Note:</strong>
                  Marked as delivered but delivery date not recorded. Please add/update tracking.
                </div>
              )}
            </>
          )}

          {/* Content Submission Section */}
          {selectedApp?.status === 'approved' && selectedApp?.productAssigned && (
            <>
              <h3>📹 Content Submission</h3>
              <div className="detail-row">
                <span className="label">Required:</span>
                <span className="value">{selectedApp?.totalVideos} {selectedApp?.totalVideos === 1 ? 'video' : 'videos'}</span>
              </div>
              <div className="detail-row">
                <span className="label">Submitted:</span>
                <span className="value">
                  <strong>{selectedApp?.videosDelivered || 0} / {selectedApp?.totalVideos}</strong>
                </span>
              </div>
              {selectedApp?.contentLinks && selectedApp.contentLinks.length > 0 && (
                <>
                  <div style={{ marginTop: '1rem', marginBottom: '0.5rem', fontWeight: '600', color: '#1a1a1a' }}>
                    Submitted Links:
                  </div>
                  {selectedApp.contentLinks.map((link, idx) => (
                    <div key={idx} className="content-link">
                      <div className="platform">🔗 {link.platform}</div>
                      <a href={link.url} target="_blank" rel="noopener noreferrer" className="url">
                        {link.title || link.url}
                      </a>
                      <div className="date">Submitted: {link.postedAt || link.addedAt ? new Date(link.postedAt || link.addedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      }) : 'Date not available'}</div>
                    </div>
                  ))}
                </>
              )}
            </>
          )}

          {/* Commission Section */}
          {selectedApp?.status === 'approved' && selectedApp?.videosDelivered >= selectedApp?.totalVideos && (
            <>
              <h3>💰 Commission</h3>
              <div className="detail-row">
                <span className="label">Rate:</span>
                <span className="value">10%</span>
              </div>
              <div className="detail-row">
                <span className="label">Status:</span>
                <span className="value">Pending Activation</span>
              </div>
              <div className="info-box success">
                <strong>✅ Ready for Commission</strong>
                All content requirements met. Commission will be activated upon validation.
              </div>
            </>
          )}

          {/* Close Button */}
          <ModalActions style={{ marginTop: '2rem' }}>
            <Button className="primary" onClick={() => setModalType(null)}>
              Close Details
            </Button>
          </ModalActions>
        </DetailModalContent>
      </ModalOverlay>

      {/* Content Review & Approve Modal */}
      <ModalOverlay $isOpen={modalType === 'review-content'}>
        <DetailModalContent>
          <h2>📹 Review Content Submission - {selectedApp?.name}</h2>

          {/* Content Links */}
          <h3>Submitted Content Links ({selectedApp?.contentLinks?.length || 0})</h3>
          {selectedApp?.contentLinks && selectedApp.contentLinks.length > 0 ? (
            <>
              {selectedApp.contentLinks.map((link, idx) => (
                <div key={idx} className="content-link">
                  <div className="platform">🔗 {link.platform}</div>
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="url">
                    {link.title || link.url}
                  </a>
                  <div className="date">
                    Posted: {link.postedAt ? new Date(link.postedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 'Date not available'}
                  </div>
                  {link.views !== undefined && (
                    <div className="date">👁️ {link.views.toLocaleString()} views</div>
                  )}
                </div>
              ))}
            </>
          ) : (
            <div className="info-box warning">
              <strong>No content links found</strong>
            </div>
          )}

          {/* Influencer Info */}
          <h3>Influencer Details</h3>
          <div className="detail-row">
            <span className="label">Name:</span>
            <span className="value">{selectedApp?.name}</span>
          </div>
          <div className="detail-row">
            <span className="label">Email:</span>
            <span className="value">{selectedApp?.email}</span>
          </div>
          <div className="detail-row">
            <span className="label">Product:</span>
            <span className="value">{selectedApp?.productAssigned?.name || 'N/A'}</span>
          </div>
          <div className="detail-row">
            <span className="label">Followers:</span>
            <span className="value">{selectedApp?.followerCount?.toLocaleString() || 'N/A'}</span>
          </div>

          {/* Approval Notes */}
          <h3>Review Notes</h3>
          <FormGroup>
            <label>Approval Comments (Optional)</label>
            <textarea
              value={modalData.contentApprovalNotes || ''}
              onChange={(e) => setModalData({ ...modalData, contentApprovalNotes: e.target.value })}
              placeholder="Add any feedback or notes before approving..."
              style={{ minHeight: '100px' }}
            />
          </FormGroup>

          {/* Action Buttons */}
          <ModalActions style={{ marginTop: '2rem' }}>
            <Button onClick={() => setModalType(null)}>Cancel</Button>
            <Button
              className="danger"
              onClick={() => {
                setModalType('reject-content');
                setModalData({ contentRejectionReason: '' });
              }}
            >
              Reject Content
            </Button>
            <Button
              className="primary"
              onClick={handleApproveContent}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Approving...' : '✅ Approve Content & Ship'}
            </Button>
          </ModalActions>
        </DetailModalContent>
      </ModalOverlay>

      {/* Content Rejection Modal */}
      <ModalOverlay $isOpen={modalType === 'reject-content'}>
        <ModalContent>
          <ModalHeader>❌ Reject Content Submission</ModalHeader>
          <p style={{ color: '#666', marginBottom: '1rem' }}>
            The influencer will be notified to resubmit content.
          </p>
          <FormGroup>
            <label>
              Reason for Rejection
              <span style={{ color: '#dc3545', marginLeft: '0.25rem' }}>*</span>
              <span style={{ display: 'block', fontSize: '0.85rem', color: '#666', marginTop: '0.25rem' }}>
                (minimum 10 characters required)
              </span>
            </label>
            <textarea
              value={modalData.contentRejectionReason || ''}
              onChange={(e) => setModalData({ ...modalData, contentRejectionReason: e.target.value })}
              placeholder="Explain why this content needs to be resubmitted. Be constructive..."
              style={{ minHeight: '120px' }}
            />
            <span style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem', display: 'block' }}>
              {modalData.contentRejectionReason ? modalData.contentRejectionReason.length : 0}/500 characters
            </span>
          </FormGroup>
          <ModalActions>
            <Button onClick={() => {
              setModalType('review-content');
              setModalData({ contentApprovalNotes: '' });
            }}>Back to Review</Button>
            <Button
              className="danger"
              onClick={handleRejectContent}
              disabled={isSubmitting || !modalData.contentRejectionReason || modalData.contentRejectionReason.trim().length < 10}
            >
              {isSubmitting ? 'Rejecting...' : 'Reject & Notify Influencer'}
            </Button>
          </ModalActions>
        </ModalContent>
      </ModalOverlay>

      {/* Trigger Shipment Modal (Post-Approval) */}
      <ModalOverlay $isOpen={modalType === 'trigger-shipment'}>
        <ModalContent>
          <ModalHeader>🚀 Trigger Shipment</ModalHeader>
          <p style={{ color: '#155724', marginBottom: '1rem', background: '#d4edda', padding: '0.75rem', borderRadius: '4px' }}>
            ✅ Content has been approved! Now prepare the product for shipment.
          </p>
          
          <FormGroup>
            <label>
              Tracking Number
              <span style={{ color: '#dc3545', marginLeft: '0.25rem' }}>*</span>
            </label>
            <input
              type="text"
              value={modalData.trackingNumber || ''}
              onChange={(e) => setModalData({ ...modalData, trackingNumber: e.target.value })}
              placeholder="e.g., 1Z999AA10123456784"
              autoFocus
            />
          </FormGroup>

          <FormGroup>
            <label>Shipment Status</label>
            <select
              value={modalData.fulfillmentStatus || 'shipped'}
              onChange={(e) => setModalData({ ...modalData, fulfillmentStatus: e.target.value })}
            >
              <option value="processing">Processing (Being Prepared)</option>
              <option value="shipped">Shipped (In Transit)</option>
              <option value="delivered">Delivered</option>
            </select>
          </FormGroup>

          {selectedApp?.productAssigned && (
            <div style={{ 
              background: '#f5f5f5', 
              padding: '1rem', 
              borderRadius: '4px', 
              marginBottom: '1rem',
              fontSize: '0.9rem'
            }}>
              <strong>📦 Shipment Summary</strong><br />
              <strong>Influencer:</strong> {selectedApp.name}<br />
              <strong>Product:</strong> {selectedApp.productAssigned?.name || 'Unknown'}<br />
              <strong>Value:</strong> ${selectedApp.productAssigned?.price?.toFixed(2)}<br />
              <strong>Delivery To:</strong> {selectedApp.shippingAddress?.city}, {selectedApp.shippingAddress?.country}
            </div>
          )}

          <ModalActions>
            <Button onClick={() => setModalType(null)}>Cancel</Button>
            <Button
              className="danger"
              onClick={() => {
                setModalType(null);
                setSelectedApp(null);
              }}
              style={{ marginRight: 'auto' }}
            >
              ← Back to Content Tab
            </Button>
            <Button
              className="success"
              onClick={handleAddTracking}
              disabled={isSubmitting || !modalData.trackingNumber}
            >
              {isSubmitting ? 'Processing...' : '🚚 Ship Now'}
            </Button>
          </ModalActions>
        </ModalContent>
      </ModalOverlay>
    </PageContainer>
  );
}
