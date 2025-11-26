// TODO: Flesh out campaign specific types in later phases

export type CampaignStatus =
  | 'prospect'
  | 'qualified'
  | 'outreached'
  | 'interested'
  | 'to_meet'
  | 'met'
  | 'disqualified'
  | 'not_in_campaign';

export type CampaignStageApi =
  | 'prospect'
  | 'qualified'
  | 'outreached'
  | 'interested'
  | 'to-meet'
  | 'met'
  | 'disqualified'
  | 'not-in-campaign';

export type CampaignMembershipMap = Record<string, CampaignStatus | null>;

export const CAMPAIGN_STAGE_OPTIONS: CampaignStatus[] = [
  'prospect',
  'qualified',
  'outreached',
  'interested',
  'to_meet',
  'met',
  'disqualified',
  'not_in_campaign',
];

const UI_TO_API_STAGE_MAP: Record<CampaignStatus, CampaignStageApi> = {
  prospect: 'prospect',
  qualified: 'qualified',
  outreached: 'outreached',
  interested: 'interested',
  to_meet: 'to-meet',
  met: 'met',
  disqualified: 'disqualified',
  not_in_campaign: 'not-in-campaign',
};

const API_TO_UI_STAGE_MAP: Record<CampaignStageApi, CampaignStatus> = {
  prospect: 'prospect',
  qualified: 'qualified',
  outreached: 'outreached',
  interested: 'interested',
  'to-meet': 'to_meet',
  met: 'met',
  disqualified: 'disqualified',
  'not-in-campaign': 'not_in_campaign',
};

export const toApiCampaignStage = (stage: CampaignStatus): CampaignStageApi => {
  return UI_TO_API_STAGE_MAP[stage] ?? 'prospect';
};

export const fromApiCampaignStage = (stage: CampaignStageApi): CampaignStatus => {
  return API_TO_UI_STAGE_MAP[stage] ?? 'not_in_campaign';
};
