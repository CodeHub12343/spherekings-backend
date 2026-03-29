/**
 * Reusable Button Component
 * Styled button with multiple variants and states
 * Location: src/components/ui/Button.jsx
 */

'use client';

import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';

// Base button styles
const baseButtonStyles = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  border: none;
  border-radius: 8px;
  
  font-size: 16px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  
  outline: none;
  user-select: none;
  
  /* Disable text selection on double click */
  -webkit-user-select: none;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

// Variant styles
const variantStyles = {
  primary: css`
    background-color: #5b4dff;
    color: #ffffff;

    &:hover:not(:disabled) {
      background-color: #4c3fcc;
      box-shadow: 0 4px 12px rgba(91, 77, 255, 0.3);
    }

    &:active:not(:disabled) {
      background-color: #3d2fb8;
      transform: scale(0.98);
    }
  `,

  secondary: css`
    background-color: #0f172a;
    color: #ffffff;

    &:hover:not(:disabled) {
      background-color: #1a232f;
      box-shadow: 0 4px 12px rgba(15, 23, 42, 0.3);
    }

    &:active:not(:disabled) {
      background-color: #0d1117;
      transform: scale(0.98);
    }
  `,

  ghost: css`
    background-color: transparent;
    color: #5b4dff;
    border: 1px solid #e5e7eb;

    &:hover:not(:disabled) {
      background-color: #f9fafb;
      border-color: #5b4dff;
    }

    &:active:not(:disabled) {
      background-color: #f3f4f6;
    }
  `,

  outline: css`
    background-color: transparent;
    color: #5b4dff;
    border: 2px solid #5b4dff;

    &:hover:not(:disabled) {
      background-color: #f9f7ff;
      border-color: #4c3fcc;
    }

    &:active:not(:disabled) {
      background-color: #f3f0ff;
    }
  `,

  danger: css`
    background-color: #ef4444;
    color: #ffffff;

    &:hover:not(:disabled) {
      background-color: #dc2626;
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
    }

    &:active:not(:disabled) {
      background-color: #b91c1c;
      transform: scale(0.98);
    }
  `
};

// Size styles
const sizeStyles = {
  sm: css`
    padding: 8px 16px;
    font-size: 14px;
  `,

  md: css`
    padding: 12px 24px;
    font-size: 16px;
  `,

  lg: css`
    padding: 16px 32px;
    font-size: 18px;
  `,

  full: css`
    width: 100%;
    padding: 12px 24px;
    font-size: 16px;
  `
};

const StyledButton = styled(motion.button)`
  ${baseButtonStyles}
  ${(props) => variantStyles[props.$variant]}
  ${(props) => sizeStyles[props.$size]}
`;

/**
 * Button Component
 * @param {Object} props - Component props
 * @param {string} props.variant - Button style variant (primary, secondary, ghost, outline, danger)
 * @param {string} props.size - Button size (sm, md, lg, full)
 * @param {boolean} props.loading - Show loading state
 * @param {ReactNode} props.children - Button content
 * @param {boolean} props.disabled - Whether button is disabled
 * @param {Function} props.onClick - Click handler
 * @param {string} props.type - Button type (button, submit, reset)
 */
export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  disabled = false,
  onClick = () => {},
  type = 'button',
  ...props
}) {
  return (
    <StyledButton
      type={type}
      $variant={variant}
      $size={size}
      disabled={disabled || loading}
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      {loading ? (
        <>
          <LoadingSpinner />
          {children}
        </>
      ) : (
        children
      )}
    </StyledButton>
  );
}

/**
 * Loading Spinner Component
 */
const Spinner = styled(motion.div)`
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
`;

function LoadingSpinner() {
  return (
    <Spinner
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    />
  );
}

export { Button };
export default Button;
