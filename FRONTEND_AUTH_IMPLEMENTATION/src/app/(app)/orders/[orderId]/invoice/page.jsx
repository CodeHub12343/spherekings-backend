/**
 * Order Invoice Page
 * Displays and allows download of invoice
 */

'use client';

import styled from 'styled-components';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import orderService from '@/api/services/orderService';
import { useOrderDetails } from '@/hooks/useOrders';

const PageContainer = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 24px;

  @media (max-width: 640px) {
    padding: 16px;
  }
`;

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #2563eb;
  text-decoration: none;
  font-size: 0.875rem;
  margin-bottom: 24px;
  transition: color 0.2s;

  &:hover {
    color: #1d4ed8;
    text-decoration: underline;
  }
`;

const InvoiceContainer = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 40px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  @media (max-width: 640px) {
    padding: 24px;
  }

  @media print {
    border: none;
    box-shadow: none;
    padding: 0;
  }
`;

const InvoiceHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 40px;
  padding-bottom: 24px;
  border-bottom: 2px solid #e5e7eb;

  @media (max-width: 640px) {
    flex-direction: column;
    gap: 24px;
  }

  @media print {
    border-bottom: 1px solid #000;
  }
`;

const CompanyInfo = styled.div`
  h1 {
    margin: 0 0 8px 0;
    font-size: 1.5rem;
    font-weight: 700;
    color: #111827;
  }

  p {
    margin: 4px 0;
    color: #6b7280;
    font-size: 0.875rem;
  }
`;

const InvoiceInfo = styled.div`
  text-align: right;

  @media (max-width: 640px) {
    text-align: left;
  }

  div {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    font-size: 0.875rem;

    @media (max-width: 640px) {
      justify-content: flex-start;
      gap: 24px;
    }

    span:first-child {
      color: #6b7280;
      font-weight: 500;
      min-width: 100px;
    }

    span:last-child {
      color: #111827;
      font-weight: 600;
    }
  }
`;

const ItemsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin: 32px 0;

  thead {
    background: #f9fafb;
    border-bottom: 2px solid #d1d5db;

    @media print {
      background: none;
      border-bottom: 1px solid #000;
    }

    th {
      padding: 12px;
      text-align: left;
      font-size: 0.875rem;
      font-weight: 600;
      color: #374151;
    }
  }

  tbody {
    tr {
      border-bottom: 1px solid #e5e7eb;

      &:last-child {
        border-bottom: none;
      }
    }

    td {
      padding: 12px;
      font-size: 0.875rem;
      color: #111827;
    }
  }
`;

const SummarySection = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 32px;

  @media (max-width: 640px) {
    justify-content: center;
  }
`;

const SummaryTable = styled.table`
  width: 100%;
  max-width: 300px;
  border-collapse: collapse;

  tr {
    border-bottom: 1px solid #e5e7eb;
  }

  tr.total {
    border-bottom: 2px solid #d1d5db;
    border-top: 2px solid #d1d5db;
  }

  td {
    padding: 8px 12px;
    font-size: 0.875rem;
  }

  td:first-child {
    text-align: left;
    color: #6b7280;
  }

  td:last-child {
    text-align: right;
    color: #111827;
    font-weight: 600;
  }

  tr.total td {
    padding: 12px;
    font-weight: 700;
    color: #111827;
    font-size: 1rem;
  }
`;

const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 40px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;

  @media (max-width: 640px) {
    flex-direction: column;
    gap: 16px;
  }

  @media print {
    display: none;
  }
`;

const PrintButton = styled.button`
  padding: 10px 20px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #1d4ed8;
  }

  @media print {
    display: none;
  }
`;

const DownloadButton = styled(PrintButton)`
  background: #10b981;

  &:hover {
    background: #059669;
  }
`;

const LoadingState = styled.div`
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 48px;
  text-align: center;
  color: #6b7280;
`;

const ErrorState = styled(LoadingState)`
  background: #fef2f2;
  border-color: #fecaca;
  color: #991b1b;
