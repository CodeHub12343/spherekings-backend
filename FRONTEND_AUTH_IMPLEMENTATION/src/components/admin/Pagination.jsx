/**
 * PaginationControls - Pagination component for tables
 * Handles page navigation and limit selection
 */

'use client';

import styled from 'styled-components';

const PaginationContainer = styled.div`
  display: flex;
  items-align: center;
  justify-content: space-between;
  padding: 16px;
  background: white;
  border-top: 1px solid #e5e7eb;
  border-radius: 0 0 8px 8px;
  flex-wrap: wrap;
  gap: 16px;
`;

const PaginationInfo = styled.p`
  font-size: 13px;
  color: #6b7280;
  margin: 0;
`;

const PaginationControls = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const Button = styled.button`
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  color: #374151;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: #f3f4f6;
    border-color: #9ca3af;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &.active {
    background: #3b82f6;
    color: white;
    border-color: #3b82f6;
  }
`;

const PageNumbers = styled.div`
  display: flex;
  gap: 4px;
`;

const LimitSelect = styled.select`
  padding: 6px 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  color: #374151;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #9ca3af;
  }

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

interface PaginationProps {
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export function Pagination({
  page,
  limit,
  total,
  onPageChange,
  onLimitChange
}: PaginationProps) {
  const totalPages = Math.ceil(total / limit);
  const startRecord = (page - 1) * limit + 1;
  const endRecord = Math.min(page * limit, total);

  // Generate page numbers to display (max 7 pages)
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 7;
    const halfSide = Math.floor(maxPagesToShow / 2);

    let start = Math.max(1, page - halfSide);
    let end = Math.min(totalPages, page + halfSide);

    if (page - halfSide < 1) {
      end = Math.min(totalPages, end + (halfSide - page + 1));
    }
    if (page + halfSide > totalPages) {
      start = Math.max(1, start - (page + halfSide - totalPages));
    }

    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push('...');
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages) {
      if (end < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <PaginationContainer>
      <PaginationInfo>
        Showing {startRecord} to {endRecord} of {total} results
      </PaginationInfo>

      <PaginationControls>
        <Button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          title="Previous page"
        >
          ← Previous
        </Button>

        <PageNumbers>
          {getPageNumbers().map((pageNum, idx) => (
            <Button
              key={idx}
              onClick={() =>
                typeof pageNum === 'number' && onPageChange(pageNum)
              }
              disabled={pageNum === '...'}
              className={pageNum === page ? 'active' : ''}
              title={`Go to page ${pageNum}`}
            >
              {pageNum}
            </Button>
          ))}
        </PageNumbers>

        <Button
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          title="Next page"
        >
          Next →
        </Button>

        <LimitSelect
          value={limit}
          onChange={(e) => onLimitChange(parseInt(e.target.value))}
          title="Items per page"
        >
          <option value={10}>10 per page</option>
          <option value={20}>20 per page</option>
          <option value={50}>50 per page</option>
          <option value={100}>100 per page</option>
        </LimitSelect>
      </PaginationControls>
    </PaginationContainer>
  );
}
