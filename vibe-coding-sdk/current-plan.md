# Investor Match UI — Current Plan (Template-Aligned)

## Plan Summary
Harden the UI for contacts, campaign management, and prompt editing so Vercel deploys stay stable: verify API contracts, smooth pagination/filter UX, default-exclude coverage-tagged contacts (toggleable), and document env/deploy requirements.

## Plan Architechture (Flow)
1) Confirm data contracts from backend against `src/types` and API clients and align render/filters.  
2) Polish contacts table (column visibility defaults, stage count refresh, cursor pagination) and campaign manager (selection, matches view, loading/error UX).  
3) Lock prompt editor flows with Supabase admin client and surface clear validation/errors.  
4) Validate build commands and document Vercel + local workflows.

## Plan Structure (Directories and files)
- Core shell: `src/App.tsx`, `src/main.tsx`, `src/layouts/MainLayout.tsx`, `src/components/Sidebar.tsx`.
- Contacts: `src/components/ContactsTable.tsx`, `src/components/ContactFilters.tsx`, `src/components/TableSortControl.tsx`, `src/hooks/useContacts.ts`, `src/hooks/useContactFilters.ts`, `src/types/contact.types.ts`.
- Contact detail & analysis: `src/pages/ContactDetailPage.tsx`, `src/components/ContactDetailTabFixed.tsx`, `src/components/CampaignAnalysisTab.tsx`, `src/hooks/useContactDetail.ts`.
- Campaign manager: `src/components/campaign/*`, `src/hooks/useCampaignContacts.ts`, `src/hooks/useCampaignMembership.ts`, `src/hooks/useContactDetail.ts`.
- Prompts: `src/pages/PromptEditorPage.tsx`, `src/hooks/usePrompts.ts`, `src/api/prompts.api.ts`, `src/lib/supabaseClient.ts`.
- API clients/config: `src/api/*.ts`, `package.json` scripts, `vite.config.ts`.

## Modifications (in phases and steps)
### Phase 1 / Step 1: Contract check & typings
- In-directory location to be modified: `src/types`, `src/api`, `src/components/ContactsTable.tsx`.
- In-file/script location to be modified: contact field usage, stage count mapping, filter payload shape.
- Specification of what should not be modified: Do not change API base URL; keep axios interceptors behavior intact.
- Code ready to copy/paste: n/a (analysis and targeted fixes per findings).
- Explanation of code and what it will do for us: Ensure UI matches backend responses to avoid runtime errors and mismapped stage counts.

### Phase 2 / Step 2: UX polish (contacts & campaign)
- In-directory location to be modified: `src/components/ContactsTable.tsx`, `src/components/campaign/*`, `src/hooks/useCampaignMembership.ts`.
- In-file/script location to be modified: pagination/selection handling, loading/error banners, stage distribution text.
- Specification of what should not be modified: Preserve matches view and stage options list.
- Code ready to copy/paste: n/a (to be authored per issue).
- Explanation of code and what it will do for us: Improve clarity and reduce UX regressions while paging/filtering and bulk-updating stages.

### Phase 3 / Step 3: Prompt editor & env clarity
- In-directory location to be modified: `src/pages/PromptEditorPage.tsx`, `src/api/prompts.api.ts`, `src/lib/supabaseClient.ts`, root `README.md` if env instructions change.
- In-file/script location to be modified: form validation, success/error surfacing, env docs.
- Specification of what should not be modified: Continue using Supabase service role for admin access.
- Code ready to copy/paste: n/a (depends on findings).
- Explanation of code and what it will do for us: Prevent empty saves, give actionable Supabase errors, and codify env requirements for Vercel.

### Phase 4 / Step 4: Build & deploy validation
- In-directory location to be modified: root config/scripts, SDK deploy doc.
- In-file/script location to be modified: `package.json` scripts (review only), `vibe-coding-sdk/deployment-commands.md`.
- Specification of what should not be modified: Keep build command `npm run build` and Vercel defaults.
- Code ready to copy/paste:
```bash
npm run build
npm run preview
```
- Explanation of code and what it will do for us: Validate production build locally and document the same steps Vercel runs.

### Phase 5 / Step 5: Exclude-tags default (backend-supported)
- In-directory location to be modified: `src/types/*`, `src/api/*`, `src/hooks/*`, `src/components/ContactsTable.tsx`, `src/components/ContactFilters.tsx`, `src/components/campaign/*`.
- In-file/script location to be modified: add `exclude_tags: string[]` support (default `['coverage']`), send `exclude_tags` to contacts/filter/campaign-contacts/matches endpoints, and surface exclude-tag control in filters (no client-side filtering needed).
- Specification of what should not be modified: Do not change API base URL; honor backend contract for `exclude_tags` array; keep matches/campaign views intact.
- Code ready to copy/paste: use `exclude_tags` arrays; GET params support repeated `exclude_tags`, POST bodies include `exclude_tags: ['coverage']` when defaulting.
- Explanation of code and what it will do for us: Uses backend exclusion to hide coverage-tagged contacts by default while letting users clear or adjust excluded tags; keeps pagination/results accurate server-side.

## Testing phase
- Local Test: `npm run build`; `npm run preview` for smoke; manual checks of contacts table (pagination/filter/sort), campaign manager (selection + bulk stage update), prompt save.
- Integration Test: Exercise API endpoints through UI flows (contacts load, introductions stage updates via bulk action, prompt upsert via Supabase); no automated harness available.

## Update Readme in the specific service in case of backend.
- For this UI module, update root `README.md` and SDK docs when commands or envs change; no backend README changes required here.
