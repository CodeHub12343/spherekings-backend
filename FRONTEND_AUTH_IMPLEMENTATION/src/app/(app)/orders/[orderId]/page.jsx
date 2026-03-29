/**
 * Order Details Page
 * Shows complete order information
 */

'use client';

import styled from 'styled-components';
import { useOrderDetails } from '@/hooks/useOrders';
import OrderDetails from '@/components/orders/OrderDetails';

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;

  @media (max-width: 640px) {
    padding: 16px;
  }
`;

export default function OrderDetailsPage({ params }) {
  const { orderId } = params;
  const { order, isLoading, error } = useOrderDetails(orderId);

  return (
    <PageContainer>
      <OrderDetails
        order={order}
        isLoading={isLoading}
        error={error}
      />
    </PageContainer>
  );
}
