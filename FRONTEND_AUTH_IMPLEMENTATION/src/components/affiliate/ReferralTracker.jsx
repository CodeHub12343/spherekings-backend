/**
 * Referral Tracker Component
 * Handles referral URL parameter detection and click tracking
 * Should be placed at app root or layout level
 */

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTrackReferralClick } from '@/hooks/useAffiliates';

/**
 * ReferralTracker - Tracks referral clicks from referral links
 *
 * This component should be placed at the app root level (in layout or app wrapper)
 * to ensure referral tracking happens on every page load.
 *
 * How it works:
 * 1. Detects ?ref=AFFILIATE_CODE query parameter in URL
 * 2. Calls trackReferralClick API endpoint
 * 3. Backend sets cookies for referral attribution through checkout
 *
 * Usage:
 * <ReferralTracker />
 */
export const ReferralTracker = () => {
  const searchParams = useSearchParams();
  const { trackClick, isTracked } = useTrackReferralClick();

  useEffect(() => {
    // Check if referral code exists in URL
    const refCode = searchParams?.get('ref');

    // Only track if we have a ref code and haven't already tracked
    if (refCode && !isTracked) {
      // Get UTM parameters if available
      const utmParams = {
        ref: refCode,
        utm_campaign: searchParams?.get('utm_campaign'),
        utm_medium: searchParams?.get('utm_medium'),
        utm_source: searchParams?.get('utm_source'),
        utm_content: searchParams?.get('utm_content'),
      };

      // Remove undefined values
      Object.keys(utmParams).forEach(
        (key) => utmParams[key] === undefined && delete utmParams[key]
      );

      // Track the referral click
      trackClick(utmParams).catch((error) => {
        console.debug('Referral tracking info:', error?.message || 'Tracking failed');
      });
    }
  }, [searchParams, isTracked, trackClick]);

  // This component doesn't render anything
  return null;
};

export default ReferralTracker;
