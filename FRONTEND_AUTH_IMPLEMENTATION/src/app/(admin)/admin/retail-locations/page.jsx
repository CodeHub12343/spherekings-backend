'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useRetailLocations, useDeleteRetailLocation } from '@/api/hooks/useRetailLocations';
import { useToast } from '@/components/ui/Toast';
import { Plus, Trash2, Edit, MapPin, MapPinOff } from 'lucide-react';

const PageContainer = styled.div`
  min-height: 100vh;
  background: #f9fafb;
  padding: 32px 16px;

  @media (min-width: 768px) {
    padding: 40px 20px;
  }

  @media (min-width: 1024px) {
    padding: 40px 20px;
  }
`;

const PageHeader = styled.div`
  max-width: 1400px;
  margin: 0 auto 24px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  flex-wrap: wrap;

  @media (min-width: 768px) {
    gap: 20px;
    margin-bottom: 32px;
  }
`;

const HeaderLeft = styled.div`
  flex: 1;
  min-width: 0;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 4px;

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

const HeaderRight = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
  width: 100%;

  @media (min-width: 768px) {
    gap: 12px;
    width: auto;
  }
`;

const Controls = styled.div`
  max-width: 1400px;
  margin: 0 auto 20px;
  display: flex;
  gap: 12px;
  flex-direction: column;
  align-items: stretch;

  @media (min-width: 768px) {
    gap: 16px;
    flex-direction: row;
    align-items: center;
    margin-bottom: 24px;
  }
`;

const SearchInput = styled(Input)`
  width: 100%;
  flex: 1;

  @media (min-width: 768px) {
    max-width: 400px;
  }
`;

