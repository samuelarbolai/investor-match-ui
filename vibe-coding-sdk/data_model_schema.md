# Investor Match UI Data Model (UI-Facing)

This reflects the data shapes the UI consumes. Source of truth: TypeScript types in `src/types`.

## 1. Core entities (from API responses)
- Contact (`src/types/contact.types.ts`)
- Campaign stage enums (`src/types/campaign.types.ts`)
- Introduction records (`src/types/introduction.types.ts`)
- Campaign contact record (`src/types/contact.types.ts`, campaign section)

## 2. Contact shape (UI)
- `id`: string
- `full_name`: string
- `headline`: string
- `contact_type`: 'investor' | 'founder'
- `action_status?`: 'action_required' | 'waiting'
- `tags?`: string[]
- `exclude_tags?` (request filter only; not on Contact)
- `distribution_capability_ids?`: string[]
- `distribution_capability_labels?`: string[]
- `distribution_quality_bucket_ids?`: string[] (e.g., `socialmedia_quality_7`)
- `location_city`: string
- `location_country`: string
- `job_to_be_done`: string[]
- `skills`: string[]
- `industries`: string[]
- `verticals`: string[]
- `product_types`: string[]
- `funding_stages`: string[]
- `company_headcount_ranges`: string[]
- `engineering_headcount_ranges`: string[]
- `target_domains`: string[]
- `roles`: string[]
- `experiences`: string[] (placeholder list in current UI)
- `current_company`: string
- `current_role`: string
- `past_companies`: string[]
- `seniority_levels`: string[]
- `founder_roles`: string[]
- `investor_roles`: string[]
- `stage_preferences`: string[]
- `check_size_range`: string[]
- `team_size_preferences`: string[]
- `founder_seniority_preferences`: string[]
- `engineering_headcount_preferences`: string[]
- `revenue_model_preferences`: string[]
- `risk_tolerance_preferences`: string[]
- `linkedin_url`: string | null
- `email`: string
- `created_at`: Firestore timestamp-like object (`_seconds`, `_nanoseconds`)
- `updated_at`: Firestore timestamp-like object
- `stage_counts?`: Partial<Record<CampaignStageApi, number>> (keys per API enum)

## 3. Campaign stage enums
- UI (`CampaignStatus`): `prospect`, `qualified`, `outreached`, `interested`, `to_meet`, `met`, `disqualified`, `not_in_campaign`
- API (`CampaignStageApi`): `prospect`, `qualified`, `outreached`, `interested`, `to-meet`, `met`, `disqualified`, `not-in-campaign`
- Mappings: `toApiCampaignStage`, `fromApiCampaignStage` (see `src/types/campaign.types.ts`)

## 4. Campaign contacts & introductions
- CampaignContactRecord: `{ contact: Contact; campaign_stage: CampaignStageApi; introduced_at; updated_at; metadata? }`
- Pagination (`CampaignContactsResponse.pagination`): `{ limit, hasMore, nextCursor? }`
- IntroductionRecord: `{ id, ownerId, targetId, stage, createdAt, updatedAt }`
- Stage summaries: array of `{ stage, count }`

## 5. Matches & analysis
- `CampaignAnalysisResponse`: `{ contact: Contact; combinations: { attributes: string[]; match_count: number; description: string; }[] }`
- `MatchesResponse`: `{ candidates: { contact: Contact; score: number; overlaps: { attribute; collection; values: string[] }[] }[]; totalMatches: number; seedContact: Contact; attributes_used: string[] }`

## 6. Filtering & sorting payloads (UI expectations)
- Contacts list (`GET /contacts`): params `{ limit?, startAfter?, order_by?, order_direction? }`
- Filtered contacts (`POST /contacts/filter`): body includes:
  - `contact_type?`, `industries?`, `location_city?`, `location_country?`, `skills?`, `roles?`, `funding_stages?`, `verticals?`, `product_types?`, `seniority_levels?`, `match_mode? ('all'|'any')`, `limit?`, `startAfter?`, `order_by?`, `order_direction?`, `campaign_status?`.
  - `stage_count_filters?`: `{ [CampaignStageApi]: { min?: number; max?: number } }` (UI maps UI enums to API via `toApiCampaignStage`).
- Campaign contacts (`GET /owners/{ownerId}/campaign-contacts`): params `{ limit?, startAfter?, orderBy?, orderDirection? }`.
- Introductions bulk update (`POST /introductions/stages/bulk-update`): `{ ownerId, updates: [{ targetId, stage }] }` where `stage` is `CampaignStageApi`.
- Matches (`GET /contacts/{id}/matches`): params `{ type: 'investor'|'founder', limit }`.
- Campaign analysis (`GET /contacts/{id}/campaign-analysis`): params `{ target_type: 'investor'|'founder' }`.

## 7. Supabase agent prompts (Prompt Editor)
- Table: `agent_prompts`
- Fields used: `id`, `agent_name`, `prompt_type`, `language`, `content`, `updated_at`, `updated_by?`
- Upsert conflict target: `agent_name,prompt_type,language`
- Prompt editor defaults: `prompt_type = 'system'`, `language = 'multi'`

## 8. Display conventions (UI)
- Stage counts rendered per UI enum after mapping from API keys.
- Column visibility defaults in contacts table: show contact/type/action status/distribution/location/roles/funding; hide company/skills/industries initially (toggleable).
- Matches view shows `score` and up to 3 overlap chips (`attribute (count)`).
