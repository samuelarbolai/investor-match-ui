import { useCallback, useEffect, useState } from 'react';
import type { CampaignMembershipMap } from '../types/campaign.types';
import { fromApiCampaignStage } from '../types/campaign.types';
import { introductionsApi } from '../api/introductions.api';

export async function fetchMembershipMap(campaignId: string): Promise<CampaignMembershipMap> {
  if (!campaignId) {
    return {};
  }

  const introductions = await introductionsApi.listStages(campaignId);
  return introductions.reduce<CampaignMembershipMap>((acc, introduction) => {
    acc[introduction.targetId] = fromApiCampaignStage(introduction.stage);
    return acc;
  }, {});
}

export function useCampaignMembership(campaignId: string) {
  const [membershipMap, setMembershipMap] = useState<CampaignMembershipMap>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadMembership = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      if (!campaignId) {
        setMembershipMap({});
        return;
      }
      const map = await fetchMembershipMap(campaignId);
      setMembershipMap(map);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [campaignId]);

  useEffect(() => {
    loadMembership();
  }, [loadMembership]);

  return {
    membershipMap,
    isLoading,
    error,
    refetch: loadMembership,
  };
}
