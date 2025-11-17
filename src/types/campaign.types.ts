// TODO: Flesh out campaign specific types in later phases

export type CampaignStatus =
  | 'prospect'
  | 'lead'
  | 'to_meet'
  | 'met'
  | 'not_in_campaign';

export type CampaignMembershipMap = Record<string, CampaignStatus | null>;
