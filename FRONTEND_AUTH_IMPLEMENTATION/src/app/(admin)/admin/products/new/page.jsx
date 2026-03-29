'use client';

import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import ProductForm from '@/components/products/ProductForm';
import { useCreateProduct } from '@/hooks/useProducts';
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
 * Admin Create Product Page
 */
export default function CreateProductPage() {
  const router = useRouter();
  const { success, error } = useToast();
  const createProduct = useCreateProduct({
    onSuccess: () => {
      success('Product created successfully!');
      setTimeout(() => {
        router.push('/admin/products');
      }, 1500);
    },
    onError: (err) => {
      error(err.message || 'Failed to create product');
    },
  });

  const handleSubmit = async (data) => {
    try {
      await createProduct.mutateAsync(data);
    } catch (err) {
      console.error('Create product error:', err);
    }
  };

  return (
    <PageContainer>
      <PageHeader>
        <Title>Create New Product</Title>
        <Subtitle>Add a new product to your catalog</Subtitle>
      </PageHeader>

      <ProductForm
        isLoading={createProduct.isPending}
        onSubmit={handleSubmit}
      />
    </PageContainer>
  );
}
