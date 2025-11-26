import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { campaignContactsApi } from '../api/campaign-contacts.api';
import type { CampaignContactsQuery, CampaignContactsResponse } from '../types/contact.types';

export const CAMPAIGN_CONTACTS_QUERY_KEY = 'campaign-contacts';

export const useCampaignContacts = (
  ownerId: string,
  params: CampaignContactsQuery,
  enabled: boolean = true
): UseQueryResult<CampaignContactsResponse, Error> => {
  return useQuery({
    queryKey: [CAMPAIGN_CONTACTS_QUERY_KEY, ownerId, params],
    queryFn: () => campaignContactsApi.list(ownerId, params),
    enabled,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
