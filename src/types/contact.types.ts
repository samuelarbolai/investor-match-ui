import type { CampaignStageApi, CampaignStatus } from './campaign.types';

export interface Contact {
  id: string;
  full_name: string;
  headline: string;
  contact_type: 'investor' | 'founder';
  action_status?: 'action_required' | 'waiting';
  location_city: string;
  location_country: string;
  job_to_be_done: string[];
  skills: string[];
  industries: string[];
  verticals: string[];
  product_types: string[];
  funding_stages: string[];
  company_headcount_ranges: string[];
  engineering_headcount_ranges: string[];
  target_domains: string[];
  roles: string[];
  experiences: string[];
  current_company: string;
  current_role: string;
  past_companies: string[];
  seniority_levels: string[];
  founder_roles: string[];
  investor_roles: string[];
  stage_preferences: string[];
  check_size_range: string[];
  team_size_preferences: string[];
  founder_seniority_preferences: string[];
  engineering_headcount_preferences: string[];
  revenue_model_preferences: string[];
  risk_tolerance_preferences: string[];
  linkedin_url: string | null;
  email: string;
  created_at: {
    _seconds: number;
    _nanoseconds: number;
  };
  updated_at: {
    _seconds: number;
    _nanoseconds: number;
  };
  stage_counts?: Partial<Record<CampaignStageApi, number>>;
}

export interface Pagination {
  total: number;
  limit: number;
  nextCursor: string;
  hasMore: boolean;
}

export interface ContactsResponse {
  data: Contact[];
  pagination: Pagination;
}

export interface ContactsQueryParams {
  limit?: number;
  startAfter?: number | string;
}

export interface ContactFilterParams {
  contact_type?: 'investor' | 'founder';
  industries?: string[];
  location_city?: string;
  location_country?: string;
  skills?: string[];
  roles?: string[];
  funding_stages?: string[];
  verticals?: string[];
  product_types?: string[];
  seniority_levels?: string[];
  match_mode?: 'all' | 'any';
  limit?: number;
  startAfter?: number | string;
  campaign_status?: CampaignStatus;
  stage_count_filters?: StageCountFilterParams;
}

export interface ContactFilterResponse {
  data: Contact[];
  total: number;
  filters_applied: ContactFilterParams;
}

export interface StageCountFilterRange {
  min?: number;
  max?: number;
}

export type StageCountFilterParams = Partial<Record<CampaignStatus, StageCountFilterRange>>;

export interface CampaignCombination {
  attributes: string[];
  match_count: number;
  description: string;
}

export interface CampaignAnalysisResponse {
  contact: Contact;
  combinations: CampaignCombination[];
}

export interface MatchOverlap {
  attribute: string;
  collection: string;
  values: string[];
}

export interface MatchCandidate {
  contact: Contact;
  score: number;
  overlaps: MatchOverlap[];
}

export interface MatchesResponse {
  candidates: MatchCandidate[];
  totalMatches: number;
  seedContact: Contact;
  attributes_used: string[];
}
