/**
 * Sponsorship Hooks
 * React Query hooks for sponsorship feature with caching and state management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import sponsorshipService from '../services/sponsorshipService';

// Cache key factory
const sponsorshipKeys = {
  all: ['sponsorship'],
  tiers: () => [...sponsorshipKeys.all, 'tiers'],
  tiersList: (params) => [...sponsorshipKeys.tiers(), { params }],
  tier: (id) => [...sponsorshipKeys.all, 'tier', id],
  mySponsorships: () => [...sponsorshipKeys.all, 'my-sponsorships'],
  records: () => [...sponsorshipKeys.all, 'records'],
  recordsList: (params) => [...sponsorshipKeys.records(), { params }],
  record: (id) => [...sponsorshipKeys.all, 'record', id],
};

/**
 * Hook: Get all sponsorship tiers (public)
 */
export const useSponsorshipTiers = (params = {}) => {
  return useQuery({
    queryKey: sponsorshipKeys.tiersList(params),
    queryFn: () => sponsorshipService.getTiers(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes garbage collection
  });
};

/**
 * Hook: Get single sponsorship tier
 */
export const useSponsorshipTier = (tierId) => {
  return useQuery({
    queryKey: sponsorshipKeys.tier(tierId),
    queryFn: () => sponsorshipService.getTier(tierId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    enabled: !!tierId,
  });
};

/**
 * Hook: Initiate sponsorship purchase
 */
export const useInitiatePurchase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (purchaseData) =>
      sponsorshipService.initiatePurchase(purchaseData),
    onSuccess: (data) => {
      // Invalidate user's sponsorships
      queryClient.invalidateQueries({
        queryKey: sponsorshipKeys.mySponsorships(),
      });
    },
  });
};

/**
 * Hook: Get user's sponsorships
 */
export const useMySponsorships = () => {
  return useQuery({
    queryKey: sponsorshipKeys.mySponsorships(),
    queryFn: () => sponsorshipService.getMySponsorships(),
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook: List all sponsorship records (admin)
 */
export const useSponsorshipRecordsList = (params = {}) => {
  return useQuery({
    queryKey: sponsorshipKeys.recordsList(params),
    queryFn: () => sponsorshipService.listRecords(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: true,
  });
};

/**
 * Hook: Get single sponsorship record
 */
export const useSponsorshipRecord = (recordId) => {
  return useQuery({
    queryKey: sponsorshipKeys.record(recordId),
    queryFn: () => sponsorshipService.getRecord(recordId),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!recordId,
  });
};

/**
 * Hook: Add video link to sponsorship (admin)
 */
export const useAddVideoLink = () => {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending } = useMutation({
    mutationFn: ({ recordId, videoData }) =>
      sponsorshipService.addVideoLink(recordId, videoData),
    onSuccess: (data, { recordId }) => {
      // Update specific record in cache
      queryClient.setQueryData(
        sponsorshipKeys.record(recordId),
        (oldData) => ({
          ...oldData,
          data: data.data,
        })
      );
      // Invalidate list to refetch
      queryClient.invalidateQueries({
        queryKey: sponsorshipKeys.records(),
      });
      // Invalidate user sponsorships too
      queryClient.invalidateQueries({
        queryKey: sponsorshipKeys.mySponsorships(),
      });
    },
  });

  return {
    addVideoLink: async (recordId, videoData) => {
      try {
        const data = await mutateAsync({ recordId, videoData });
        return true; // Indicate success
      } catch (err) {
        throw err; // Re-throw to be caught by handleAddVideo
      }
    },
    isLoading: isPending,
  };
};

/**
 * Hook: Update sponsorship status (admin)
 */
export const useUpdateSponsorshipStatus = () => {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending } = useMutation({
    mutationFn: ({ recordId, statusData }) =>
      sponsorshipService.updateStatus(recordId, statusData),
    onSuccess: (data, { recordId }) => {
      // Update specific record in cache
      queryClient.setQueryData(
        sponsorshipKeys.record(recordId),
        (oldData) => ({
          ...oldData,
          data: data.data,
        })
      );
      // Invalidate list
      queryClient.invalidateQueries({
        queryKey: sponsorshipKeys.records(),
      });
    },
  });

  return {
    updateStatus: (recordId, statusData) =>
      mutateAsync({ recordId, statusData }),
    isLoading: isPending,
  };
};

/**
 * Hook: Create sponsorship tier (admin)
 */
export const useCreateSponsorshipTier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tierData) => sponsorshipService.createTier(tierData),
    onSuccess: (data) => {
      // Invalidate tiers list
      queryClient.invalidateQueries({
        queryKey: sponsorshipKeys.tiers(),
      });
    },
  });
};

/**
 * Hook: Update sponsorship tier (admin)
 */
export const useUpdateSponsorshipTier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tierId, tierData }) =>
      sponsorshipService.updateTier(tierId, tierData),
    onSuccess: (data, { tierId }) => {
      // Update specific tier in cache
      queryClient.setQueryData(
        sponsorshipKeys.tier(tierId),
        (oldData) => ({
          ...oldData,
          data: data.data,
        })
      );
      // Invalidate tiers list
      queryClient.invalidateQueries({
        queryKey: sponsorshipKeys.tiers(),
      });
    },
  });
};

export default {
  useSponsorshipTiers,
  useSponsorshipTier,
  useInitiatePurchase,
  useMySponsorships,
  useSponsorshipRecordsList,
  useSponsorshipRecord,
  useAddVideoLink,
  useUpdateSponsorshipStatus,
  useCreateSponsorshipTier,
  useUpdateSponsorshipTier,
};
