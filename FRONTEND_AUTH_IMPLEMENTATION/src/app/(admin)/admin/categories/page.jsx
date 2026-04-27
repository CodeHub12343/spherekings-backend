

'use client';
export const dynamic = 'force-dynamic';

import { Suspense } from 'react';

import styled from 'styled-components';
import { useState } from 'react';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/hooks/useCategories';
import { useToast } from '@/components/ui/Toast';
import { Trash2, Edit2, Plus } from 'lucide-react';

const PageContainer = styled.div`
  min-height: 100vh;
  background: #f9fafb;
  padding: 20px;

  @media (min-width: 768px) {
    padding: 40px 20px;
  }
`;

const PageHeader = styled.div`
  max-width: 1200px;
  margin: 0 auto 24px;

  @media (min-width: 768px) {
    margin-bottom: 32px;
  }
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 6px;

  @media (min-width: 768px) {
    font-size: 32px;
    margin-bottom: 8px;
  }
`;

const Subtitle = styled.p`
  font-size: 13px;
  color: #6b7280;
  margin: 0;

  @media (min-width: 768px) {
    font-size: 14px;
  }
`;

const ContentContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 20px;

  @media (min-width: 768px) {
    margin-bottom: 32px;
  }
`;

const Button = styled.button`
  padding: 12px 18px;
  background: ${props => props.danger ? '#ef4444' : '#5b4dff'};
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
  min-height: 44px;
  width: 100%;

  @media (min-width: 768px) {
    padding: 10px 20px;
    width: auto;
    min-height: auto;
  }

  &:hover {
    background: ${props => props.danger ? '#dc2626' : '#4a3dd4'};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const CategoriesTable = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  width: 100%;

  @media (max-width: 767px) {
    background: transparent;
    box-shadow: none;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr 1fr 100px;
  gap: 16px;
  padding: 20px 24px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  font-weight: 600;
  color: #6b7280;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  @media (max-width: 767px) {
    display: none;
  }
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr 1fr 100px;
  gap: 16px;
  padding: 16px 24px;
  border-bottom: 1px solid #f3f4f6;
  align-items: center;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: #fafafa;
  }

  @media (max-width: 767px) {
    display: flex;
    flex-direction: column;
    gap: 0;
    padding: 16px;
    border: none;
    background: white;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    align-items: stretch;

    &:hover {
      background: white;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
  }
`;

const RowCell = styled.div`
  display: contents;

  @media (max-width: 767px) {
    display: flex;
    flex-direction: column;
    padding: 12px 0;
    border-bottom: 1px solid #f3f4f6;

    &:last-child {
      border-bottom: none;
      padding-bottom: 0;
      padding-top: 12px;
    }

    &::before {
      content: attr(data-label);
      font-size: 12px;
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
  }
`;

const CategoryName = styled.div`
  font-weight: 600;
  color: #1f2937;
  font-size: 15px;

  @media (max-width: 767px) {
    font-size: 16px;
    font-weight: 700;
  }
`;

const CategoryDesc = styled.div`
  color: #6b7280;
  font-size: 13px;
  word-break: break-word;

  @media (max-width: 767px) {
    font-size: 14px;
    color: #374151;
  }
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background: ${props => props.active ? '#dcfce7' : '#fee2e2'};
  color: ${props => props.active ? '#15803d' : '#991b1b'};
  width: fit-content;

  @media (max-width: 767px) {
    align-self: flex-start;
    padding: 6px 14px;
    font-size: 13px;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;

  @media (max-width: 767px) {
    gap: 10px;
    margin-top: 4px;
  }
`;

const IconButton = styled.button`
  padding: 6px 12px;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  color: ${props => props.danger ? '#dc2626' : '#5b4dff'};
  min-height: 36px;
  min-width: 36px;

  @media (max-width: 767px) {
    flex: 1;
    padding: 10px;
    min-height: 44px;
    min-width: auto;
    font-size: 13px;

    &:not(:only-child) {
      flex: 1;
    }
  }

  &:hover {
    border-color: ${props => props.danger ? '#dc2626' : '#5b4dff'};
    background: ${props => props.danger ? '#fef2f2' : '#f9f7ff'};
  }

  svg {
    width: 16px;
    height: 16px;

    @media (max-width: 767px) {
      width: 18px;
      height: 18px;
    }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #6b7280;

  @media (min-width: 768px) {
    padding: 60px 20px;
  }

  h3 {
    font-size: 16px;
    color: #1f2937;
    margin: 0 0 8px;

    @media (min-width: 768px) {
      font-size: 18px;
    }
  }

  p {
    margin: 0;
    font-size: 13px;

    @media (min-width: 768px) {
      font-size: 14px;
    }
  }
`;

const Modal = styled.div`
  display: ${props => props.isOpen ? 'flex' : 'none'};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  align-items: flex-end;
  justify-content: center;
  z-index: 1000;
  padding: 0;

  @media (min-width: 768px) {
    align-items: center;
    padding: 0;
  }
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 16px 16px 0 0;
  padding: 24px;
  width: 100%;
  max-width: 100%;
  max-height: 90vh;
  overflow-y: auto;

  @media (min-width: 768px) {
    border-radius: 12px;
    padding: 32px;
    max-width: 500px;
    width: 90%;
    max-height: none;
  }
`;

const ModalTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 20px;

  @media (min-width: 768px) {
    font-size: 20px;
    margin-bottom: 24px;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 8px;
  font-size: 14px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  box-sizing: border-box;

  @media (min-width: 768px) {
    padding: 10px 12px;
  }

  &:focus {
    outline: none;
    border-color: #5b4dff;
    box-shadow: 0 0 0 3px rgba(91, 77, 255, 0.1);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  min-height: 100px;
  resize: vertical;
  box-sizing: border-box;

  @media (min-width: 768px) {
    padding: 10px 12px;
  }

  &:focus {
    outline: none;
    border-color: #5b4dff;
    box-shadow: 0 0 0 3px rgba(91, 77, 255, 0.1);
  }
`;

const ModalButtons = styled.div`
  display: flex;
  flex-direction: column-reverse;
  gap: 12px;
  margin-top: 24px;

  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: flex-end;
  }
`;

const CancelButton = styled(Button)`
  background: #e5e7eb;
  color: #1f2937;

  &:hover {
    background: #d1d5db;
  }
`;

/**
 * Categories Management Page
 * Admin only - Manage product categories
 */

function CategoriesPageContent() {
  // All hooks that need Suspense wrapping go here
  const { success, error: showError } = useToast();
  const { data: categories = [], isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    displayName: '',
    description: '',
  });

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        displayName: category.displayName,
        description: category.description || '',
      });
    } else {
      setEditingCategory(null);
      setFormData({ displayName: '', description: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setFormData({ displayName: '', description: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.displayName.trim()) {
      showError('Category name is required');
      return;
    }

    try {
      if (editingCategory) {
        await updateCategory.mutateAsync({
          categoryId: editingCategory._id,
          ...formData,
          name: formData.displayName.toLowerCase().replace(/\s+/g, '-'),
        });
        success('Category updated successfully!');
      } else {
        await createCategory.mutateAsync({
          ...formData,
          name: formData.displayName.toLowerCase().replace(/\s+/g, '-'),
        });
        success('Category created successfully!');
      }
      handleCloseModal();
    } catch (err) {
      showError(err.message || 'Failed to save category');
    }
  };

  const handleDelete = async (categoryId) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      await deleteCategory.mutateAsync(categoryId);
      success('Category deleted successfully!');
    } catch (err) {
      showError(err.message || 'Failed to delete category');
    }
  };

  return (
      <PageContainer>
        <PageHeader>
          <Title>Categories Management</Title>
          <Subtitle>Manage product categories for the marketplace</Subtitle>
        </PageHeader>

        <ContentContainer>
          <ButtonGroup>
            <Button onClick={() => handleOpenModal()}>
              <Plus size={18} />
              Add Category
            </Button>
          </ButtonGroup>

          {isLoading ? (
            <EmptyState>
              <h3>Loading...</h3>
            </EmptyState>
          ) : categories.length === 0 ? (
            <EmptyState>
              <h3>No categories yet</h3>
              <p>Create your first product category to get started</p>
            </EmptyState>
          ) : (
            <CategoriesTable>
              <TableHeader>
                <div>Name</div>
                <div>Description</div>
                <div>Status</div>
                <div>Actions</div>
              </TableHeader>

              {categories.map((category) => (
                <TableRow key={category._id}>
                  <CategoryName>{category.displayName}</CategoryName>
                  <CategoryDesc>{category.description || '—'}</CategoryDesc>
                  <StatusBadge active={category.isActive}>
                    {category.isActive ? 'Active' : 'Inactive'}
                  </StatusBadge>
                  <ActionButtons>
                    <IconButton 
                      onClick={() => handleOpenModal(category)}
                      title="Edit category"
                    >
                      <Edit2 size={16} />
                      <span style={{ display: 'none' }}>Edit</span>
                    </IconButton>
                    <IconButton 
                      danger 
                      onClick={() => handleDelete(category._id)}
                      title="Delete category"
                    >
                      <Trash2 size={16} />
                      <span style={{ display: 'none' }}>Delete</span>
                    </IconButton>
                  </ActionButtons>
                </TableRow>
              ))}
            </CategoriesTable>
          )}
        </ContentContainer>

        {/* Add/Edit Modal */}
        <Modal isOpen={isModalOpen}>
          <ModalContent>
            <ModalTitle>
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </ModalTitle>

            <form onSubmit={handleSubmit}>
              <FormGroup>
                <Label htmlFor="displayName">Category Name *</Label>
                <Input
                  id="displayName"
                  type="text"
                  placeholder="e.g., Electronics"
                  value={formData.displayName}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    displayName: e.target.value
                  }))}
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="description">Description</Label>
                <TextArea
                  id="description"
                  placeholder="Optional category description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    description: e.target.value
                  }))}
                />
              </FormGroup>

              <ModalButtons>
                <Button
                  type="button"
                  onClick={handleCloseModal}
                  style={{ background: '#e5e7eb', color: '#1f2937' }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createCategory.isPending || updateCategory.isPending}
                >
                  {editingCategory ? 'Update' : 'Create'} Category
                </Button>
              </ModalButtons>
            </form>
          </ModalContent>
        </Modal>
      </PageContainer>
  );
}

// Wrapper component for Suspense boundary
export default function CategoriesPage() {
  return (
    <Suspense fallback={<PageContainer><EmptyState><h3>Loading categories...</h3></EmptyState></PageContainer>}>
      <CategoriesPageContent />
    </Suspense>
  );
}
