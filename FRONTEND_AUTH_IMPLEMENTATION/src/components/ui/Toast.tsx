/**
 * Toast Notification Component & Hook
 * Displays temporary notification messages to user
 * Location: src/components/ui/Toast.jsx
 */

'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

// Toast Context
const ToastContext = createContext(null);

/**
 * Toast Provider Component
 * Wraps app to manage toast state
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now();
    const toast = { id, message, type };

    setToasts((prev) => [...prev, toast]);

    if (duration) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const value = { addToast, removeToast };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer>
        <AnimatePresence>
          {toasts.map((toast) => (
            <ToastItem
              key={toast.id}
              toast={toast}
              onClose={() => removeToast(toast.id)}
            />
          ))}
        </AnimatePresence>
      </ToastContainer>
    </ToastContext.Provider>
  );
}

/**
 * Custom hook to use toast
 */
export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }

  const { addToast } = context;

  return {
    success: (message, duration) => addToast(message, 'success', duration),
    error: (message, duration) => addToast(message, 'error', duration),
    info: (message, duration) => addToast(message, 'info', duration),
    warning: (message, duration) => addToast(message, 'warning', duration)
  };
}

// Styled components
const ToastContainer = styled.div`
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 12px;
  pointer-events: none;

  @media (max-width: 768px) {
    left: 12px;
    right: 12px;
    top: 12px;
  }
`;

const ToastItemStyled = styled(motion.div)`
  min-width: 300px;
  max-width: 500px;
  padding: 16px;
  border-radius: 8px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  pointer-events: auto;

  background-color: ${(props) => {
    const colors = {
      success: '#ecfdf5',
      error: '#fef2f2',
      warning: '#fffbeb',
      info: '#f0f9ff'
    };
    return colors[props.$type] || colors.info;
  }};

  border: 1px solid ${(props) => {
    const colors = {
      success: '#d1fae5',
      error: '#fee2e2',
      warning: '#fef3c7',
      info: '#e0f2fe'
    };
    return colors[props.$type] || colors.info;
  }};

  @media (max-width: 768px) {
    min-width: auto;
    max-width: none;
  }
`;

const IconContainer = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 20px;
    height: 20px;
  }
`;

const ContentContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Message = styled.p`
  font-size: 14px;
  font-weight: 500;
  color: ${(props) => {
    const colors = {
      success: '#065f46',
      error: '#7f1d1d',
      warning: '#92400e',
      info: '#0c4a6e'
    };
    return colors[props.$type] || colors.info;
  }};
  margin: 0;
  line-height: 1.4;
`;

const CloseButton = styled.button`
  flex-shrink: 0;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;

  &:hover {
    color: #1f2937;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

/**
 * Individual Toast Item Component
 */
function ToastItem({ toast, onClose }) {
  const getIcon = () => {
    const iconProps = { size: 20 };
    switch (toast.type) {
      case 'success':
        return <CheckCircle {...iconProps} color="#10b981" />;
      case 'error':
        return <AlertCircle {...iconProps} color="#ef4444" />;
      case 'warning':
        return <AlertCircle {...iconProps} color="#f59e0b" />;
      case 'info':
      default:
        return <Info {...iconProps} color="#3b82f6" />;
    }
  };

  return (
    <ToastItemStyled
      $type={toast.type}
      initial={{ opacity: 0, x: 400, y: 0 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, x: 400, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <IconContainer>{getIcon()}</IconContainer>
      <ContentContainer>
        <Message $type={toast.type}>{toast.message}</Message>
      </ContentContainer>
      <CloseButton onClick={onClose}>
        <X />
      </CloseButton>
    </ToastItemStyled>
  );
}
