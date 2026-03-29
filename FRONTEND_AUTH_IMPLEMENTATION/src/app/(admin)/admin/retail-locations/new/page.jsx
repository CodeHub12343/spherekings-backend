'use client';

import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import RetailLocationForm from '@/components/retail-locations/RetailLocationForm';
import { useCreateRetailLocation } from '@/api/hooks/useRetailLocations';
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

/**
 * Admin Create Retail Location Page
 */
export default function CreateRetailLocationPage() {
  const router = useRouter();
  const { success, error } = useToast();
  const { mutateAsync: createLocation, isPending } = useCreateRetailLocation();

  const handleSubmit = async (formData) => {
    try {
      const result = await createLocation(formData);
      success('Retail location created successfully!');
      setTimeout(() => {
        router.push('/admin/retail-locations');
      }, 1500);
    } catch (err) {
      error(err.message || 'Failed to create retail location');
      throw err;
    }
  };

  return (
    <PageContainer>
      <PageHeader>
        <Title>Create New Retail Location</Title>
        <Subtitle>Add a new physical retail store location</Subtitle>
      </PageHeader>

      <RetailLocationForm
        isLoading={isPending}
        onSubmit={handleSubmit}
      />
    </PageContainer>
  );
}
