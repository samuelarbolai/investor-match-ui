# Code Agent Context (Investor Match UI)

## Project Overview
- Single-page app built with React 18 + TypeScript + Vite; styled with MUI v7.
- Primary surface: contacts management (table, filters, stage counts), contact detail with campaign analysis, campaign manager, and Supabase-backed prompt editor.
- Data comes from the Investor Match API (`/contacts`, `/introductions`, `/contacts/filter`, `/contacts/{id}/campaign-analysis`, `/contacts/{id}/matches`) plus Supabase `agent_prompts`.
- Deployed via Vercel on every push; local development uses `vite dev`.

## Project Modules
- Investor Match UI (React/Vite): `src/` (components, pages, hooks, API clients, types, layout, Supabase client).
- Assets/config: `index.html`, `App.tsx`, `vite.config.ts`, `eslint.config.js`, `tsconfig*.json`.
- Docs: root `README.md`; SDK docs in `vibe-coding-sdk/`.

## Modules Overviews
- Investor Match UI:  
  - Contacts table with server-side pagination, column visibility, sort controls, filters (industries/skills/roles/funding_stages/verticals/product_types/seniority_levels/location/contact_type), campaign stage count filters, and cached stage count columns.  
  - Contact detail view (details tab, campaign analysis tab, campaign manager tab).  
  - Campaign manager: switch between all contacts, in-campaign contacts, and matches; bulk stage updates via introductions API; supports filtering, sorting, selection.  
  - Prompt editor: reads/writes Supabase `agent_prompts` (system prompts) with agent filter and content editor.

## Project Architechture (Flow)
1) UI loads via Vite; `App.tsx` wires React Router, MUI theme, QueryClientProvider, and `MainLayout`.
2) Contacts page uses `useContacts` (`GET /contacts`) or `useContactFilters` (`POST /contacts/filter`) depending on filter state; renders `ContactsTable` with column toggles and stage counts.
3) Contact detail uses `useContactDetail` (`GET /contacts/{id}`) plus tabs:  
   - Campaign analysis: `useCampaignAnalysis` (`GET /contacts/{id}/campaign-analysis`).  
   - Campaign manager: `CampaignContactsManager` combines `useContacts`, `useContactFilters`, `useCampaignContacts` (`GET /owners/{ownerId}/campaign-contacts`), `useCampaignMembership` (`GET /introductions/stage`), and `useMatches` (`GET /contacts/{id}/matches`). Bulk updates go to `introductionsApi.bulkUpdateStages`.
4) Prompt editor uses Supabase admin client (`VITE_SUPABASE_URL`, `VITE_SUPABASE_SERVICE_ROLE_KEY`) to list/upsert `agent_prompts`.
5) Vercel builds on push; local workflows use `npm install`, `npm run dev`, `npm run build`, `npm run preview`.

## Modules
### Readme.md
- Module Overview: Spanish README describes the portal, tech stack (React/TS/Vite/MUI/React Query/Axios), architecture, responsive table/sidebar, and future improvements.
- Building and running: `npm install`, `npm run dev`, `npm run build`, `npm run preview`.
- Prerequisites: Node (per Vite defaults), npm.
- Local Development: Vite dev server; Axios base URL points to production API; env vars live in Vite `.env` (Supabase).
- Testing: No automated tests wired; rely on manual verification.
- Development conventions:
  - Language: TypeScript + React.
  - Linting: `npm run lint` (eslint@9).
  - Formatting: not enforced by formatter in repo; follow code style.
  - Testing: not present.
  - Api Documentation: inferred from API client shapes (`src/api/*.ts`); no generated docs.
  - CI/CD:
    - Github actions: none in repo.
    - Deployment command that have worked for us: Vercel auto-deploy on push; local build `npm run build`.

### Module Structure (Directories and files)
- `src/App.tsx`: Router, theme, query client, routes.
- `src/main.tsx`: App bootstrap.
- `src/layouts/MainLayout.tsx`: App bar + drawer sidebar layout.
- `src/components/Sidebar.tsx`: Navigation drawer (Contacts, Prompt Editor).
- `src/pages/ContactsPage.tsx`: Hosts contacts table.
- `src/components/ContactsTable.tsx`: Main table (pagination, sorting, filters, column toggles, stage counts, refresh).
- `src/components/ContactFilters.tsx`: Drawer filters + campaign stage range filters.
- `src/components/TableSortControl.tsx`: Sort selector component.
- `src/pages/ContactDetailPage.tsx`: Detail view with tabs.
- `src/components/ContactDetailTabFixed.tsx`: Details tab (basic info, skills, industries).
- `src/components/CampaignAnalysisTab.tsx`: Shows campaign attribute combinations.
- `src/components/campaign/*`: Campaign manager UI (table, action bar, container).
- `src/pages/PromptEditorPage.tsx`: Supabase prompt CRUD UI.
- `src/api/*.ts`: Axios clients (contacts, introductions, campaign contacts) and Supabase prompt API.
- `src/hooks/*.ts`: React Query hooks for contacts, filters, detail, campaign contacts, membership, matches, prompts.
- `src/lib/supabaseClient.ts`: Supabase admin client from Vite env.
- `src/types/*.ts`: Contact, campaign, introduction types.
- `src/legacy/components/MatchesTab.tsx`: Archived standalone matches tab (excluded from build).
- `public/`, `index.html`, `App.css`, `index.css`: assets and global styles.

### Module Files
- File purpose: see structure above; APIs map to backend endpoints; hooks wrap API calls; components render data with MUI.
- Recent changes: Contacts table gained column visibility, stage count columns, refresh button, and exclude-tag control (backend `exclude_tags`); campaign manager added matches view and stage bulk updates; prompt editor writes Supabase `agent_prompts`; `tsconfig.app.json` excludes `src/legacy`.

### Next steps
- Add automated tests (component + hooks) and lint/format enforcement.
- Expand filters to new backend fields when exposed (raised capital ranges, distribution capabilities, target criteria).
- Improve error/loading states for campaign membership and bulk updates.
