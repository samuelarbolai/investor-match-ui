import { apiClient } from './axios.config';
import { 
  type ContactsResponse, 
  type ContactsQueryParams,
  type ContactFilterParams,
  type ContactFilterResponse,
  type Contact,
  type CampaignAnalysisResponse,
  type MatchesResponse,
} from '../types/contact.types';

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
  getContactById: async (id: string): Promise<Contact> => {
    const response = await apiClient.get<Contact>(`/contacts/${id}`);
    return response.data;
  },

  /**
   * Filtra contactos según criterios específicos
   */
  filterContacts: async (filters: ContactFilterParams): Promise<ContactFilterResponse> => {
    const response = await apiClient.post<ContactFilterResponse>('/contacts/filter', filters);
    return response.data;
  },

  /**
   * Obtiene análisis de campaña para un contacto
   */
  getCampaignAnalysis: async (
    contactId: string, 
    targetType: 'investor' | 'founder'
  ): Promise<CampaignAnalysisResponse> => {
    const response = await apiClient.get<CampaignAnalysisResponse>(
      `/contacts/${contactId}/campaign-analysis`,
      { params: { target_type: targetType } }
    );
    return response.data;
  },

  /**
   * Obtiene matches para un contacto
   */
  getMatches: async (
    contactId: string,
    type: 'investor' | 'founder',
    limit: number = 10
  ): Promise<MatchesResponse> => {
    const response = await apiClient.get<MatchesResponse>(
      `/contacts/${contactId}/matches`,
      { params: { type, limit } }
    );
    return response.data;
  },
};
