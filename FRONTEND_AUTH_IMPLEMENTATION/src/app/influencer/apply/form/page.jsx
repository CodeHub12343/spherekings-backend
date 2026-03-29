"use client";

import styled from "styled-components";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { tokenManager } from "@/utils/tokenManager";

const PageContainer = styled.div`
  min-height: 100vh;
  padding: 80px 20px 60px;
  background: #f9fafb;
`;

const Container = styled.div`
  max-width: 600px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: 40px;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 12px 0;
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: #6b7280;
  margin: 0;
`;

const Form = styled.form`
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  @media (max-width: 640px) {
    padding: 24px;
  }
`;

const Section = styled.div`
  margin-bottom: 32px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 16px 0;
  padding-bottom: 12px;
  border-bottom: 2px solid #e5e7eb;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;

  .required {
    color: #dc2626;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #5b4dff;
    box-shadow: 0 0 0 3px rgba(91, 77, 255, 0.1);
  }

  &:disabled {
    background-color: #f3f4f6;
    cursor: not-allowed;
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  min-height: 100px;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #5b4dff;
    box-shadow: 0 0 0 3px rgba(91, 77, 255, 0.1);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  background: white;
  cursor: pointer;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #5b4dff;
    box-shadow: 0 0 0 3px rgba(91, 77, 255, 0.1);
  }
`;

const PlatformGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #374151;

  input {
    cursor: pointer;
    accent-color: #5b4dff;
  }
`;

const Error = styled.span`
  display: block;
  font-size: 12px;
  color: #dc2626;
  margin-top: 4px;
`;

const RowGroup = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 32px;

  @media (max-width: 640px) {
    flex-direction: column;
  }
`;

const Button = styled.button`
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;

  &.primary {
    background-color: #5b4dff;
    color: white;

    &:hover:not(:disabled) {
      background-color: #4a3fd9;
      transform: translateY(-2px);
      box-shadow: 0 8px 16px rgba(91, 77, 255, 0.3);
    }

    &:disabled {
      background-color: #d1d5db;
      cursor: not-allowed;
    }
  }

  &.secondary {
    background-color: white;
    color: #5b4dff;
    border: 2px solid #5b4dff;

    &:hover:not(:disabled) {
      background-color: #f5f3ff;
    }

    &:disabled {
      border-color: #d1d5db;
      color: #d1d5db;
      cursor: not-allowed;
    }
  }

  @media (max-width: 640px) {
    width: 100%;
  }
`;

const SuccessMessage = styled.div`
  background: #ecfdf5;
  border-left: 4px solid #10b981;
  padding: 16px;
  border-radius: 6px;
  margin-bottom: 24px;

  h4 {
    color: #065f46;
    margin: 0 0 4px 0;
    font-size: 14px;
    font-weight: 600;
  }

  p {
    color: #047857;
    margin: 0;
    font-size: 14px;
  }
`;

const PLATFORMS = [
  "Instagram",
  "TikTok",
  "YouTube",
  "Twitter",
  "Twitch",
  "Facebook",
  "LinkedIn",
];

