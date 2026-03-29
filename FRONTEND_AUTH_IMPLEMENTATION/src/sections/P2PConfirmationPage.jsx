'use client';

import styled from 'styled-components';
import { Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: #6b7280;
  margin: 0;
`;

const SuccessBox = styled.div`
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  gap: 12px;

  svg {
    width: 20px;
    height: 20px;
    color: #059669;
    flex-shrink: 0;
    margin-top: 2px;
  }

  p {
    font-size: 13px;
    color: #065f46;
    margin: 0;
    line-height: 1.5;
  }
`;

const ProofSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const SectionTitle = styled.h3`
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
`;

const ProofOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;

  @media (min-width: 640px) {
    flex-direction: row;
  }
`;

const ProofOption = styled.div`
  flex: 1;
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 12px;

  ${(props) => props.selected && `
    border-color: #5b4dff;
    background: #f9f7ff;
  `}
`;

const OptionLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;

  input {
    cursor: pointer;
  }
`;

const OptionDescription = styled.p`
  font-size: 12px;
  color: #6b7280;
  margin: 0;
  line-height: 1.4;
`;

const UploadArea = styled.div`
  border: 2px dashed #d1d5db;
  border-radius: 10px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #f9fafb;

  &:hover {
    border-color: #9ca3af;
    background: #f3f4f6;
  }

  &:focus-within {
    border-color: #5b4dff;
    background: #f9f7ff;
  }

  svg {
    width: 32px;
    height: 32px;
    color: #6b7280;
  }

  p {
    margin: 0;
    font-size: 13px;
    color: #374151;

    strong {
      color: #1f2937;
    }
  }

  input[type='file'] {
    display: none;
  }
`;

const FileInfo = styled.div`
  background: #f3f4f6;
  border-radius: 8px;
  padding: 12px;
  font-size: 12px;
  color: #6b7280;
  word-break: break-word;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #374151;

  span {
    color: #9ca3af;
    font-weight: 400;
  }
`;

const InputField = styled(Input)`
  width: 100%;
`;

const HelpText = styled.p`
  font-size: 12px;
  color: #6b7280;
  margin: 0;
  line-height: 1.4;
`;

const InfoBox = styled.div`
  background: #fef3c7;
  border: 1px solid #fcd34d;
  border-radius: 10px;
  padding: 12px;
  display: flex;
  gap: 10px;
  font-size: 12px;
  color: #78350f;

  svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    margin-top: 1px;
  }

  p {
    margin: 0;
    line-height: 1.5;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  flex-direction: column-reverse;

  @media (min-width: 640px) {
    flex-direction: row;
  }
`;

const CancelButton = styled(Button)`
  background: white;
  color: #5b4dff;
  border: 1px solid #d1d5db;
  flex: 1;

  &:hover {
    background: #f9fafb;
    border-color: #9ca3af;
  }
`;

const SubmitButton = styled(Button)`
  background: #5b4dff;
  color: white;
  flex: 1;

  &:hover:not(:disabled) {
    background: #4c3fd1;
  }

  &:disabled {
    background: #d1d5db;
    cursor: not-allowed;
  }
`;

const P2PConfirmationPage = ({ entryId, onCancel, onSubmit, loading }) => {
  const [proofType, setProofType] = useState('screenshot'); // 'screenshot' or 'reference'
  const [file, setFile] = useState(null);
  const [reference, setReference] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
        alert('File is too large. Please upload a file smaller than 5MB.');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (proofType === 'screenshot' && !file) {
      alert('Please upload a receipt screenshot');
      return;
    }

    if (proofType === 'reference' && !reference.trim()) {
      alert('Please enter your transaction reference');
      return;
    }

    // Prepare form data
    const formData = new FormData();
    formData.append('entryId', entryId);

    if (proofType === 'screenshot' && file) {
      formData.append('proofOfPaymentFile', file);
    } else if (proofType === 'reference') {
      formData.append('manualPaymentReference', reference);
    }

    onSubmit(formData);
  };

  const uploadFileInputRef = (input) => {
    if (proofType === 'screenshot' && input) {
      // Focus on file input when switched to screenshot mode
    }
  };

  return (
    <Container>
      <Header>
        <Title>Confirm Your Entry</Title>
        <Subtitle>Complete this form to finalize your raffle participation</Subtitle>
      </Header>

      <SuccessBox>
        <CheckCircle />
        <p>
          <strong>Payment sent!</strong> Now let us know by providing proof of your transfer so we can verify and activate your entry.
        </p>
      </SuccessBox>

      <form onSubmit={handleSubmit}>
        <ProofSection>
          <SectionTitle>Proof of Payment</SectionTitle>
          <Subtitle style={{ margin: '0', marginBottom: '8px' }}>Choose how to provide proof</Subtitle>

          <ProofOptions>
            <ProofOption selected={proofType === 'screenshot'}>
              <OptionLabel>
                <input
                  type="radio"
                  value="screenshot"
                  checked={proofType === 'screenshot'}
                  onChange={(e) => setProofType(e.target.value)}
                />
                <span>Upload Receipt Screenshot</span>
              </OptionLabel>
              <OptionDescription>
                Take a screenshot of your payment confirmation and upload it here
              </OptionDescription>

              {proofType === 'screenshot' && (
                <UploadArea as="label" htmlFor="file-upload">
                  <Upload />
                  <div>
                    <p>
                      <strong>Click to upload</strong> or drag and drop
                    </p>
                    <p>PNG, JPG, GIF up to 5MB</p>
                  </div>
                  <input
                    id="file-upload"
                    ref={uploadFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </UploadArea>
              )}

              {file && proofType === 'screenshot' && (
                <FileInfo>
                  ✓ {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </FileInfo>
              )}
            </ProofOption>

            <ProofOption selected={proofType === 'reference'}>
              <OptionLabel>
                <input
                  type="radio"
                  value="reference"
                  checked={proofType === 'reference'}
                  onChange={(e) => setProofType(e.target.value)}
                />
                <span>Transaction Reference</span>
              </OptionLabel>
              <OptionDescription>
                Provide your transaction ID or reference number from the service
              </OptionDescription>

              {proofType === 'reference' && (
                <FormGroup>
                  <InputField
                    placeholder="e.g., TXN123456789"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    required
                  />
                  <HelpText>
                    You can find this in your payment app's transaction history
                  </HelpText>
                </FormGroup>
              )}
            </ProofOption>
          </ProofOptions>
        </ProofSection>

        <InfoBox>
          <AlertCircle />
          <p>
            Admin verification typically completes within <strong>24 hours</strong>. We'll notify you once your entry is confirmed!
          </p>
        </InfoBox>

        <ActionButtons>
          <CancelButton type="button" onClick={onCancel}>
            Cancel
          </CancelButton>
          <SubmitButton type="submit" disabled={loading}>
            {loading ? 'Submitting...' : 'Confirm Entry'}
          </SubmitButton>
        </ActionButtons>
      </form>
    </Container>
  );
};

export default P2PConfirmationPage;
