# Third Parties — Supabase & Investor Match API (UI)

## Supabase (Prompt Editor)
- Used for: listing and upserting `agent_prompts` (system prompts).
- Client: `src/lib/supabaseClient.ts` (`@supabase/supabase-js`).
- Required env vars (Vite):
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_SERVICE_ROLE_KEY` (service role key; admin access, not for public exposure).
- Prompt editor defaults: `prompt_type = 'system'`, `language = 'multi'`; upsert conflict target `agent_name,prompt_type,language`.
- Error handling: `promptsApi` surfaces Supabase errors as thrown Error; UI shows error alerts in `PromptEditorPage`.

## Investor Match API (Axios)
- Base URL (hardcoded): `https://investor-match-api-23715448976.us-east1.run.app/v1`.
- Client: `src/api/axios.config.ts` (10s timeout, JSON headers).
- Endpoints consumed:
  - `GET /contacts` (pagination, ordering).
  - `POST /contacts/filter` (filters + stage count ranges).
  - `GET /contacts/{id}` (detail).
  - `GET /contacts/{id}/campaign-analysis` (analysis tab).
  - `GET /contacts/{id}/matches` (matches view).
  - `GET /owners/{ownerId}/campaign-contacts` (campaign tab).
  - `GET /introductions/stage` (campaign membership map).
  - `POST /introductions/stages/bulk-update` (bulk stage updates).
- Auth: no token in code; add auth headers in `axios.config.ts` if backend requires.
