/**
 * Follower Hooks
 * React Query hooks for follower management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import followerService from '../services/followerService';

/**
 * Query key factory for follower queries
 */
const followerKeys = {
  all: ['followers'],
  count: () => [...followerKeys.all, 'count'],
  stats: () => [...followerKeys.all, 'stats'],
  recent: (limit) => [...followerKeys.all, 'recent', limit],
};

/**
 * Hook: Get follower count
 * Polls every 30 seconds to keep counter in sync with database
 * @returns {useQuery result}
 */
export function useFollowerCount() {
  return useQuery({
    queryKey: followerKeys.count(),
    queryFn: () => followerService.getFollowerCount(),
    staleTime: 30000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes (garbage collection time)
    refetchInterval: 30000, // Refetch every 30 seconds
    refetchOnWindowFocus: true, // Refetch when window refocuses
    retry: 1, // Retry once on failure
  });
}

/**
 * Hook: Subscribe a follower
 * Mutation that also invalidates the count query
 * @returns {useMutation result}
 */
export function useSubscribeFollower() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (email) => followerService.subscribeFollower(email),
    onSuccess: (data) => {
      // Immediately update the count in cache
      queryClient.setQueryData(followerKeys.count(), data.totalFollowers);
      
      // Optionally refetch to ensure accuracy
      queryClient.refetchQueries({ queryKey: followerKeys.count() });
    },
    onError: (error) => {
      console.error('Error subscribing:', error);
    },
  });
}

/**
 * Hook: Unsubscribe a follower
 * Mutation that also invalidates the count query
 * @returns {useMutation result}
 */
export function useUnsubscribeFollower() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (email) => followerService.unsubscribeFollower(email),
    onSuccess: (data) => {
      // Update count in cache
      queryClient.setQueryData(followerKeys.count(), data.totalFollowers);
    },
    onError: (error) => {
      console.error('Error unsubscribing:', error);
    },
  });
}

/**
 * Hook: Get follower statistics (admin only)
 * @returns {useQuery result}
 */
export function useFollowerStats() {
  return useQuery({
    queryKey: followerKeys.stats(),
    queryFn: () => followerService.getFollowerStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });
}

/**
 * Hook: Get recent followers (admin only)
 * @param {number} limit - Number of followers to fetch
 * @returns {useQuery result}
 */
export function useRecentFollowers(limit = 10) {
  return useQuery({
    queryKey: followerKeys.recent(limit),
    queryFn: () => followerService.getRecentFollowers(limit),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });
}
