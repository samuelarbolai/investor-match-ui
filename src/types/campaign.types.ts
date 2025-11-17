// TODO: Flesh out campaign specific types in later phases

export type CampaignStatus =
  | 'prospect'
  | 'lead'
  | 'to_meet'
  | 'met'
  | 'not_in_campaign'
  | 'disqualified';

export type CampaignStageApi =
  | 'prospect'
  | 'lead'
  | 'to-meet'
  | 'met'
  | 'not-in-campaign'
  | 'disqualified';

export type CampaignMembershipMap = Record<string, CampaignStatus | null>;

export const CAMPAIGN_STAGE_OPTIONS: CampaignStatus[] = [
  'prospect',
  'lead',
  'to_meet',
  'met',
  'not_in_campaign',
  'disqualified',
];

const UI_TO_API_STAGE_MAP: Record<CampaignStatus, CampaignStageApi> = {
  prospect: 'prospect',
  lead: 'lead',
  to_meet: 'to-meet',
  met: 'met',
  not_in_campaign: 'not-in-campaign',
  disqualified: 'disqualified',
};

const API_TO_UI_STAGE_MAP: Record<CampaignStageApi, CampaignStatus> = {
  prospect: 'prospect',
  lead: 'lead',
  'to-meet': 'to_meet',
  met: 'met',
  'not-in-campaign': 'not_in_campaign',
  disqualified: 'disqualified',
};

export const toApiCampaignStage = (stage: CampaignStatus): CampaignStageApi => {
  return UI_TO_API_STAGE_MAP[stage] ?? 'prospect';
};

export const fromApiCampaignStage = (stage: CampaignStageApi): CampaignStatus => {
  return API_TO_UI_STAGE_MAP[stage] ?? 'not_in_campaign';
};
