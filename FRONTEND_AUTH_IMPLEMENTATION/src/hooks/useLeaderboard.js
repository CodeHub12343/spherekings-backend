'use client';

import { useState, useCallback, useEffect } from 'react';
import { getAffiliateLeaderboard } from '@/api/services/affiliateService';

/**
 * useLeaderboard Hook
 * Manages leaderboard data fetching and state management
 */
export function useLeaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [stats, setStats] = useState({
    totalAffiliates: 0,
    activeCampaigns: 0,
    totalCommissions: 0,
    topCommission: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState('all');

  // Fetch leaderboard data
  const fetchLeaderboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getAffiliateLeaderboard({
        limit: 50,
        sortBy: 'totalEarnings',
      });

      // Handle response structure
      const leaders = Array.isArray(data) ? data : data?.leaderboard || [];
      
      setLeaderboard(leaders);

      // Calculate stats from leaderboard data
      if (leaders.length > 0) {
        const totalCommissions = leaders.reduce((sum, leader) => {
          return sum + (leader.totalEarnings || 0);
        }, 0);

        const topCommission = leaders[0]?.totalEarnings || 0;

        setStats({
          totalAffiliates: leaders.length,
          activeCampaigns: leaders.filter(l => l.status === 'active').length,
          totalCommissions,
          topCommission,
        });
      }
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError(err);
      setLeaderboard([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto-fetch leaderboard on mount
  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return {
    leaderboard,
    stats,
    isLoading,
    error,
    timeframe,
    setTimeframe,
    fetchLeaderboard,
  };
}
