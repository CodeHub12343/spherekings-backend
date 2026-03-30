'use client';
export const dynamic = 'force-dynamic';

import { useRouter, useParams } from 'next/navigation';
import { useEffect } from 'react';
import styled from 'styled-components';
import RetailLocationForm from '@/components/retail-locations/RetailLocationForm';
import { useRetailLocation, useUpdateRetailLocation } from '@/api/hooks/useRetailLocations';
import { useToast } from '@/components/ui/Toast';

const PageContainer = styled.div`
  min-height: 100vh;
  background: #f9fafb;
  padding: 40px 20px;
`;

const PageHeader = styled.div`
  max-width: 900px;
  margin: 0 auto 32px;
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px;
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: #6b7280;
  margin: 0;
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  font-size: 14px;
  color: #6b7280;
`;

const ErrorContainer = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 24px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #dc2626;
  text-align: center;
`;

/**
 * Admin Edit Retail Location Page
 */
export default function EditRetailLocationPage() {
  const router = useRouter();
  const params = useParams();
  const locationId = params?.id;
  const { success, error: showError } = useToast();

  const { data: location, isLoading, error } = useRetailLocation(locationId);
  const { mutateAsync: updateLocation, isPending } = useUpdateRetailLocation();

  const handleSubmit = async (formData) => {
    try {
      const result = await updateLocation({
        locationId,
        formData,
      });
      success('Retail location updated successfully!');
      setTimeout(() => {
        router.push('/admin/retail-locations');
      }, 1500);
    } catch (err) {
      showError(err.message || 'Failed to update retail location');
      throw err;
    }
  };

  if (isLoading) {
    return (
      <PageContainer>
        <PageHeader>
          <Title>Edit Retail Location</Title>
        </PageHeader>
        <LoadingContainer>Loading location details...</LoadingContainer>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <PageHeader>
          <Title>Edit Retail Location</Title>
        </PageHeader>
        <ErrorContainer>
          {error.message || 'Failed to load retail location'}
        </ErrorContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader>
        <Title>Edit Retail Location</Title>
        <Subtitle>{location?.name}</Subtitle>
      </PageHeader>

      <RetailLocationForm
        initialData={location}
        isLoading={isPending}
        onSubmit={handleSubmit}
      />
    </PageContainer>
  );
}