/* ===== DESKTOP TABLE (768px+) ===== */
const TableContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #f0f0f0;
  overflow: hidden;
  display: none;

  @media (min-width: 768px) {
    display: block;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
`;

const TableHeader = styled.thead`
  background: #f9fafb;
  border-bottom: 1px solid #f0f0f0;
`;

const TableHeaderCell = styled.th`
  padding: 16px;
  text-align: left;
  font-weight: 600;
  color: #6b7280;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
  border-bottom: 1px solid #f3f4f6;
  transition: background 0.2s;

  &:hover {
    background: #f9fafb;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const TableCell = styled.td`
  padding: 16px;
  color: #1f2937;
`;

/* ===== MOBILE CARDS (0-768px) ===== */
const CardsContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;

  @media (min-width: 768px) {
    display: none;
  }
`;

const Card = styled.div`
  background: white;
  border-radius: 12px;
  border: 1px solid #f0f0f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: all 0.2s;

  &:active {
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
  }

  @media (min-width: 480px) {
    padding: 20px;
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
`;

const CardLogoSection = styled.div`
  flex-shrink: 0;
`;

const CardInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const CardLocationName = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 4px;
  word-break: break-word;

  @media (min-width: 480px) {
    font-size: 16px;
  }
`;

const CardLocationCity = styled.div`
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 6px;
`;

const CardRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f3f4f6;

  &:last-of-type {
    border-bottom: none;
    padding-bottom: 0;
  }
`;

const CardLabel = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  flex-shrink: 0;
`;

const CardValue = styled.span`
  font-size: 13px;
  color: #1f2937;
  font-weight: 500;
  text-align: right;
  word-break: break-word;
`;

const LocationName = styled.div`
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
`;

const LocationCity = styled.div`
  font-size: 12px;
  color: #6b7280;
`;

const LogoImage = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 6px;
  object-fit: cover;
  border: 1px solid #e5e7eb;
`;

const LogoPlaceholder = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 6px;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  flex-shrink: 0;
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  background: ${(props) => (props.active ? '#d1fae5' : '#fee2e2')};
  color: ${(props) => (props.active ? '#065f46' : '#991b1b')};
`;

/* ===== ACTION BUTTONS (Touch-friendly) ===== */
const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;

  @media (max-width: 480px) {
    gap: 10px;
  }
`;

const ActionButton = styled.button`
  padding: 8px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: white;
  color: #6b7280;
  cursor: pointer;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s;
  font-weight: 500;
  white-space: nowrap;
  min-height: 36px;
  justify-content: center;

  @media (max-width: 480px) {
    padding: 10px 16px;
    min-height: 44px;
    flex: 1;
    font-size: 14px;
  }

  &:hover {
    background: #f3f4f6;
    border-color: #d1d5db;
    color: #1f2937;
  }

  &:active {
    background: #e5e7eb;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

const DeleteButton = styled(ActionButton)`
  color: #dc2626;
  border-color: #fecaca;

  &:hover {
    background: #fef2f2;
    border-color: #dc2626;
  }

  &:active {
    background: #fee2e2;
  }
`;

const CardActions = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f3f4f6;
`;

const CardActionButton = styled(ActionButton)`
  flex: 1;
  padding: 10px 14px;
  min-height: 44px;
  font-size: 14px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 40px;
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  color: #d1d5db;
`;

const EmptyText = styled.p`
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px;
`;

const EmptySubtext = styled.p`
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 24px;
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 40px;
  color: #6b7280;
  font-size: 14px;
`;

const ErrorContainer = styled.div`
  padding: 24px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #dc2626;
  text-align: center;
  margin-top: 20px;
`;

const PaginationContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 16px 0;
  display: flex;
  justify-content: center;
  gap: 6px;
  align-items: center;
  flex-wrap: wrap;

  @media (min-width: 768px) {
    gap: 8px;
    padding: 20px 0;
  }
`;

const PageButton = styled.button`
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: white;
  color: #6b7280;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
  min-height: 36px;
  min-width: 36px;

  @media (min-width: 768px) {
    padding: 8px 12px;
    font-size: 13px;
  }

  &:hover:not(:disabled) {
    background: #f3f4f6;
    border-color: #d1d5db;
  }

  &:active:not(:disabled) {
    background: #e5e7eb;
  }

  ${(props) =>
    props.active &&
    `
    background: #5b4dff;
    color: white;
    border-color: #5b4dff;
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

/**
 * Admin Retail Locations Management Page
 */
export default function RetailLocationsPage() {
  const router = useRouter();
  const { success, error: showError } = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [columnKey, setColumnKey] = useState(Date.now());

  const { data: result, isLoading, error } = useRetailLocations({
    page,
    limit: 10,
    ...(search && { search }),
  });

  const { mutateAsync: deleteLocation, isPending: isDeleting } = useDeleteRetailLocation();

  const handleDelete = async (locationId, locationName) => {
    if (!window.confirm(`Delete "${locationName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteLocation(locationId);
      success('Retail location deleted successfully!');
      // Reset to first page if we deleted from last item on non-first page
      if (result?.data?.length === 1 && page > 1) {
        setPage(1);
      } else {
        setColumnKey(Date.now()); // Force re-render
      }
    } catch (err) {
      showError(err.message || 'Failed to delete retail location');
    }
  };

  const locations = result?.data || [];
  const pagination = result?.pagination || {};
  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <PageContainer>
      <PageHeader>
        <HeaderLeft>
          <Title>Retail Locations</Title>
          <Subtitle>Manage your physical store locations</Subtitle>
        </HeaderLeft>
        <HeaderRight>
          <Button
            onClick={() => router.push('/admin/retail-locations/new')}
            icon={<Plus size={18} />}
          >
            Add Location
          </Button>
        </HeaderRight>
      </PageHeader>

      <Controls>
        <SearchInput
          placeholder="Search by name, city, or country..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </Controls>

      {isLoading ? (
        <>
          <TableContainer>
            <LoadingContainer>Loading retail locations...</LoadingContainer>
          </TableContainer>
          <CardsContainer>
            <LoadingContainer>Loading retail locations...</LoadingContainer>
          </CardsContainer>
        </>
      ) : error ? (
        <ErrorContainer>
          {error.message || 'Failed to load retail locations'}
        </ErrorContainer>
      ) : locations.length === 0 ? (
        <>
          <TableContainer>
            <EmptyState>
              <EmptyIcon>
                <MapPinOff />
              </EmptyIcon>
              <EmptyText>No retail locations yet</EmptyText>
              <EmptySubtext>
                Create your first retail location to get started
              </EmptySubtext>
              <Button
                onClick={() => router.push('/admin/retail-locations/new')}
                icon={<Plus size={18} />}
              >
                Create Location
              </Button>
            </EmptyState>
          </TableContainer>
          <CardsContainer>
            <EmptyState>
              <EmptyIcon>
                <MapPinOff />
              </EmptyIcon>
              <EmptyText>No retail locations yet</EmptyText>
              <EmptySubtext>
                Create your first retail location to get started
              </EmptySubtext>
              <Button
                onClick={() => router.push('/admin/retail-locations/new')}
                icon={<Plus size={18} />}
              >
                Create Location
              </Button>
            </EmptyState>
          </CardsContainer>
        </>
      ) : (
        <>
          {/* DESKTOP TABLE VIEW (768px+) */}
          <TableContainer>
            <Table key={columnKey}>
              <TableHeader>
                <tr>
                  <TableHeaderCell>Logo</TableHeaderCell>
                  <TableHeaderCell>Location</TableHeaderCell>
                  <TableHeaderCell>Address</TableHeaderCell>
                  <TableHeaderCell>Country</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell>Actions</TableHeaderCell>
                </tr>
              </TableHeader>
              <TableBody>
                {locations.map((location) => (
                  <TableRow key={location._id}>
                    <TableCell>
                      {location.logoUrl ? (
                        <LogoImage src={location.logoUrl} alt={location.name} />
                      ) : (
                        <LogoPlaceholder>
                          <MapPin size={20} />
                        </LogoPlaceholder>
                      )}
                    </TableCell>
                    <TableCell>
                      <LocationName>{location.name}</LocationName>
                      <LocationCity>
                        {location.city}, {location.state}
                      </LocationCity>
                    </TableCell>
                    <TableCell>{location.address}</TableCell>
                    <TableCell>{location.country}</TableCell>
                    <TableCell>
                      <StatusBadge active={location.isActive}>
                        {location.isActive ? 'Active' : 'Inactive'}
                      </StatusBadge>
                    </TableCell>
                    <TableCell>
                      <ActionButtons>
                        <ActionButton
                          onClick={() => router.push(`/admin/retail-locations/${location._id}`)}
                          title="Edit location"
                        >
                          <Edit size={14} />
                          Edit
                        </ActionButton>
                        <DeleteButton
                          onClick={() => handleDelete(location._id, location.name)}
                          disabled={isDeleting}
                          title="Delete location"
                        >
                          <Trash2 size={14} />
                          Delete
                        </DeleteButton>
                      </ActionButtons>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* MOBILE CARD VIEW (0-768px) */}
          <CardsContainer key={columnKey}>
            {locations.map((location) => (
              <Card key={location._id}>
                <CardHeader>
                  <CardLogoSection>
                    {location.logoUrl ? (
                      <LogoImage src={location.logoUrl} alt={location.name} />
                    ) : (
                      <LogoPlaceholder>
                        <MapPin size={20} />
                      </LogoPlaceholder>
                    )}
                  </CardLogoSection>
                  <CardInfo>
                    <CardLocationName>{location.name}</CardLocationName>
                    <CardLocationCity>
                      {location.city}, {location.state}
                    </CardLocationCity>
                  </CardInfo>
                </CardHeader>

                <CardRow>
                  <CardLabel>Address</CardLabel>
                  <CardValue>{location.address}</CardValue>
                </CardRow>

                <CardRow>
                  <CardLabel>Country</CardLabel>
                  <CardValue>{location.country}</CardValue>
                </CardRow>

                <CardRow>
                  <CardLabel>Status</CardLabel>
                  <CardValue>
                    <StatusBadge active={location.isActive}>
                      {location.isActive ? 'Active' : 'Inactive'}
                    </StatusBadge>
                  </CardValue>
                </CardRow>

                <CardActions>
                  <CardActionButton
                    onClick={() => router.push(`/admin/retail-locations/${location._id}`)}
                    title="Edit location"
                  >
                    <Edit size={16} />
                    Edit
                  </CardActionButton>
                  <DeleteButton
                    as="button"
                    onClick={() => handleDelete(location._id, location.name)}
                    disabled={isDeleting}
                    title="Delete location"
                    style={{ flex: 1 }}
                  >
                    <Trash2 size={16} />
                    Delete
                  </DeleteButton>
                </CardActions>
              </Card>
            ))}
          </CardsContainer>

          {totalPages > 1 && (
            <PaginationContainer>
              <PageButton
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                Previous
              </PageButton>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <PageButton
                  key={p}
                  onClick={() => setPage(p)}
                  active={page === p}
                >
                  {p}
                </PageButton>
              ))}

              <PageButton
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
              >
                Next
              </PageButton>
            </PaginationContainer>
          )}
        </>
      )}
    </PageContainer>
  );
}
