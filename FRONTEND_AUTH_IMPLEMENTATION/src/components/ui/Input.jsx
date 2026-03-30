/**
 * Input Component
 * Reusable input field with validation and password visibility toggle
 */

'use client';

'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import { Eye, EyeOff } from 'lucide-react';

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #0f172a;
  display: flex;
  gap: 4px;

  span.required {
    color: #dc2626;
  }
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 10px 12px;
  font-size: 14px;
  border: 1px solid ${(props) => (props.hasError ? '#dc2626' : '#e5e7eb')};
  border-radius: 6px;
  font-family: inherit;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #5b4dff;
    box-shadow: 0 0 0 3px rgba(91, 77, 255, 0.1);
  }

  &:disabled {
    background-color: #f3f4f6;
    cursor: not-allowed;
    color: #9ca3af;
  }

  &::placeholder {
    color: #9ca3af;
  }

  ${(props) => props.hasError && `
    &:focus {
      border-color: #dc2626;
      box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
    }
  `}
`;

const ToggleButton = styled.button`
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7280;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;

  &:hover {
    color: #0f172a;
  }

  &:focus {
    outline: none;
  }
`;

const ErrorMessage = styled.span`
  font-size: 12px;
  color: #dc2626;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const HintText = styled.span`
  font-size: 12px;
  color: #6b7280;
`;

const Input = React.forwardRef(
  (
    {
      label,
      type = 'text',
      placeholder,
      value,
      onChange,
      onBlur,
      error,
      hint,
      disabled = false,
      required = false,
      autoComplete,
      icon = null,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);

    const isPasswordType = type === 'password';
    const inputType = isPasswordType && showPassword ? 'text' : type;
    const hasError = !!error;

    const togglePasswordVisibility = (e) => {
      e.preventDefault();
      setShowPassword(!showPassword);
    };

    return (
      <InputContainer>
        {label && (
          <Label>
            {label}
            {required && <span className="required">*</span>}
          </Label>
        )}

        <InputWrapper>
          <StyledInput
            ref={ref}
            type={inputType}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            disabled={disabled}
            hasError={hasError}
            autoComplete={autoComplete}
            {...props}
          />

          {isPasswordType && !icon && (
            <ToggleButton
              type="button"
              onClick={togglePasswordVisibility}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </ToggleButton>
          )}

          {icon && (
            <ToggleButton
              type="button"
              onClick={(e) => e.preventDefault()}
              style={{ pointerEvents: 'auto' }}
            >
              {icon}
            </ToggleButton>
          )}
        </InputWrapper>

        {error && <ErrorMessage>{error}</ErrorMessage>}
        {hint && !error && <HintText>{hint}</HintText>}
      </InputContainer>
    );
  }
);

Input.displayName = 'Input';

export { Input };
export default Input;
