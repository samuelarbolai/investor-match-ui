## Fixes for Later

1. ContactFilters drawer state does not sync when parent filters change. Re-opening after clearing still shows old selections; re-applying re-sends stale filters. Mirror `currentFilters` into `localFilters` via `useEffect`. (`src/components/ContactFilters.tsx:56-84`)
2. Filtered pagination ignores current page. We never send `startAfter` (or similar) when filters are active, so changing pages fails to fetch new records. Either extend `/contacts/filter` to accept pagination params or paginate client-side. (`src/components/ContactsTable.tsx:33-112`)
3. API base URL is hard-coded in `src/api/axios.config.ts:3`. Externalize it (e.g., `import.meta.env`) to support staging/local backends without code edits.
