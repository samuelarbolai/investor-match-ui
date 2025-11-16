import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { contactsApi } from '../api/contacts.api';
import { type ContactsResponse, type ContactsQueryParams } from '../types/contact.types';

export const CONTACTS_QUERY_KEY = 'contacts';

export const useContacts = (
  params: ContactsQueryParams = {}
): UseQueryResult<ContactsResponse, Error> => {
  return useQuery({
    queryKey: [CONTACTS_QUERY_KEY, params],
    queryFn: () => contactsApi.getContacts(params),
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
  });
};
