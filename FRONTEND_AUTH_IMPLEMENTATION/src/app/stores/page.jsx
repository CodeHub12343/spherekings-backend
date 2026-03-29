'use client';

import styled from 'styled-components';
import { useState } from 'react';
import RetailLocationCard from '@/components/retail-locations/RetailLocationCard';
import { useRetailLocations, useAvailableCountries } from '@/api/hooks/useRetailLocations';
import { MapPin, Search } from 'lucide-react';

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f9fafb 0%, #f3f0ff 100%);
  padding: 60px 20px;

  @media (max-width: 768px) {
    padding: 40px 20px;
  }
`;

const ContentWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const PageHeader = styled.div`
  text-align: center;
  margin-bottom: 60px;

  @media (max-width: 768px) {
    margin-bottom: 40px;
  }
`;

const PageTitle = styled.h1`
  font-size: 48px;
  font-weight: 800;
  color: #1f2937;
  margin: 0 0 16px;
  letter-spacing: -1px;

  @media (max-width: 768px) {
    font-size: 36px;
    margin-bottom: 12px;
  }

  @media (max-width: 480px) {
    font-size: 28px;
  }
`;

const PageSubtitle = styled.p`
  font-size: 18px;
  color: #6b7280;
  margin: 0;
  line-height: 1.6;

  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const FilterSection = styled.div`
  background: white;
  padding: 32px;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  margin-bottom: 48px;
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  align-items: center;

  @media (max-width: 768px) {
    padding: 24px;
    margin-bottom: 32px;
    flex-direction: column;
    align-items: stretch;
  }
`;

const SearchBox = styled.div`
  flex: 1;
  min-width: 250px;
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;

  @media (max-width: 768px) {
    min-width: 100%;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 12px 16px 12px 40px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #5b4dff;
    box-shadow: 0 0 0 3px rgba(91, 77, 255, 0.1);
  }

  @media (max-width: 768px) {
    padding: 11px 16px 11px 40px;
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 12px;
  color: #6b7280;
  display: flex;
  align-items: center;
`;

const CountryFilter = styled.select`
  padding: 12px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 180px;

  &:focus {
    outline: none;
    border-color: #5b4dff;
    box-shadow: 0 0 0 3px rgba(91, 77, 255, 0.1);
  }

  @media (max-width: 768px) {
    min-width: 100%;
  }
`;

const LocationsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 28px;
  margin-bottom: 48px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
    margin-bottom: 32px;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 40px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
`;

const EmptyIcon = styled.div`
  font-size: 56px;
  margin-bottom: 16px;
  color: #d1d5db;
`;

const EmptyText = styled.p`
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px;
`;

const EmptySubtext = styled.p`
  font-size: 14px;
  color: #6b7280;
  margin: 0;
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 40px;
  color: #6b7280;
  font-size: 14px;
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 48px;
  padding-top: 48px;
  border-top: 1px solid rgba(31, 41, 55, 0.1);

  @media (max-width: 768px) {
    margin-top: 32px;
    padding-top: 32px;
  }
`;

const StatCard = styled.div`
  text-align: center;
`;

const StatNumber = styled.div`
  font-size: 32px;
  font-weight: 800;
  color: #5b4dff;
  margin-bottom: 8px;

  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
`;

/**
 * Public Retail Locations Page
 * Display all active retail locations with filtering
 */
export default function RetailLocationsPage() {
  const [page, setPage] = useState(1);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: result, isLoading } = useRetailLocations({
    page,
    limit: 12,
    ...(selectedCountry && { country: selectedCountry }),
    ...(searchQuery && { search: searchQuery }),
  });

  const { data: countries } = useAvailableCountries();

  const locations = result?.data || [];
  const pagination = result?.pagination || {};

  const handleCountryChange = (e) => {
    setSelectedCountry(e.target.value);
    setPage(1);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  return (
    <PageContainer>
      <ContentWrapper>
        <PageHeader>
          <PageTitle>Our Retail Locations</PageTitle>
          <PageSubtitle>
            Find SphereKings at our partner retail stores worldwide
          </PageSubtitle>
        </PageHeader>

        <FilterSection>
          <SearchBox>
            <SearchIcon>
              <Search size={18} />
            </SearchIcon>
            <SearchInput
              type="text"
              placeholder="Search by name, city, or store..."
              value={searchQuery}
              onChange={handleSearch}
            />
          </SearchBox>

          <CountryFilter value={selectedCountry} onChange={handleCountryChange}>
            <option value="">All Countries</option>
            {countries?.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </CountryFilter>
        </FilterSection>

        {isLoading ? (
          <LoadingContainer>Loading retail locations...</LoadingContainer>
        ) : locations.length === 0 ? (
          <EmptyState>
            <EmptyIcon>
              <MapPin />
            </EmptyIcon>
            <EmptyText>No locations found</EmptyText>
            <EmptySubtext>
              Try adjusting your search filters or check back soon
            </EmptySubtext>
          </EmptyState>
        ) : (
          <>
            <LocationsGrid>
              {locations.map((location) => (
                <RetailLocationCard key={location._id} location={location} />
              ))}
            </LocationsGrid>

            {pagination.total > 0 && (
              <StatsContainer>
                <StatCard>
                  <StatNumber>{pagination.total}</StatNumber>
                  <StatLabel>Total Locations</StatLabel>
                </StatCard>
                <StatCard>
                  <StatNumber>{countries?.length || 0}</StatNumber>
                  <StatLabel>Countries</StatLabel>
                </StatCard>
                <StatCard>
                  <StatNumber>{locations.length}</StatNumber>
                  <StatLabel>On This Page</StatLabel>
                </StatCard>
              </StatsContainer>
            )}
          </>
        )}
      </ContentWrapper>
    </PageContainer>
  );
}