`;

export default function InvoicePage({ params }) {
  const { orderId } = params;
  const { order, isLoading, error } = useOrderDetails(orderId);
  const [invoiceData, setInvoiceData] = useState(null);
  const [isLoadingInvoice, setIsLoadingInvoice] = useState(false);

  useEffect(() => {
    if (order?._id) {
      const fetchInvoice = async () => {
        setIsLoadingInvoice(true);
        try {
          const data = await orderService.getOrderInvoice(orderId);
          setInvoiceData(data?.invoice);
        } catch (err) {
          console.error('Error fetching invoice:', err);
        } finally {
          setIsLoadingInvoice(false);
        }
      };

      fetchInvoice();
    }
  }, [order?._id, orderId]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // This would typically trigger a PDF download
    // For now, we'll just print and let the user save as PDF
    handlePrint();
  };

  if (isLoading || isLoadingInvoice) {
    return (
      <PageContainer>
        <BackLink href={`/orders/${orderId}`}>← Back to Order</BackLink>
        <LoadingState>Loading invoice...</LoadingState>
      </PageContainer>
    );
  }

  if (error || !order) {
    return (
      <PageContainer>
        <BackLink href="/orders">← Back to Orders</BackLink>
        <ErrorState>{error || 'Invoice not found'}</ErrorState>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <BackLink href={`/orders/${orderId}`}>← Back to Order</BackLink>

      <InvoiceContainer>
        <InvoiceHeader>
          <CompanyInfo>
            <h1>INVOICE</h1>
            <p>Spherekings Marketplace</p>
          </CompanyInfo>

          <InvoiceInfo>
            <div>
              <span>Invoice #:</span>
              <span>{order.orderNumber}</span>
            </div>
            <div>
              <span>Invoice Date:</span>
              <span>{formatDate(order.createdAt)}</span>
            </div>
            {order.paymentDetails?.paidAt && (
              <div>
                <span>Payment Date:</span>
                <span>{formatDate(order.paymentDetails.paidAt)}</span>
              </div>
            )}
          </InvoiceInfo>
        </InvoiceHeader>

        {/* Items Table */}
        <ItemsTable>
          <thead>
            <tr>
              <th>Product</th>
              <th style={{ textAlign: 'center' }}>Quantity</th>
              <th style={{ textAlign: 'right' }}>Unit Price</th>
              <th style={{ textAlign: 'right' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {order.items?.map((item, index) => (
              <tr key={index}>
                <td>
                  <div style={{ marginBottom: '4px', fontWeight: 500 }}>
                    {item.productName}
                  </div>
                  {item.sku && (
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                      SKU: {item.sku}
                    </div>
                  )}
                </td>
                <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                <td style={{ textAlign: 'right' }}>{formatPrice(item.price)}</td>
                <td style={{ textAlign: 'right', fontWeight: 500 }}>
                  {formatPrice(item.subtotal)}
                </td>
              </tr>
            ))}
          </tbody>
        </ItemsTable>

        {/* Summary */}
        <SummarySection>
          <SummaryTable>
            <tbody>
              <tr>
                <td>Subtotal:</td>
                <td>{formatPrice(order.subtotal)}</td>
              </tr>
              {order.tax > 0 && (
                <tr>
                  <td>Tax ({((order.tax / order.subtotal) * 100).toFixed(0)}%):</td>
                  <td>{formatPrice(order.tax)}</td>
                </tr>
              )}
              {order.shipping > 0 && (
                <tr>
                  <td>Shipping:</td>
                  <td>{formatPrice(order.shipping)}</td>
                </tr>
              )}
              {order.discount > 0 && (
                <tr>
                  <td>Discount:</td>
                  <td>-{formatPrice(order.discount)}</td>
                </tr>
              )}
              <tr className="total">
                <td>Total:</td>
                <td>{formatPrice(order.total)}</td>
              </tr>
            </tbody>
          </SummaryTable>
        </SummarySection>

        <Footer>
          <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>
            Thank you for your purchase!
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <PrintButton onClick={handlePrint}>Print</PrintButton>
            <DownloadButton onClick={handleDownload}>Save as PDF</DownloadButton>
          </div>
        </Footer>
      </InvoiceContainer>
    </PageContainer>
  );
}
