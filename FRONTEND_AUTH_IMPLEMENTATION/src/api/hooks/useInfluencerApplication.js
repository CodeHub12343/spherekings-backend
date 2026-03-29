/**
 * Influencer Hooks
 * React Query hooks for influencer feature with caching and state management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import influencerService from '../services/influencerService';

// Cache key factory
const influencerKeys = {
  all: ['influencer'],
  myApplication: () => [...influencerKeys.all, 'my-application'],
  applications: () => [...influencerKeys.all, 'applications'],
  applicationsList: (params) => [...influencerKeys.applications(), { params }],
  application: (id) => [...influencerKeys.all, 'application', id],
};

/**
 * Hook: Get current user's influencer application
 */
export const useMyInfluencerApplication = () => {
  return useQuery({
    queryKey: influencerKeys.myApplication(),
    queryFn: async () => {
      const result = await influencerService.getMyApplication();
      console.log('🔍 My Application Result:', result);
      if (result.data) {
        console.log('📧 Application email:', result.data.email);
      }
      return result;
    },
    staleTime: 1 * 60 * 1000, // 1 minute (reduced from 5)
    gcTime: 5 * 60 * 1000, // 5 minutes garbage collection (reduced from 15)
    retry: 2,
  });
};

/**
 * Hook: Submit influencer application
 */
export const useSubmitInfluencerApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (applicationData) =>
      influencerService.submitInfluencerApplication(applicationData),
    onSuccess: (data) => {
      // Invalidate and refetch the user's application
      queryClient.invalidateQueries({
        queryKey: influencerKeys.myApplication(),
      });
      // Also invalidate admin list if user is admin
      queryClient.invalidateQueries({
        queryKey: influencerKeys.applications(),
      });
    },
  });
};

/**
 * Hook: Add content link to application
 */
export const useAddContentLink = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ applicationId, contentData }) =>
      influencerService.addContentLink(applicationId, contentData),
    onSuccess: (data) => {
      // Invalidate the user's application
      queryClient.invalidateQueries({
        queryKey: influencerKeys.myApplication(),
      });
    },
  });
};

/**
 * Hook: List influencer applications (admin)
 */
export const useInfluencerApplicationList = (params = {}) => {
  return useQuery({
    queryKey: influencerKeys.applicationsList(params),
    queryFn: () => influencerService.listApplications(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: true, // Set to false if you want to manually trigger
  });
};

/**
 * Hook: Get single application (admin)
 */
export const useInfluencerApplication = (applicationId) => {
  return useQuery({
    queryKey: influencerKeys.application(applicationId),
    queryFn: () => influencerService.getApplication(applicationId),
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!applicationId,
  });
};

/**
 * Hook: Approve influencer application (admin)
 */
export const useApproveApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ applicationId, approvalData }) =>
      influencerService.approveApplication(applicationId, approvalData),
    onSuccess: (data, { applicationId }) => {
      // Update specific application in cache
      queryClient.setQueryData(
        influencerKeys.application(applicationId),
        (oldData) => ({
          ...oldData,
          data: data.data,
        })
      );
      // Invalidate list to refresh
      queryClient.invalidateQueries({
        queryKey: influencerKeys.applications(),
      });
    },
  });
};

/**
 * Hook: Reject influencer application (admin)
 */
export const useRejectApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ applicationId, rejectionData }) =>
      influencerService.rejectApplication(applicationId, rejectionData),
    onSuccess: (data, { applicationId }) => {
      // Update specific application in cache
      queryClient.setQueryData(
        influencerKeys.application(applicationId),
        (oldData) => ({
          ...oldData,
          data: data.data,
        })
      );
      // Invalidate list to refresh
      queryClient.invalidateQueries({
        queryKey: influencerKeys.applications(),
      });
    },
  });
};

/**
 * Hook: Assign product to influencer (admin)
 */
export const useAssignProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ applicationId, productId, trackingNumber }) =>
      influencerService.assignProduct(applicationId, {
        productId,
        trackingNumber,
      }),
    onSuccess: (data, { applicationId }) => {
      // Update specific application in cache
      queryClient.setQueryData(
        influencerKeys.application(applicationId),
        (oldData) => ({
          ...oldData,
          data: data.data,
        })
      );
      // Invalidate list
      queryClient.invalidateQueries({
        queryKey: influencerKeys.applications(),
      });
    },
  });
};

/**
 * Hook: Update fulfillment status (admin)
 */
export const useUpdateFulfillmentStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ applicationId, fulfillmentStatus, trackingNumber }) =>
      influencerService.updateFulfillmentStatus(applicationId, {
        fulfillmentStatus,
        trackingNumber,
      }),
    onSuccess: (data, { applicationId }) => {
      // Update the specific application
      queryClient.setQueryData(
        influencerKeys.application(applicationId),
        (oldData) => ({
          ...oldData,
          data: data.data,
        })
      );
    },
  });
};

export default {
  useMyInfluencerApplication,
  useSubmitInfluencerApplication,
  useAddContentLink,
  useInfluencerApplicationList,
  useInfluencerApplication,
  useApproveApplication,
  useRejectApplication,
  useAssignProduct,
  useUpdateFulfillmentStatus,
};
