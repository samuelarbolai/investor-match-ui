import { apiClient } from './axios.config';
import type { CampaignContactsResponse, CampaignContactsQuery } from '../types/contact.types';

export const campaignContactsApi = {
  async list(ownerId: string, params: CampaignContactsQuery): Promise<CampaignContactsResponse> {
    const response = await apiClient.get<CampaignContactsResponse>(`/owners/${ownerId}/campaign-contacts`, {
      params: {
        ...params,
        tags: params.tags && params.tags.length ? params.tags.join(',') : undefined,
        exclude_tags: params.exclude_tags,
      },
    });
    return response.data;
  },
};