export default function InfluencerApplicationFormPage() {
  const router = useRouter();
  const { token, isAuthenticated } = useAuthStore();
  
  // ✅ ALL useState hooks declared at top (before any early returns)
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    platforms: [],
    socialHandles: {},
    followerCount: "",
    averageEngagementRate: "",
    shippingAddress: {
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "United States",
    },
    contentCommitment: "total_videos",
    totalVideos: "",
    videosPerDay: "",
  });

  // Wait for Zustand to hydrate from localStorage before checking auth
  useEffect(() => {
    // Mark as hydrated after component mounts (Zustand persist is ready)
    setIsHydrated(true);
  }, []);

  // Safety check: If not authenticated, redirect to login immediately (only once)
  // BUT: Wait for Zustand to hydrate first AND check tokenManager as fallback!
  useEffect(() => {
    if (!isHydrated) return; // Don't run until Zustand is hydrated

    // Check BOTH Zustand AND tokenManager for auth token
    const hasZustandToken = !!token && !!isAuthenticated;
    const hasTokenManagerToken = !!tokenManager.getAccessToken();
    const isActuallyAuthenticated = hasZustandToken || hasTokenManagerToken;

    if (!isActuallyAuthenticated) {
      if (!shouldRedirect) {
        setShouldRedirect(true);
        // Redirect to login with callback to return to form after auth
        router.push("/login?redirect=/influencer/apply/form");
      }
    } else {
      // User is authenticated, clear redirect flag
      setShouldRedirect(false);
    }
  }, [isHydrated, isAuthenticated, token, router, shouldRedirect]);

  // Show loading screen while redirecting (if not authenticated)
  if (shouldRedirect || (!isHydrated && !isAuthenticated && !token)) {
    return (
      <PageContainer>
        <Container>
          <SuccessMessage>
            <h4>Loading...</h4>
            <p>Please wait while we redirect you to complete your login.</p>
          </SuccessMessage>
        </Container>
      </PageContainer>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      shippingAddress: {
        ...prev.shippingAddress,
        [name]: value,
      },
    }));
  };

  const handlePlatformToggle = (platform) => {
    setFormData((prev) => {
      const newPlatforms = prev.platforms.includes(platform)
        ? prev.platforms.filter((p) => p !== platform)
        : [...prev.platforms, platform];
      return {
        ...prev,
        platforms: newPlatforms,
      };
    });
  };

  const handleSocialHandleChange = (platform, value) => {
    const platformKey = platform.toLowerCase();
    setFormData((prev) => ({
      ...prev,
      socialHandles: {
        ...prev.socialHandles,
        [platformKey]: value,
      },
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (formData.platforms.length === 0) newErrors.platforms = "Select at least one platform";
    if (!formData.followerCount) newErrors.followerCount = "Follower count is required";
    if (formData.averageEngagementRate === "" && formData.averageEngagementRate !== 0)
      newErrors.averageEngagementRate = "Engagement rate is required";
    if (!formData.shippingAddress.street) newErrors.address_street = "Street address is required";
    if (!formData.shippingAddress.city) newErrors.address_city = "City is required";
    if (!formData.shippingAddress.state) newErrors.address_state = "State is required";
    if (!formData.shippingAddress.postalCode)
      newErrors.address_postalCode = "Postal code is required";
    if (!formData.totalVideos) newErrors.totalVideos = "Total videos is required";
    if (formData.contentCommitment === "videos_per_day" && !formData.videosPerDay)
      newErrors.videosPerDay = "Videos per day is required";

    console.log("Frontend validation errors:", newErrors);
    console.log("Frontend validation passed:", Object.keys(newErrors).length === 0);
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);

      // Check if user is authenticated
      if (!isAuthenticated || !token) {
        setErrors({ 
          submit: "You must be logged in to submit an application. Redirecting to login..." 
        });
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push("/login?redirect=/influencer/apply/form");
        }, 2000);
        
        setLoading(false);
        return;
      }

      // Convert string numbers to actual numbers
      const dataToSend = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phoneNumber: formData.phoneNumber?.trim() || null,
        platforms: formData.platforms,
        // Only include social handles for selected platforms
        socialHandles: formData.platforms.reduce((acc, platform) => {
          const handle = formData.socialHandles[platform.toLowerCase()]?.trim() || "";
          acc[platform.toLowerCase()] = handle;
          return acc;
        }, {}),
        followerCount: parseInt(formData.followerCount, 10),
        averageEngagementRate: parseFloat(formData.averageEngagementRate),
        shippingAddress: {
          street: formData.shippingAddress.street.trim(),
          city: formData.shippingAddress.city.trim(),
          state: formData.shippingAddress.state.trim(),
          postalCode: formData.shippingAddress.postalCode.trim(),
          country: formData.shippingAddress.country,
        },
        contentCommitment: formData.contentCommitment,
        totalVideos: parseInt(formData.totalVideos, 10),
      };

      // Only add videosPerDay if contentCommitment is videos_per_day
      if (formData.contentCommitment === "videos_per_day" && formData.videosPerDay) {
        dataToSend.videosPerDay = parseFloat(formData.videosPerDay);
      }

      console.log("Submitting data:", dataToSend);
      console.log("Submitting data (formatted):", JSON.stringify(dataToSend, null, 2));
      console.log("Authorization token:", token ? "✓ Present" : "✗ Missing");

      if (!token) {
        setErrors({ submit: "Authentication required. Please log in first." });
        return;
      }

      const response = await axios.post(
        "http://localhost:5000/api/v1/influencer/apply",
        dataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setSuccess(true);
      setErrors({});

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (error) {
      console.error("Submit error full response:", error.response);
      console.error("Submit error data:", error.response?.data);
      console.error("Submit error message:", error.response?.data?.message);
      console.error("Submit error details:", error.response?.data?.errors);

      // Extract detailed error messages
      let errorMessage = "Failed to submit application. Please try again.";
      let detailedErrors = {};

      if (error.response?.data?.errors) {
        // Backend returns errors as an object: { fieldName: "error message" }
        const errorsObj = error.response.data.errors;
        
        // Handle both object and array formats
        if (typeof errorsObj === 'object' && !Array.isArray(errorsObj)) {
          // Object format: { fieldName: "message" }
          detailedErrors = errorsObj;
          console.error("Errors object:", detailedErrors);
        } else if (Array.isArray(errorsObj)) {
          // Array format: [{ field: "fieldName", message: "..." }]
          errorsObj.forEach((err) => {
            console.error("Field error:", err.field, err.message);
            detailedErrors[err.field] = err.message;
          });
        }
        
        setErrors({ ...detailedErrors, submit: error.response.data.message });
      } else if (error.response?.data?.message) {
        // Single error message
        errorMessage = error.response.data.message;
        setErrors({ submit: errorMessage });
      } else if (error.message === "Network Error") {
        setErrors({ submit: "Network error. Make sure the backend server is running on http://localhost:5000" });
      } else {
        setErrors({ submit: errorMessage });
      }

      console.error("Final errors object:", detailedErrors);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <PageContainer>
        <Container>
          <SuccessMessage>
            <h4>✓ Application Submitted Successfully!</h4>
            <p>Thank you for applying. We'll review your application and get back to you soon.</p>
          </SuccessMessage>
        </Container>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Container>
        <Header>
          <Title>Influencer Application</Title>
          <Subtitle>Join our influencer program and start earning</Subtitle>
        </Header>

        <Form onSubmit={handleSubmit}>
          {errors.submit && (
            <div style={{ marginBottom: "24px", color: "#dc2626", padding: "16px", backgroundColor: "#fee2e2", borderRadius: "6px", border: "1px solid #fca5a5" }}>
              <strong style={{ display: "block", marginBottom: "8px" }}>❌ Error: {errors.submit}</strong>
              {Object.keys(errors).filter(k => k !== "submit").length > 0 && (
                <div style={{ fontSize: "13px", marginTop: "8px", paddingTop: "8px", borderTop: "1px solid #fca5a5" }}>
                  <strong>Failed fields:</strong>
                  <ul style={{ margin: "4px 0 0 20px", padding: 0 }}>
                    {Object.entries(errors)
                      .filter(([key]) => key !== "submit")
                      .map(([key, value]) => (
                        <li key={key}>{key}: {value}</li>
                      ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Personal Information */}
          <Section>
            <SectionTitle>Personal Information</SectionTitle>

            <FormGroup>
              <Label>
                Full Name <span className="required">*</span>
              </Label>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Your full name"
                disabled={loading}
              />
              {errors.name && <Error>{errors.name}</Error>}
            </FormGroup>

            <RowGroup>
              <FormGroup>
                <Label>
                  Email <span className="required">*</span>
                </Label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your@email.com"
                  disabled={loading}
                />
                {errors.email && <Error>{errors.email}</Error>}
              </FormGroup>

              <FormGroup>
                <Label>
                  Phone Number
                </Label>
                <Input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="+1 (555) 000-0000"
                  disabled={loading}
                />
              </FormGroup>
            </RowGroup>
          </Section>

          {/* Social Media Presence */}
          <Section>
            <SectionTitle>Social Media Presence</SectionTitle>

            <FormGroup>
              <Label>
                Select Your Platforms <span className="required">*</span>
              </Label>
              <PlatformGrid>
                {PLATFORMS.map((platform) => (
                  <CheckboxLabel key={platform}>
                    <input
                      type="checkbox"
                      checked={formData.platforms.includes(platform)}
                      onChange={() => handlePlatformToggle(platform)}
                      disabled={loading}
                    />
                    {platform}
                  </CheckboxLabel>
                ))}
              </PlatformGrid>
              {errors.platforms && <Error>{errors.platforms}</Error>}
            </FormGroup>

            {formData.platforms.map((platform) => (
              <FormGroup key={platform}>
                <Label>{platform} Handle</Label>
                <Input
                  type="text"
                  placeholder={`@your${platform.toLowerCase()}handle`}
                  value={formData.socialHandles[platform.toLowerCase()] || ""}
                  onChange={(e) => handleSocialHandleChange(platform, e.target.value)}
                  disabled={loading}
                />
              </FormGroup>
            ))}

            <RowGroup>
              <FormGroup>
                <Label>
                  Follower Count <span className="required">*</span>
                </Label>
                <Input
                  type="number"
                  name="followerCount"
                  value={formData.followerCount}
                  onChange={handleInputChange}
                  placeholder="e.g., 50000"
                  disabled={loading}
                />
                {errors.followerCount && <Error>{errors.followerCount}</Error>}
              </FormGroup>

              <FormGroup>
                <Label>
                  Average Engagement Rate (%) <span className="required">*</span>
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  name="averageEngagementRate"
                  value={formData.averageEngagementRate}
                  onChange={handleInputChange}
                  placeholder="e.g., 3.5"
                  disabled={loading}
                />
                {errors.averageEngagementRate && <Error>{errors.averageEngagementRate}</Error>}
              </FormGroup>
            </RowGroup>
          </Section>

          {/* Content Commitment */}
          <Section>
            <SectionTitle>Content Commitment</SectionTitle>

            <FormGroup>
              <Label>How would you like to commit?</Label>
              <Select
                name="contentCommitment"
                value={formData.contentCommitment}
                onChange={handleInputChange}
                disabled={loading}
              >
                <option value="total_videos">Total Videos</option>
                <option value="videos_per_day">Videos Per Day</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>
                Total Videos <span className="required">*</span>
              </Label>
              <Input
                type="number"
                name="totalVideos"
                value={formData.totalVideos}
                onChange={handleInputChange}
                placeholder="e.g., 12"
                disabled={loading}
              />
              {errors.totalVideos && <Error>{errors.totalVideos}</Error>}
            </FormGroup>

            {formData.contentCommitment === "videos_per_day" && (
              <FormGroup>
                <Label>
                  Videos Per Day <span className="required">*</span>
                </Label>
                <Input
                  type="number"
                  step="0.1"
                  name="videosPerDay"
                  value={formData.videosPerDay}
                  onChange={handleInputChange}
                  placeholder="e.g., 2.5"
                  disabled={loading}
                />
                {errors.videosPerDay && <Error>{errors.videosPerDay}</Error>}
              </FormGroup>
            )}
          </Section>

          {/* Shipping Address */}
          <Section>
            <SectionTitle>Shipping Address</SectionTitle>

            <FormGroup>
              <Label>
                Street Address <span className="required">*</span>
              </Label>
              <Input
                type="text"
                name="street"
                value={formData.shippingAddress.street}
                onChange={handleAddressChange}
                placeholder="123 Main Street"
                disabled={loading}
              />
              {errors.address_street && <Error>{errors.address_street}</Error>}
            </FormGroup>

            <RowGroup>
              <FormGroup>
                <Label>
                  City <span className="required">*</span>
                </Label>
                <Input
                  type="text"
                  name="city"
                  value={formData.shippingAddress.city}
                  onChange={handleAddressChange}
                  placeholder="New York"
                  disabled={loading}
                />
                {errors.address_city && <Error>{errors.address_city}</Error>}
              </FormGroup>

              <FormGroup>
                <Label>
                  State <span className="required">*</span>
                </Label>
                <Input
                  type="text"
                  name="state"
                  value={formData.shippingAddress.state}
                  onChange={handleAddressChange}
                  placeholder="NY"
                  disabled={loading}
                />
                {errors.address_state && <Error>{errors.address_state}</Error>}
              </FormGroup>
            </RowGroup>

            <RowGroup>
              <FormGroup>
                <Label>
                  Postal Code <span className="required">*</span>
                </Label>
                <Input
                  type="text"
                  name="postalCode"
                  value={formData.shippingAddress.postalCode}
                  onChange={handleAddressChange}
                  placeholder="10001"
                  disabled={loading}
                />
                {errors.address_postalCode && <Error>{errors.address_postalCode}</Error>}
              </FormGroup>

              <FormGroup>
                <Label>Country</Label>
                <Input
                  type="text"
                  name="country"
                  value={formData.shippingAddress.country}
                  onChange={handleAddressChange}
                  disabled
                />
              </FormGroup>
            </RowGroup>
          </Section>

          {/* Actions */}
          <ButtonGroup>
            <Button type="submit" className="primary" disabled={loading}>
              {loading ? "Submitting..." : "Submit Application"}
            </Button>
            <Button
              type="button"
              className="secondary"
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancel
            </Button>
          </ButtonGroup>
        </Form>
      </Container>
    </PageContainer>
  );
}
