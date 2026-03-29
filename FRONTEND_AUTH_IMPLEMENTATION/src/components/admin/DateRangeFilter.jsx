/**
 * DateRangeFilter - Filter component for date range selection
 */

'use client';

import styled from 'styled-components';
import { useState } from 'react';

const FilterContainer = styled.div`
  display: flex;
  gap: 12px;
  padding: 16px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  flex-wrap: wrap;
  align-items: center;
`;

const Label = styled.label`
  font-size: 13px;
  font-weight: 600;
  color: #374151;
`;

const InputGroup = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const Input = styled.input`
  padding: 6px 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 13px;
  color: #374151;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
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

  &:hover {
    background: #f3f4f6;
    border-color: #9ca3af;
  }

  &.primary {
    background: #3b82f6;
    color: white;
    border-color: #3b82f6;
  }
`;

const PresetButtons = styled.div`
  display: flex;
  gap: 6px;
`;

const PresetButton = styled.button`
  padding: 6px 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  color: #374151;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f3f4f6;
    border-color: #9ca3af;
  }

  &.active {
    background: #e0e7ff;
    color: #3730a3;
    border-color: #818cf8;
  }
`;

interface DateRangeFilterProps {
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (date: string) => void;
  onDateToChange: (date: string) => void;
  onReset?: () => void;
}

export function DateRangeFilter({
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  onReset
}: DateRangeFilterProps) {
  const [activePreset, setActivePreset] = useState<string>('');

  const getDateNDaysAgo = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
  };

  const handlePreset = (preset: string) => {
    setActivePreset(preset);
    const today = new Date().toISOString().split('T')[0];

    switch (preset) {
      case '7d':
        onDateFromChange(getDateNDaysAgo(7));
        onDateToChange(today);
        break;
      case '30d':
        onDateFromChange(getDateNDaysAgo(30));
        onDateToChange(today);
        break;
      case '90d':
        onDateFromChange(getDateNDaysAgo(90));
        onDateToChange(today);
        break;
      case 'mtd': // Month to date
        const firstDay = new Date();
        firstDay.setDate(1);
        onDateFromChange(firstDay.toISOString().split('T')[0]);
        onDateToChange(today);
        break;
      case 'all':
        setActivePreset('');
        onDateFromChange('');
        onDateToChange('');
        break;
    }
  };

  const handleReset = () => {
    setActivePreset('');
    onReset?.();
  };

  return (
    <FilterContainer>
      <Label>Date Range:</Label>

      <PresetButtons>
        <PresetButton
          className={activePreset === '7d' ? 'active' : ''}
          onClick={() => handlePreset('7d')}
        >
          Last 7 days
        </PresetButton>
        <PresetButton
          className={activePreset === '30d' ? 'active' : ''}
          onClick={() => handlePreset('30d')}
        >
          Last 30 days
        </PresetButton>
        <PresetButton
          className={activePreset === '90d' ? 'active' : ''}
          onClick={() => handlePreset('90d')}
        >
          Last 90 days
        </PresetButton>
        <PresetButton
          className={activePreset === 'mtd' ? 'active' : ''}
          onClick={() => handlePreset('mtd')}
        >
          Month to date
        </PresetButton>
        <PresetButton
          className={activePreset === 'all' ? 'active' : ''}
          onClick={() => handlePreset('all')}
        >
          All time
        </PresetButton>
      </PresetButtons>

      <InputGroup>
        <Label>From:</Label>
        <Input
          type="date"
          value={dateFrom}
          onChange={(e) => {
            setActivePreset('');
            onDateFromChange(e.target.value);
          }}
        />
      </InputGroup>

      <InputGroup>
        <Label>To:</Label>
        <Input
          type="date"
          value={dateTo}
          onChange={(e) => {
            setActivePreset('');
            onDateToChange(e.target.value);
          }}
        />
      </InputGroup>

      {(dateFrom || dateTo) && (
        <Button onClick={handleReset} title="Clear date filters">
          Clear
        </Button>
      )}
    </FilterContainer>
  );
}
