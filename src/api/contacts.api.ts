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
import { toApiCampaignStage, type CampaignStatus } from '../types/campaign.types';

type ApiStageCountFilters = Record<string, { min?: number; max?: number }>;

const buildStageCountFiltersPayload = (
  filters?: ContactFilterParams['stage_count_filters']
): ApiStageCountFilters | undefined => {
  if (!filters) {
    return undefined;
  }

  const payload: ApiStageCountFilters = {};

  Object.entries(filters).forEach(([stage, range]) => {
    if (!range) return;
    const numericRange: { min?: number; max?: number } = {};
    if (typeof range.min === 'number' && !Number.isNaN(range.min)) {
      numericRange.min = range.min;
    }
    if (typeof range.max === 'number' && !Number.isNaN(range.max)) {
      numericRange.max = range.max;
    }
    if (numericRange.min === undefined && numericRange.max === undefined) {
      return;
    }
    const apiStage = toApiCampaignStage(stage as CampaignStatus);
    payload[apiStage] = numericRange;
  });

  return Object.keys(payload).length > 0 ? payload : undefined;
};

export const contactsApi = {
  /**
   * Obtiene la lista de contactos con paginación
   */
  getContacts: async ({
    limit = 10,
    startAfter,
    orderBy,
    orderDirection = 'asc',
  }: ContactsQueryParams = {}): Promise<ContactsResponse> => {
    const response = await apiClient.get<ContactsResponse>('/contacts', {
      params: {
        limit,
        startAfter,
        order_by: orderBy,
        order_direction: orderDirection,
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
    const { stage_count_filters, ...rest } = filters;
    const stagePayload = buildStageCountFiltersPayload(stage_count_filters);
    const payload = stagePayload ? { ...rest, stage_count_filters: stagePayload } : rest;
    const response = await apiClient.post<ContactFilterResponse>('/contacts/filter', payload);
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
