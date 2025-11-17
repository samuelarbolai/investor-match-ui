import { useCallback, useEffect, useMemo, useState } from 'react';
import type { CampaignMembershipMap } from '../types/campaign.types';
import { fromApiCampaignStage } from '../types/campaign.types';
import { introductionsApi } from '../api/introductions.api';

export async function fetchMembershipMap(
  campaignId: string,
  contactIds: string[] = []
): Promise<CampaignMembershipMap> {
  if (!campaignId) {
    return {};
  }

  const introductions = await introductionsApi.listStages(campaignId);
  const fullMap = introductions.reduce<CampaignMembershipMap>((acc, introduction) => {
    acc[introduction.targetId] = fromApiCampaignStage(introduction.stage);
    return acc;
  }, {});

  if (!contactIds.length) {
    return fullMap;
  }

  return contactIds.reduce<CampaignMembershipMap>((acc, contactId) => {
    acc[contactId] = fullMap[contactId] ?? null;
    return acc;
  }, {});
}

export function useCampaignMembership(campaignId: string, contactIds: string[]) {
  const [membershipMap, setMembershipMap] = useState<CampaignMembershipMap>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const contactKey = useMemo(() => contactIds.join('|'), [contactIds]);
  const memoizedContactIds = useMemo(() => contactIds, [contactKey]);

  const loadMembership = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      if (!campaignId) {
        setMembershipMap({});
        return;
      }
      const map = await fetchMembershipMap(campaignId, memoizedContactIds);
      setMembershipMap(map);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [campaignId, memoizedContactIds]);

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
