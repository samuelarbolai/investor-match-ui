import { apiClient } from './axios.config';
import { ContactsResponse, ContactsQueryParams } from '../types/contact.types';

export const contactsApi = {
  /**
   * Obtiene la lista de contactos con paginación
   */
  getContacts: async (params: ContactsQueryParams = {}): Promise<ContactsResponse> => {
    const { limit = 10, startAfter = 0 } = params;
    
    const response = await apiClient.get<ContactsResponse>('/contacts', {
      params: {
        limit,
        startAfter,
      },
    });
    
    return response.data;
  },

  /**
   * Obtiene un contacto por ID
   */
  getContactById: async (id: string) => {
    const response = await apiClient.get(`/contacts/${id}`);
    return response.data;
  },
};
