import { apiClient } from './axios.config';
import type { CampaignContactsResponse, CampaignContactsQuery } from '../types/contact.types';

export const campaignContactsApi = {
  async list(ownerId: string, params: CampaignContactsQuery): Promise<CampaignContactsResponse> {
    const response = await apiClient.get<CampaignContactsResponse>(`/owners/${ownerId}/campaign-contacts`, {
      params,
    });
    return response.data;
  },
};
