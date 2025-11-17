import type { CampaignStageApi } from './campaign.types';

export interface FirestoreTimestamp {
  _seconds: number;
  _nanoseconds: number;
}

export interface IntroductionRecord {
  id: string;
  ownerId: string;
  targetId: string;
  stage: CampaignStageApi;
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
}

export interface StageSummaryItem {
  stage: CampaignStageApi;
  count: number;
}

export interface IntroductionStageUpdate {
  ownerId: string;
  targetId: string;
  stage: CampaignStageApi;
}

export interface IntroductionBulkStageUpdate {
  targetId: string;
  stage: CampaignStageApi;
}
