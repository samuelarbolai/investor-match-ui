import { useCallback, useEffect, useMemo, useState } from 'react';
import type { CampaignMembershipMap, CampaignStatus } from '../types/campaign.types';

const STAGE_SEQUENCE: CampaignStatus[] = ['prospect', 'lead', 'to_meet', 'met', 'not_in_campaign'];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// TODO: Replace with real IntroStage API once available
export async function fetchMembershipMap(
  campaignId: string,
  contactIds: string[] = []
): Promise<CampaignMembershipMap> {
  await delay(350);

  const baseMap: CampaignMembershipMap = {
    contact_1: 'prospect',
    contact_2: 'lead',
    contact_3: 'to_meet',
  };

  if (!contactIds.length) {
    return baseMap;
  }

  return contactIds.reduce<CampaignMembershipMap>((acc, contactId, index) => {
    acc[contactId] = STAGE_SEQUENCE[index % STAGE_SEQUENCE.length];
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
  }, [loadMembership, contactKey]);

  return {
    membershipMap,
    isLoading,
    error,
    refetch: loadMembership,
  };
}
