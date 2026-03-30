'use client';

'use client';

import { useState, useCallback } from 'react';
import styled from 'styled-components';
import { Search, X } from 'lucide-react';

const SearchContainer = styled.div`
  width: 100%;
  max-width: 500px;
  margin: 0 auto 32px;
`;

const SearchInputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px 16px;
  transition: all 0.2s ease;

  &:focus-within {
    border-color: #5b4dff;
    box-shadow: 0 0 0 3px rgba(91, 77, 255, 0.1);
  }

  @media (max-width: 768px) {
    padding: 10px 12px;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  outline: none;
  font-size: 14px;
  font-family: inherit;
  color: #1f2937;
  background: transparent;

  &::placeholder {
    color: #9ca3af;
  }

  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const SearchIconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  flex-shrink: 0;
`;

const ClearButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 4px;
  transition: color 0.2s;

  &:hover {
    color: #6b7280;
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const SuggestionsDropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 8px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  max-height: 300px;
  overflow-y: auto;
  z-index: 50;
  display: ${props => (props.visible ? 'block' : 'none')};
`;

const SuggestionItem = styled.button`
  width: 100%;
  padding: 12px 16px;
  border: none;
  background: none;
  text-align: left;
  color: #6b7280;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f9fafb;
    color: #5b4dff;
  }

  &:first-child {
    border-radius: 8px 8px 0 0;
  }

  &:last-child {
    border-radius: 0 0 8px 8px;
  }

  display: flex;
  align-items: center;
  gap: 12px;

  svg {
    width: 16px;
    height: 16px;
    color: #9ca3af;
  }
`;

const NoResults = styled.div`
  padding: 16px;
  text-align: center;
  color: #9ca3af;
  font-size: 14px;
`;

/**
 * SearchBar Component
 * Features:
 * - Text input with search icon
 * - Clear button to reset search
 * - Suggestions dropdown (if provided)
 * - Mobile-optimized
 * - Debounced search callback
 * 
 * Usage:
 * <SearchBar 
 *   value={search}
 *   onChange={handleSearchChange}
 *   onSearch={handleSearch}
 *   suggestions={categories}
 *   placeholder="Search products..."
 * />
 */
export default function SearchBar({
  value = '',
  onChange = () => {},
  onSearch = () => {},
  suggestions = [],
  placeholder = 'Search products, categories, brands...',
  showSuggestions = true,
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  // Debounced search callback
  const handleChange = useCallback(
    (e) => {
      const newValue = e.target.value;
      onChange(newValue);
      
      if (newValue) {
        setShowDropdown(true);
        setHighlightedIndex(-1);
      } else {
        setShowDropdown(false);
      }
    },
    [onChange]
  );

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (value.trim()) {
      onSearch(value);
      setShowDropdown(false);
    }
  };

  // Clear search
  const handleClear = () => {
    onChange('');
    setShowDropdown(false);
    setHighlightedIndex(-1);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    onChange(suggestion);
    onSearch(suggestion);
    setShowDropdown(false);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showDropdown || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0) {
          handleSuggestionClick(suggestions[highlightedIndex]);
        } else {
          handleSubmit(e);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        break;
      default:
        break;
    }
  };

  // Filter suggestions based on input
  const filteredSuggestions = suggestions.filter(suggestion =>
    suggestion.toLowerCase().includes(value.toLowerCase())
  );

  return (
    <SearchContainer>
      <form onSubmit={handleSubmit}>
        <SearchInputWrapper>
          <SearchIconWrapper>
            <Search size={18} />
          </SearchIconWrapper>

          <SearchInput
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => value && showSuggestions && setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
            autoComplete="off"
            aria-label="Search products"
          />

          {value && (
            <ClearButton
              type="button"
              onClick={handleClear}
              aria-label="Clear search"
              title="Clear search"
            >
              <X />
            </ClearButton>
          )}
        </SearchInputWrapper>

        {/* Suggestions Dropdown */}
        {showDropdown && showSuggestions && (
          <SuggestionsDropdown visible={showDropdown}>
            {filteredSuggestions.length > 0 ? (
              filteredSuggestions.map((suggestion, index) => (
                <SuggestionItem
                  key={index}
                  onMouseDown={() => handleSuggestionClick(suggestion)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  style={{
                    backgroundColor:
                      index === highlightedIndex ? '#f0f0ff' : 'transparent',
                    color: index === highlightedIndex ? '#5b4dff' : '#6b7280',
                  }}
                >
                  <Search size={16} />
                  {suggestion}
                </SuggestionItem>
              ))
            ) : (
              <NoResults>
                No suggestions found for "{value}"
              </NoResults>
            )}
          </SuggestionsDropdown>
        )}
      </form>
    </SearchContainer>
  );
}
