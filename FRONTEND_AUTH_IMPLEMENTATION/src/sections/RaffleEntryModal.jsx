'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { X, AlertCircle } from 'lucide-react';
import RaffleEntryForm from './RaffleEntryForm';
import PaymentMethodSelection from './PaymentMethodSelection';
import P2PInstructionPage from './P2PInstructionPage';
import P2PConfirmationPage from './P2PConfirmationPage';
import { useP2PConfig, useSubmitRaffleEntry, useSubmitP2PProof } from '@/api/hooks/useRaffle';
import { useToast } from '@/components/ui/Toast';
import Cloudinary from '@/utils/cloudinary';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  backdrop-filter: blur(4px);
  animation: fadeIn 0.2s ease-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease-out;
  display: flex;
  flex-direction: column;

  @keyframes slideUp {
    from {
      transform: translateY(30px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @media (max-width: 768px) {
    max-height: 95vh;
    border-radius: 12px;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 20px;
  }
`;

const StepIndicator = styled.div`
  font-size: 12px;
  color: #9ca3af;
  font-weight: 500;
  margin-top: 4px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s ease;
  color: #6b7280;

  &:hover {
    background: #f3f4f6;
    color: #1f2937;
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const Body = styled.div`
  padding: 24px;
  flex: 1;
  overflow-y: auto;

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const ErrorAlert = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 10px;
  padding: 12px 14px;
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
  color: #991b1b;
  font-size: 13px;

  svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    margin-top: 1px;
  }

  button {
    background: none;
    border: none;
    color: inherit;
    cursor: pointer;
    padding: 0;
    font-size: 13px;
    text-decoration: underline;

    &:hover {
      opacity: 0.8;
    }
  }
`;

const RaffleEntryModal = ({ isOpen, onClose, cycle }) => {
  // Step tracking: 1=Info, 2=Payment, 3=Stripe/P2P
  const [step, setStep] = useState(1);
  const [entryData, setEntryData] = useState(null);
  const [selectedPaymethod, setSelectedPaymethod] = useState(null);
  const [entryId, setEntryId] = useState(null);
  const [error, setError] = useState(null);
  const [loadingFile, setLoadingFile] = useState(false);

  const toast = useToast();
  const { data: p2pConfig, isLoading: loadingP2P } = useP2PConfig();
  const { mutate: submitEntry, isPending: submittingEntry } = useSubmitRaffleEntry();
  const { mutate: submitProof, isPending: submittingProof } = useSubmitP2PProof();

  if (!isOpen) return null;

  /**
   * Step 1 → Step 2: User filled personal info
   */
  const handleFormSubmit = (data) => {
    setEntryData(data);
    setStep(2);
    setError(null);
  };

  /**
   * Step 2: User selected payment method
   */
  const handlePaymentMethodSelect = (method) => {
    setSelectedPaymethod(method === 'p2p' ? 'wise' : method); // Default to Wise for P2P
  };

  /**
   * Step 2 → Step 3: Proceed with selected payment method
   */
  const handleContinuePayment = async () => {
    if (!selectedPaymethod) {
      setError('Please select a payment method');
      return;
    }

    setError(null);

    if (selectedPaymethod === 'stripe') {
      // Submit Stripe entry
      submitEntry(
        { ...entryData, paymentMethod: 'stripe' },
        {
          onSuccess: (response) => {
            if (response.success) {
              // Redirect to Stripe checkout
              window.location.href = response.data.stripeCheckoutUrl;
            } else {
              setError(response.error || 'Failed to create Stripe session');
            }
          },
          onError: (error) => {
            setError(error.message || 'Failed to process payment');
          },
        }
      );
    } else {
      // Proceed to P2P instructions
      submitEntry(
        { ...entryData, paymentMethod: selectedPaymethod },
        {
          onSuccess: (response) => {
            if (response.success) {
              setEntryId(response.data.entryId);
              setStep(3);
            } else {
              setError(response.error || 'Failed to create entry');
            }
          },
          onError: (error) => {
            setError(error.message || 'Failed to process entry');
          },
        }
      );
    }
  };

  /**
   * Back from payment method selection
   */
  const handleBackFromPaymentMethod = () => {
    setStep(1);
    setSelectedPaymethod(null);
    setError(null);
  };

  /**
   * Back from P2P instructions to payment method
   */
  const handleBackFromP2PInstructions = () => {
    setStep(2);
    setError(null);
  };

  /**
   * P2P: Submit proof of payment
   */
  const handleSubmitP2PProof = async (formData) => {
    setError(null);

    const data = new FormData();
    data.append('entryId', entryId);

    // Check if we have a file to upload
    const file = formData.get('proofOfPaymentFile');
    if (file) {
      try {
        setLoadingFile(true);
        // Upload file to Cloudinary
        const uploadedUrl = await Cloudinary.uploadFile(file);
        data.append('proofOfPaymentUrl', uploadedUrl);
      } catch (err) {
        setError('Failed to upload receipt. Please try again.');
        setLoadingFile(false);
        return;
      } finally {
        setLoadingFile(false);
      }
    }

    // Add manual reference if provided
    const reference = formData.get('manualPaymentReference');
    if (reference) {
      data.append('manualPaymentReference', reference);
    }

    submitProof(data, {
      onSuccess: (response) => {
        if (response.success) {
          toast.success('Entry submitted! Your raffle entry is pending admin verification.');
          setTimeout(() => {
            onClose();
          }, 1500);
        } else {
          setError(response.error || 'Failed to submit proof');
        }
      },
      onError: (error) => {
        setError(error.message || 'Failed to submit proof');
      },
    });
  };

  /**
   * Cancel P2P and go back
   */
  const handleCancelP2P = () => {
    setStep(2);
    setEntryId(null);
    setError(null);
  };

  // Determine title and step text
  let titleText = 'Enter the Raffle';
  let stepText = '';

  if (step === 1) {
    stepText = 'Step 1 of 3';
  } else if (step === 2) {
    stepText = 'Step 2 of 3';
  } else if (step === 3) {
    stepText = 'Step 3 of 3';
  }

  return (
    <Overlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <Header>
          <div>
            <Title>{titleText}</Title>
            {stepText && <StepIndicator>{stepText}</StepIndicator>}
          </div>
          <CloseButton onClick={onClose}>
            <X />
          </CloseButton>
        </Header>
        <Body>
          {error && (
            <ErrorAlert>
              <AlertCircle />
              <span>{error}</span>
              <button onClick={() => setError(null)}>Dismiss</button>
            </ErrorAlert>
          )}

          {/* STEP 1: Personal Information */}
          {step === 1 && (
            <RaffleEntryForm onSuccess={handleFormSubmit} cycle={cycle} />
          )}

          {/* STEP 2: Payment Method Selection */}
          {step === 2 && (
            <PaymentMethodSelection
              selectedMethod={selectedPaymethod}
              onSelect={handlePaymentMethodSelect}
              onBack={handleBackFromPaymentMethod}
              onContinue={handleContinuePayment}
              loading={submittingEntry || loadingFile}
            />
          )}

          {/* STEP 3: P2P Instructions */}
          {step === 3 && selectedPaymethod !== 'stripe' && (
            <P2PInstructionPage
              config={p2pConfig}
              paymentMethod={selectedPaymethod}
              onBack={handleBackFromP2PInstructions}
              onContinue={() => setStep(4)} // Move to confirmation
              loading={loadingP2P}
            />
          )}

          {/* STEP 4: P2P Confirmation & Proof */}
          {step === 4 && selectedPaymethod !== 'stripe' && (
            <P2PConfirmationPage
              entryId={entryId}
              onCancel={handleCancelP2P}
              onSubmit={handleSubmitP2PProof}
              loading={submittingProof || loadingFile}
            />
          )}
        </Body>
      </ModalContent>
    </Overlay>
  );
};

export default RaffleEntryModal;
