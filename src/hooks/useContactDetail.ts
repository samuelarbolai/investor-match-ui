import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { contactsApi } from '../api/contacts.api';
import type { Contact, CampaignAnalysisResponse, MatchesResponse } from '../types/contact.types';

export const CONTACT_DETAIL_QUERY_KEY = 'contact-detail';
export const CAMPAIGN_ANALYSIS_QUERY_KEY = 'campaign-analysis';
export const MATCHES_QUERY_KEY = 'matches';

export const useContactDetail = (
  contactId: string,
  options?: { enabled?: boolean }
): UseQueryResult<Contact, Error> => {
  return useQuery({
    queryKey: [CONTACT_DETAIL_QUERY_KEY, contactId],
    queryFn: () => contactsApi.getContactById(contactId),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: options?.enabled ?? true,
  });
};

export const useCampaignAnalysis = (
  contactId: string,
  targetType: 'investor' | 'founder'
): UseQueryResult<CampaignAnalysisResponse, Error> => {
  return useQuery({
    queryKey: [CAMPAIGN_ANALYSIS_QUERY_KEY, contactId, targetType],
    queryFn: () => contactsApi.getCampaignAnalysis(contactId, targetType),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useMatches = (
  contactId: string,
  type: 'investor' | 'founder',
  limit: number = 10,
  tags?: string[],
  exclude_tags?: string[]
): UseQueryResult<MatchesResponse, Error> => {
  return useQuery({
    queryKey: [MATCHES_QUERY_KEY, contactId, type, limit, tags, exclude_tags],
    queryFn: () => contactsApi.getMatches(contactId, type, limit, tags, exclude_tags),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
