## Campaign & Matches Manager (current state)

- Tabs collapsed: the Campaign tab now houses both campaign contacts and matches via a slider on the manager header; the old `MatchesTab` is archived under `src/legacy/components/`.
- `useCampaignMembership` fetches real stages from `/v1/introductions/stage`, normalizes backend enums, and drives chips, filters, and stage counts.
- All bulk actions call `introductionsApi.bulkUpdateStages`; after success we refetch membership and clear selection. Actions remain enabled in both views.
- Matches view reuses the table, adds score + overlap columns, and still honors stage filters/selection. Campaign view continues to source data from `/contacts` + `/contacts/filter`.
- Stage options now include `disqualified`; `ContactFilters` exposes it when campaign filters are shown.
- `tsconfig.app.json` excludes `src/legacy` so archived components don’t affect builds.
- Contacts page shows introduction stage counts (one column per stage) fed by cached `stage_counts` on each contact. Filters now support numeric min/max per stage, the table has a column-visibility menu (skills/company/industries hidden by default), the body scrolls horizontally without hiding filters, and a “Refresh Counts” button sits next to Filters (currently just invalidates React Query caches; backend recompute was run once after adding the endpoint). Raised-capital ranges + distribution capability chips are pending wiring once the new API fields land. New `action_status` (Action Required vs Waiting) will become a column once API plumbing is live. The backend now exposes normalized `/companies` + `/experiences` nodes and investor `target_*` fields (industries, verticals, skills, distribution, locations, company IDs) so UI filters/tabs should read those arrays instead of guessing from `target_criterion_ids`.

## Notes for Next Session

1. To resurrect the standalone matches layout, copy from `src/legacy/components/MatchesTab.tsx`.
2. Consider caching introductions data or leveraging `/v1/introductions/stage/summary` to avoid fetching the entire owner pipeline every membership load.
3. API Postman collections live in `investor-match-api/postman/`; set `baseUrl`/IDs there before manual testing from the UI workflow.
4. Upcoming UI work (tied to the schema overhaul):
   - Swap `fundingStages` filters for `raised_capital_range_ids` via the new vocab endpoint.
   - Add distribution capability filters + chips for `distribution_capability_labels`.
   - Introduce a “Target Criterion” tab on `ContactDetails` to CRUD the investor thesis nodes once the API endpoints land.
