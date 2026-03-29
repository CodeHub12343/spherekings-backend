'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import ProductForm from '@/components/products/ProductForm';
import { useProductDetail, useUpdateProduct } from '@/hooks/useProducts';
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

const LoadingMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: #6b7280;
`;

const ErrorMessage = styled.div`
  background: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 20px;
  color: #991b1b;
  text-align: center;
`;

/**
 * Admin Edit Product Page
 */
export default function EditProductPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const { success, error } = useToast();

  const {
    data: product,
    isLoading: productLoading,
    error: productError,
  } = useProductDetail(id);

  const updateProduct = useUpdateProduct(id, {
    onSuccess: () => {
      success('Product updated successfully!');
      setTimeout(() => {
        router.push('/admin/products');
      }, 1500);
    },
    onError: (err) => {
      error(err.message || 'Failed to update product');
    },
  });

  const handleSubmit = async (data) => {
    try {
      await updateProduct.mutateAsync(data);
    } catch (err) {
      console.error('Update product error:', err);
    }
  };

  if (productLoading) {
    return (
      <PageContainer>
        <LoadingMessage>Loading product...</LoadingMessage>
      </PageContainer>
    );
  }

  if (productError) {
    return (
      <PageContainer>
        <PageHeader>
          <Title>Product Not Found</Title>
        </PageHeader>
        <ErrorMessage>
          The product you're trying to edit doesn't exist or has been deleted.
        </ErrorMessage>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader>
        <Title>Edit Product</Title>
        <Subtitle>Update product information</Subtitle>
      </PageHeader>

      <ProductForm
        product={product}
        isLoading={updateProduct.isPending}
        onSubmit={handleSubmit}
      />
    </PageContainer>
  );
}
