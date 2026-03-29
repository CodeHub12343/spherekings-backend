'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import { useReferralStore } from '@/stores/referralStore';

// ===== STYLED COMPONENTS =====

const Container = styled.div`
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  padding: 24px;
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 20px 0;
  padding: 0;
`;

const PresetButtonsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    gap: 8px;
  }

  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

const PresetButton = styled.button`
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  ${props =>
    props.isActive
      ? `
    background: #5b4dff;
    color: white;
    box-shadow: 0 2px 8px rgba(91, 77, 255, 0.3);
  `
      : `
    background: #f3f4f6;
    color: #6b7280;
    border: 1px solid #e5e7eb;

    &:hover {
      background: #e5e7eb;
      color: #374151;
    }
  `}

  &:active {
    transform: scale(0.98);
  }

  @media (max-width: 480px) {
    width: 100%;
    padding: 10px 12px;
  }
`;

const CustomDateContainer = styled.div`
  display: flex;
  gap: 16px;
  align-items: flex-end;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    gap: 12px;
  }

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
`;

const DateInputGroup = styled.div`
  flex: 1;

  @media (max-width: 480px) {
    width: 100%;
  }
`;

const DateLabel = styled.label`
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const DateInput = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  color: #1f2937;
  background: white;
  transition: all 0.2s ease;
  box-sizing: border-box;

  &:hover {
    border-color: #9ca3af;
  }

  &:focus {
    outline: none;
    border-color: #5b4dff;
    box-shadow: 0 0 0 3px rgba(91, 77, 255, 0.1);
  }

  &:disabled {
    background: #f9fafb;
    color: #9ca3af;
    cursor: not-allowed;
  }

  @media (max-width: 480px) {
    padding: 12px;
    font-size: 15px;
  }
`;

const ApplyButton = styled.button`
  padding: 10px 20px;
  background: #5b4dff;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  box-shadow: 0 2px 4px rgba(91, 77, 255, 0.2);

  &:hover {
    background: #4940d4;
    box-shadow: 0 4px 8px rgba(91, 77, 255, 0.3);
  }

  &:active {
    transform: scale(0.98);
  }

  &:disabled {
    background: #d1d5db;
    cursor: not-allowed;
    box-shadow: none;
  }

  @media (max-width: 480px) {
    width: 100%;
    padding: 12px;
    font-size: 14px;
  }
`;

const SelectedRangeContainer = styled.div`
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
`;

const SelectedRangeText = styled.p`
  font-size: 12px;
  color: #6b7280;
  margin: 0;
  padding: 0;

  span {
    font-weight: 600;
    color: #1f2937;
  }

  .date-value {
    color: #5b4dff;
    font-weight: 500;
  }
`;

// ===== COMPONENT =====
/**
 * DateRangeFilter Component
 * Allows users to select date range for referral analytics
 * Styled with styled-components for consistent design
 */
export default function DateRangeFilter() {
  const { dateRange, setDateRange } = useReferralStore();
  const [presetSelected, setPresetSelected] = useState('custom');

  // Handle preset selection
  const handlePreset = (days) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    setDateRange(
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    );
    setPresetSelected(days === 7 ? '7days' : days === 30 ? '30days' : days === 90 ? '90days' : 'custom');
  };

  // Handle custom date change
  const handleDateFromChange = (e) => {
    setDateRange(e.target.value, dateRange.dateTo);
    setPresetSelected('custom');
  };

  const handleDateToChange = (e) => {
    setDateRange(dateRange.dateFrom, e.target.value);
    setPresetSelected('custom');
  };

  // Handle today
  const handleToday = () => {
    const today = new Date().toISOString().split('T')[0];
    setDateRange(today, today);
    setPresetSelected('today');
  };

  // Handle this month
  const handleThisMonth = () => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    setDateRange(
      firstDay.toISOString().split('T')[0],
      lastDay.toISOString().split('T')[0]
    );
    setPresetSelected('month');
  };

  return (
    <Container>
      <Title>Date Range</Title>

      {/* Preset buttons */}
      <PresetButtonsContainer>
        <PresetButton
          onClick={handleToday}
          isActive={presetSelected === 'today'}
        >
          Today
        </PresetButton>

        <PresetButton
          onClick={() => handlePreset(7)}
          isActive={presetSelected === '7days'}
        >
          Last 7 days
        </PresetButton>

        <PresetButton
          onClick={() => handlePreset(30)}
          isActive={presetSelected === '30days'}
        >
          Last 30 days
        </PresetButton>

        <PresetButton
          onClick={() => handlePreset(90)}
          isActive={presetSelected === '90days'}
        >
          Last 90 days
        </PresetButton>

        <PresetButton
          onClick={handleThisMonth}
          isActive={presetSelected === 'month'}
        >
          This Month
        </PresetButton>
      </PresetButtonsContainer>

      {/* Custom date inputs */}
      <CustomDateContainer>
        <DateInputGroup>
          <DateLabel>From</DateLabel>
          <DateInput
            type="date"
            value={dateRange.dateFrom}
            onChange={handleDateFromChange}
            max={dateRange.dateTo}
          />
        </DateInputGroup>

        <DateInputGroup>
          <DateLabel>To</DateLabel>
          <DateInput
            type="date"
            value={dateRange.dateTo}
            onChange={handleDateToChange}
            min={dateRange.dateFrom}
            max={new Date().toISOString().split('T')[0]}
          />
        </DateInputGroup>

        <ApplyButton
          onClick={() => {
            const from = dateRange.dateFrom;
            const to = dateRange.dateTo;
            const daysSelected = Math.floor((new Date(to) - new Date(from)) / (1000 * 60 * 60 * 24));
            
            // Determine which preset was selected
            if (daysSelected === 0) setPresetSelected('today');
            else if (daysSelected === 6) setPresetSelected('7days');
            else if (daysSelected === 29) setPresetSelected('30days');
            else if (daysSelected === 89) setPresetSelected('90days');
            else setPresetSelected('custom');
          }}
        >
          Apply
        </ApplyButton>
      </CustomDateContainer>

      {/* Current selection display */}
      <SelectedRangeContainer>
        <SelectedRangeText>
          <span>Selected:</span>{' '}
          <span className="date-value">{dateRange.dateFrom}</span> to{' '}
          <span className="date-value">{dateRange.dateTo}</span>
        </SelectedRangeText>
      </SelectedRangeContainer>
    </Container>
  );
}
