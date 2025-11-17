## Campaign Contacts Manager Progress

- Phases 1–7 of the multi-phase plan are complete. We now have `CampaignContactsManager` rendering inside the `ContactDetailPage` under the “Campaign” tab with real contact data, local filters (including campaign status), pagination, and bulk action stubs.
- Contacts come from the existing `/contacts` and `/contacts/filter` endpoints via `useContacts` / `useContactFilters`. Pagination uses API totals; selection logic respects the current page.
- Campaign membership is still mocked but now flows through `useCampaignMembership`, which simulates an async fetch and refreshes after every mock action. Replace `fetchMembershipMap` + action handlers when IntroStage endpoints are ready.

## Next Steps (IntroStage integration)

1. Implement real membership fetch once IntroStage APIs exist, probably keyed by `campaignId` (parameterize `CampaignContactsManager` and `useCampaignMembership` accordingly).
2. Replace the mock action handlers in `CampaignActionBar` integration with actual API calls (add/remove/change stage) and trigger membership refetches afterward.
3. Consider persisting/deriving the selected campaign ID per contact (currently hard-coded to `'default-campaign'` in the manager).
