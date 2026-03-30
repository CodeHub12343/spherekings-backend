'use client';

'use client';

import { useState, useCallback } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  box-sizing: border-box;
`;

const Label = styled.label`
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
`;

const SliderContainer = styled.div`
  position: relative;
  width: 100%;
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  margin: 16px 0;
  box-sizing: border-box;
  overflow: hidden;
`;

const SliderTrack = styled.div`
  position: absolute;
  height: 6px;
  background: linear-gradient(90deg, #5b4dff 0%, #5b4dff 100%);
  border-radius: 3px;
  left: ${props => props.left}%;
  right: ${props => props.right}%;
  pointer-events: none;
  z-index: 5;
`;

const SliderInput = styled.input`
  position: absolute;
  width: 100%;
  height: 6px;
  top: 0;
  background: transparent;
  border: none;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  pointer-events: none;
  z-index: ${props => (props.zIndex || 5)};

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: white;
    border: 2px solid #5b4dff;
    cursor: pointer;
    pointer-events: auto;
    box-shadow: 0 2px 8px rgba(91, 77, 255, 0.2);
    transition: all 0.2s;

    &:hover {
      box-shadow: 0 4px 12px rgba(91, 77, 255, 0.3);
      transform: scale(1.1);
    }

    &:active {
      box-shadow: 0 2px 8px rgba(91, 77, 255, 0.4);
    }
  }

  &::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: white;
    border: 2px solid #5b4dff;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(91, 77, 255, 0.2);
    transition: all 0.2s;

    &:hover {
      box-shadow: 0 4px 12px rgba(91, 77, 255, 0.3);
      transform: scale(1.1);
    }

    &:active {
      box-shadow: 0 2px 8px rgba(91, 77, 255, 0.4);
    }
  }

  // Pointer events for drag
  &::-webkit-slider-runnable-track {
    background: transparent;
    border: none;
  }

  &::-moz-range-track {
    background: transparent;
    border: none;
  }
`;

const InputGroup = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  margin-top: 16px;
`;

const PriceInput = styled.input`
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
  color: #1f2937;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #5b4dff;
    box-shadow: 0 0 0 3px rgba(91, 77, 255, 0.1);
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const Separator = styled.span`
  color: #9ca3af;
  font-weight: 600;
`;

const PriceDisplay = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f9fafb;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
`;

const PriceValue = styled.span`
  color: #5b4dff;
`;

const ResetButton = styled.button`
  width: 100%;
  padding: 8px 12px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #5b4dff;
    color: #5b4dff;
    background: #f0f0ff;
  }
`;

/**
 * PriceRangeSlider Component
 * 
 * Features:
 * - Dual-range slider with min/max inputs
 * - Responsive and touch-friendly
 * - Visual price display
 * - Manual input fields
 * - Reset button
 * 
 * Usage:
 * <PriceRangeSlider
 *   min={0}
 *   max={500}
 *   minPrice={minPrice}
 *   maxPrice={maxPrice}
 *   onPriceChange={handlePriceChange}
 *   step={10}
 *   currency="$"
 * />
 */
export default function PriceRangeSlider({
  min = 0,
  max = 1000,
  minPrice = 0,
  maxPrice = 1000,
  onPriceChange = () => {},
  step = 1,
  currency = '$',
  label = 'Price Range',
}) {
  const [localMin, setLocalMin] = useState(minPrice);
  const [localMax, setLocalMax] = useState(maxPrice);

  // Handle min slider change
  const handleMinChange = useCallback(
    (e) => {
      const newMin = Number(e.target.value);
      if (newMin <= localMax) {
        setLocalMin(newMin);
        onPriceChange(newMin, localMax);
      }
    },
    [localMax, onPriceChange]
  );

  // Handle max slider change
  const handleMaxChange = useCallback(
    (e) => {
      const newMax = Number(e.target.value);
      if (newMax >= localMin) {
        setLocalMax(newMax);
        onPriceChange(localMin, newMax);
      }
    },
    [localMin, onPriceChange]
  );

  // Handle min input field change
  const handleMinInputChange = (e) => {
    const value = e.target.value === '' ? min : Number(e.target.value);
    if (value >= min && value <= localMax) {
      setLocalMin(value);
      onPriceChange(value, localMax);
    }
  };

  // Handle max input field change
  const handleMaxInputChange = (e) => {
    const value = e.target.value === '' ? max : Number(e.target.value);
    if (value <= max && value >= localMin) {
      setLocalMax(value);
      onPriceChange(localMin, value);
    }
  };

  // Reset to defaults
  const handleReset = () => {
    setLocalMin(min);
    setLocalMax(max);
    onPriceChange(min, max);
  };

  // Calculate percentage for visual track
  const minPercent = ((localMin - min) / (max - min)) * 100;
  const maxPercent = 100 - ((localMax - min) / (max - min)) * 100;

  return (
    <Container>
      <Label htmlFor="min-price">{label}</Label>

      {/* Slider Inputs */}
      <SliderContainer>
        <SliderTrack left={minPercent} right={maxPercent} />
        <SliderInput
          id="min-price"
          type="range"
          min={min}
          max={max}
          value={localMin}
          onChange={handleMinChange}
          step={step}
          zIndex={localMin > max - (max - min) / 2 ? 6 : 5}
          aria-label="Minimum price"
        />
        <SliderInput
          id="max-price"
          type="range"
          min={min}
          max={max}
          value={localMax}
          onChange={handleMaxChange}
          step={step}
          aria-label="Maximum price"
        />
      </SliderContainer>

      {/* Display Price Range */}
      <PriceDisplay>
        <div>
          <PriceValue>
            {currency}
            {localMin.toLocaleString()}
          </PriceValue>
        </div>
        <div>
          {' '}
          to{' '}
        </div>
        <div>
          <PriceValue>
            {currency}
            {localMax.toLocaleString()}
          </PriceValue>
        </div>
      </PriceDisplay>

      {/* Manual Input Fields */}
      <InputGroup>
        <PriceInput
          type="number"
          placeholder="Min"
          value={localMin}
          onChange={handleMinInputChange}
          min={min}
          max={localMax}
          step={step}
          aria-label="Minimum price input"
        />
        <Separator>—</Separator>
        <PriceInput
          type="number"
          placeholder="Max"
          value={localMax}
          onChange={handleMaxInputChange}
          min={localMin}
          max={max}
          step={step}
          aria-label="Maximum price input"
        />
      </InputGroup>

      {/* Reset Button */}
      {(localMin !== min || localMax !== max) && (
        <ResetButton onClick={handleReset} aria-label="Reset price filter">
          Reset Price
        </ResetButton>
      )}
    </Container>
  );
}
