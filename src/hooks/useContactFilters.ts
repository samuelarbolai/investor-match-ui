import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { contactsApi } from '../api/contacts.api';
import type { ContactFilterParams, ContactFilterResponse } from '../types/contact.types';

export const CONTACT_FILTERS_QUERY_KEY = 'contact-filters';

export const useContactFilters = (
  filters: ContactFilterParams,
  enabled: boolean = true
): UseQueryResult<ContactFilterResponse, Error> => {
  return useQuery({
    queryKey: [CONTACT_FILTERS_QUERY_KEY, filters],
    queryFn: () => contactsApi.filterContacts(filters),
    enabled: enabled && Object.keys(filters).length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
  });
};
