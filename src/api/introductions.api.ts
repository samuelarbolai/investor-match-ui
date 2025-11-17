import { apiClient } from './axios.config';
import type {
  IntroductionRecord,
  IntroductionStageUpdate,
  IntroductionBulkStageUpdate,
  StageSummaryItem,
} from '../types/introduction.types';
import type { CampaignStageApi } from '../types/campaign.types';

export const introductionsApi = {
  async listStages(ownerId: string, stage?: CampaignStageApi): Promise<IntroductionRecord[]> {
    const response = await apiClient.get<IntroductionRecord[]>('/introductions/stage', {
      params: {
        ownerId,
        stage,
      },
    });
    return response.data;
  },

  async setStage(payload: IntroductionStageUpdate): Promise<IntroductionRecord> {
    const response = await apiClient.post<IntroductionRecord>('/introductions/stage', payload);
    return response.data;
  },

  async bulkUpdateStages(
    ownerId: string,
    updates: IntroductionBulkStageUpdate[]
  ): Promise<void> {
    await apiClient.post('/introductions/stages/bulk-update', {
      ownerId,
      updates,
    });
  },

  async getStageSummary(ownerId: string): Promise<StageSummaryItem[]> {
    const response = await apiClient.get<StageSummaryItem[]>('/introductions/stage/summary', {
      params: {
        ownerId,
      },
    });
    return response.data;
  },
};
