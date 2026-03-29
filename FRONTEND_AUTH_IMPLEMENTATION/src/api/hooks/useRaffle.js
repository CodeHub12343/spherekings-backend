/**
 * Raffle Hooks
 * React Query hooks for raffle feature with caching and state management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import raffleService from '../services/raffleService';

// Cache key factory
const raffleKeys = {
  all: ['raffle'],
  currentCycle: () => [...raffleKeys.all, 'current-cycle'],
  pastWinners: (limit) => [...raffleKeys.all, 'winners', limit],
  p2pConfig: () => [...raffleKeys.all, 'p2p-config'],
  userEntries: () => [...raffleKeys.all, 'my-entries'],
  adminStats: () => [...raffleKeys.all, 'admin', 'stats'],
  adminEntries: (page, limit, filters) => [
    ...raffleKeys.all,
    'admin',
    'entries',
    { page, limit, filters },
  ],
  winnerDetails: (entryId) => [
    ...raffleKeys.all,
    'admin',
    'winner',
    entryId,
  ],
};

/**
 * Hook: Get current active raffle cycle
 * Public endpoint - no auth required
 */
export const useRaffleCurrentCycle = () => {
  return useQuery({
    queryKey: raffleKeys.currentCycle(),
    queryFn: async () => {
      const result = await raffleService.getRaffleCurrentCycle();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
    retry: 2,
  });
};

/**
 * Hook: Get past raffle winners
 * Public endpoint - no auth required
 * Used for social proof on landing page
 */
export const useRafflePastWinners = (limit = 10) => {
  return useQuery({
    queryKey: raffleKeys.pastWinners(limit),
    queryFn: async () => {
      const result = await raffleService.getRafflePastWinners(limit);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes garbage collection
    retry: 2,
  });
};

/**
 * Hook: Submit raffle entry
 * Protected endpoint - requires JWT
 * Triggers Stripe checkout flow
 */
export const useSubmitRaffleEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (entryData) => raffleService.submitRaffleEntry(entryData),
    onSuccess: (data) => {
      // Invalidate user's entries list
      queryClient.invalidateQueries({
        queryKey: raffleKeys.userEntries(),
      });
      // Invalidate current cycle (entry count may have changed)
      queryClient.invalidateQueries({
        queryKey: raffleKeys.currentCycle(),
      });
    },
  });
};

/**
 * Hook: Get authenticated user's raffle entries
 * Protected endpoint - requires JWT
 */
export const useUserRaffleEntries = () => {
  return useQuery({
    queryKey: raffleKeys.userEntries(),
    queryFn: async () => {
      const result = await raffleService.getUserRaffleEntries();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data || [];
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes garbage collection
    retry: 2,
  });
};

/**
 * Hook: Admin - Select winner for current cycle
 * Protected endpoint - requires admin role
 */
export const useSelectRaffleWinner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cycleId) => raffleService.selectRaffleWinner(cycleId),
    onSuccess: () => {
      // Invalidate admin stats and entries
      queryClient.invalidateQueries({
        queryKey: raffleKeys.adminStats(),
      });
      queryClient.invalidateQueries({
        queryKey: raffleKeys.adminEntries(1, 20, {}),
      });
      queryClient.invalidateQueries({
        queryKey: raffleKeys.currentCycle(),
      });
    },
  });
};

/**
 * Hook: Admin - Get raffle dashboard statistics
 * Protected endpoint - requires admin role
 */
export const useRaffleAdminStats = () => {
  return useQuery({
    queryKey: raffleKeys.adminStats(),
    queryFn: async () => {
      const result = await raffleService.getRaffleAdminStats();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes garbage collection
    retry: 2,
  });
};

/**
 * Hook: Admin - Get all raffle entries with pagination
 * Protected endpoint - requires admin role
 */
export const useRaffleAdminEntries = (page = 1, limit = 20, filters = {}) => {
  return useQuery({
    queryKey: raffleKeys.adminEntries(page, limit, filters),
    queryFn: async () => {
      const result = await raffleService.getRaffleAdminEntries(filters, page, limit);
      if (!result.success) {
        throw new Error(result.error);
      }
      return {
        entries: result.data || [],
        pagination: result.pagination,
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
    retry: 2,
  });
};

/**
 * Hook: Admin - Get specific winner/entry details
 * Protected endpoint - requires admin role
 */
export const useRaffleWinnerDetails = (entryId) => {
  return useQuery({
    queryKey: raffleKeys.winnerDetails(entryId),
    queryFn: async () => {
      const result = await raffleService.getRaffleWinnerDetails(entryId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes garbage collection
    retry: 2,
    enabled: !!entryId, // Only run if entryId is provided
  });
};

/**
 * Hook: Admin - Mark winner as shipped
 * Protected endpoint - requires admin role
 */
export const useMarkWinnerShipped = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (winnerId) => raffleService.markWinnerShipped(winnerId),
    onSuccess: () => {
      // Invalidate admin entries and stats
      queryClient.invalidateQueries({
        queryKey: raffleKeys.adminEntries(1, 20, {}),
      });
      queryClient.invalidateQueries({
        queryKey: raffleKeys.adminStats(),
      });
    },
  });
};

/**
 * Hook: Get P2P payment configuration
 * Public endpoint - no auth required
 * Used for displaying transfer instructions
 */
export const useP2PConfig = () => {
  return useQuery({
    queryKey: raffleKeys.p2pConfig(),
    queryFn: async () => {
      const result = await raffleService.getP2PConfig();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 24 * 60 * 60 * 1000, // 24 hours garbage collection
    retry: 3,
  });
};

/**
 * Hook: Submit P2P payment proof
 * Protected endpoint - requires JWT
 * Uploads receipt screenshot or transaction reference
 */
export const useSubmitP2PProof = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData) => raffleService.submitP2PProof(formData),
    onSuccess: (data) => {
      // Invalidate user's entries list
      queryClient.invalidateQueries({
        queryKey: raffleKeys.userEntries(),
      });
    },
  });
};

/**
 * Hook: Verify P2P raffle entry (admin only)
 * Approve or reject P2P payment proof
 */
export const useVerifyP2PEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ entryId, approved, rejectionReason }) =>
      raffleService.verifyP2PEntry(entryId, approved, rejectionReason),
    onSuccess: (data) => {
      // Invalidate admin entries list
      queryClient.invalidateQueries({
        queryKey: raffleKeys.adminEntries(),
      });
      // Invalidate specific winner details
      queryClient.invalidateQueries({
        queryKey: raffleKeys.winnerDetails(data.entryId),
      });
    },
  });
};

export default {
  useRaffleCurrentCycle,
  useRafflePastWinners,
  useP2PConfig,
  useSubmitRaffleEntry,
  useUserRaffleEntries,
  useSelectRaffleWinner,
  useRaffleAdminStats,
  useRaffleAdminEntries,
  useRaffleWinnerDetails,
  useMarkWinnerShipped,
  useSubmitP2PProof,
  useVerifyP2PEntry,
};
