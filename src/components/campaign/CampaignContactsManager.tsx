import { useCallback, useEffect, useMemo, useState, type ChangeEvent } from 'react';
import {
  Alert,
  Box,
  CircularProgress,
  Button,
  Stack,
  TablePagination,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { CampaignContactsTable } from './CampaignContactsTable';
import { CampaignActionBar } from './CampaignActionBar';
import { ContactFilters } from '../ContactFilters';
import type {
  Contact,
  ContactFilterParams,
  ContactSortField,
  ContactsQueryParams,
  MatchCandidate,
  CampaignContactsOrderBy,
} from '../../types/contact.types';
import {
  CAMPAIGN_STAGE_OPTIONS,
  type CampaignStatus,
  toApiCampaignStage,
} from '../../types/campaign.types';
import { useContacts, CONTACTS_QUERY_KEY } from '../../hooks/useContacts';
import { useContactFilters, CONTACT_FILTERS_QUERY_KEY } from '../../hooks/useContactFilters';
import { useCampaignMembership } from '../../hooks/useCampaignMembership';
import { introductionsApi } from '../../api/introductions.api';
import { useMatches } from '../../hooks/useContactDetail';
import { useQueryClient } from '@tanstack/react-query';
import { TableSortControl } from '../TableSortControl';
import { useCampaignContacts, CAMPAIGN_CONTACTS_QUERY_KEY } from '../../hooks/useCampaignContacts';

const ALL_SORT_OPTIONS: { value: ContactSortField; label: string }[] = [
  { value: 'updated_at', label: 'Last updated' },
  { value: 'created_at', label: 'Created' },
  { value: 'full_name', label: 'Name' },
  { value: 'contact_type', label: 'Contact Type' },
];

const CAMPAIGN_SORT_OPTIONS: { value: CampaignContactsOrderBy; label: string }[] = [
  { value: 'stage', label: 'Stage priority' },
  { value: 'updated_at', label: 'Recently updated' },
];

type ViewMode = 'all' | 'campaign' | 'matches';

type ArrayFilterKey =
  | 'industries'
  | 'skills'
  | 'roles'
  | 'funding_stages'
  | 'verticals'
  | 'product_types'
  | 'seniority_levels';

interface CampaignContactsManagerProps {
  campaignId: string;
  contactType: 'investor' | 'founder';
}

export const CampaignContactsManager = ({ campaignId, contactType }: CampaignContactsManagerProps) => {
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filters, setFilters] = useState<ContactFilterParams>({});

  // All contacts view state
  const [allSortField, setAllSortField] = useState<ContactSortField>('updated_at');
  const [allSortDirection, setAllSortDirection] = useState<'asc' | 'desc'>('desc');
  const [allPage, setAllPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [allCursorStack, setAllCursorStack] = useState<Array<string | undefined>>([undefined]);

  // Campaign view state
  const [campaignSortField, setCampaignSortField] = useState<CampaignContactsOrderBy>('stage');
  const [campaignSortDirection, setCampaignSortDirection] = useState<'asc' | 'desc'>('asc');
  const [campaignPage, setCampaignPage] = useState(0);
  // Firestore doc IDs used to page through the campaign endpoint.
  const [campaignCursorStack, setCampaignCursorStack] = useState<Array<string | undefined>>([undefined]);

  // Matches view state
  const [matchesPage, setMatchesPage] = useState(0);

  const [actionError, setActionError] = useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingStage, setPendingStage] = useState<CampaignStatus | null>(null);

  const remoteFilters = useMemo<Omit<ContactFilterParams, 'campaign_status'>>(() => {
    const { campaign_status, ...rest } = filters;
    return rest;
  }, [filters]);

  const hasRemoteFilters = useMemo(() => {
    return Object.entries(remoteFilters).some(([_, value]) => {
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return value !== undefined && value !== null && value !== '';
    });
  }, [remoteFilters]);

  const matchesLocalFilter = useCallback(
    (contact: Contact) => {
      if (!hasRemoteFilters) {
        return true;
      }

      if (remoteFilters.contact_type && contact.contact_type !== remoteFilters.contact_type) {
        return false;
      }

      if (remoteFilters.location_country && contact.location_country !== remoteFilters.location_country) {
        return false;
      }

      if (remoteFilters.location_city && contact.location_city !== remoteFilters.location_city) {
        return false;
      }

      const matchMode = remoteFilters.match_mode ?? 'any';
      const checkArray = (filterValues?: string[], contactValues?: string[]) => {
        if (!filterValues || filterValues.length === 0) {
          return true;
        }
        if (!contactValues || contactValues.length === 0) {
          return false;
        }
        return matchMode === 'all'
          ? filterValues.every((value) => contactValues.includes(value))
          : filterValues.some((value) => contactValues.includes(value));
      };

      const arrayChecks: Array<[ArrayFilterKey, ArrayFilterKey]> = [
        ['industries', 'industries'],
        ['skills', 'skills'],
        ['roles', 'roles'],
        ['funding_stages', 'funding_stages'],
        ['verticals', 'verticals'],
        ['product_types', 'product_types'],
        ['seniority_levels', 'seniority_levels'],
      ];

      for (const [filterKey, contactKey] of arrayChecks) {
        const filterValues = remoteFilters[filterKey];
        const contactValues = contact[contactKey];
        if (!checkArray(filterValues, contactValues)) {
          return false;
        }
      }

      return true;
    },
    [hasRemoteFilters, remoteFilters]
  );

  const allStartAfter = allCursorStack[allPage];

  const {
    data: regularData,
    isLoading: isLoadingRegular,
    isError: isErrorRegular,
    error: errorRegular,
  } = useContacts(
    {
      limit: rowsPerPage,
      startAfter: allStartAfter,
      orderBy: allSortField,
      orderDirection: allSortDirection,
    },
    viewMode === 'all' && !hasRemoteFilters
  );
  const regularHasMore = regularData?.pagination?.hasMore ?? false;

  const { startAfter: _ignoredStartAfter, ...remoteFiltersWithoutCursor } = remoteFilters;

  const filterQueryParams: ContactsQueryParams = {
    ...remoteFiltersWithoutCursor,
    limit: rowsPerPage,
    orderBy: allSortField,
    orderDirection: allSortDirection,
  };

  const {
    data: filteredData,
    isLoading: isLoadingFiltered,
    isError: isErrorFiltered,
    error: errorFiltered,
  } = useContactFilters(filterQueryParams, viewMode === 'all' && hasRemoteFilters);

  const allContacts = useMemo<Contact[]>(() => {
    if (viewMode !== 'all') {
      return [];
    }
    if (hasRemoteFilters) {
      return filteredData?.data ?? [];
    }
    return regularData?.data ?? [];
  }, [filteredData, hasRemoteFilters, regularData, viewMode]);

  const campaignStartAfter = campaignCursorStack[campaignPage];
  // In-campaign view pulls owner-specific introductions via backend endpoint.
  const campaignQuery = useCampaignContacts(
    campaignId,
    {
      limit: rowsPerPage,
      startAfter: campaignStartAfter,
      orderBy: campaignSortField,
      orderDirection: campaignSortDirection,
    },
    viewMode === 'campaign'
  );

  const campaignRecords = campaignQuery.data?.data ?? [];
  const campaignContacts = useMemo<Contact[]>(() => campaignRecords.map((record) => record.contact), [campaignRecords]);
  const campaignNextCursor = campaignQuery.data?.pagination.nextCursor;
  const campaignHasMore = campaignQuery.data?.pagination.hasMore ?? false;

  const {
    membershipMap: campaignMembershipMap,
    isLoading: isMembershipLoading,
    error: membershipError,
    refetch: refetchMembership,
  } = useCampaignMembership(campaignId);

  const matchQuery = useMatches(campaignId, contactType, 25);
  const matchCandidates = useMemo<MatchCandidate[]>(
    () => matchQuery.data?.candidates ?? [],
    [matchQuery.data]
  );
  const matchMetaMap = useMemo<
    Record<string, { score: number; overlaps: MatchCandidate['overlaps'] }>
  >(() => {
    return matchCandidates.reduce<Record<string, { score: number; overlaps: MatchCandidate['overlaps'] }>>(
      (acc, candidate) => {
        acc[candidate.contact.id] = {
          score: candidate.score,
          overlaps: candidate.overlaps,
        };
        return acc;
      },
      {}
    );
  }, [matchCandidates]);
  const matchesContacts = useMemo<Contact[]>(() => {
    let dataset = matchCandidates.map((candidate) => candidate.contact);

    if (hasRemoteFilters) {
      dataset = dataset.filter(matchesLocalFilter);
    }

    if (filters.campaign_status) {
      dataset = dataset.filter((contact) => {
        const status = campaignMembershipMap[contact.id] ?? 'not_in_campaign';
        return status === filters.campaign_status;
      });
    }

    return dataset;
  }, [matchCandidates, hasRemoteFilters, matchesLocalFilter, filters.campaign_status, campaignMembershipMap]);

  const matchesPaged = useMemo(() => {
    const start = matchesPage * rowsPerPage;
    return matchesContacts.slice(start, start + rowsPerPage);
  }, [matchesContacts, matchesPage, rowsPerPage]);

  const totalCampaignContacts = useMemo(() => {
    if (filters.campaign_status) {
      return Object.values(campaignMembershipMap).filter((status) => status === filters.campaign_status).length;
    }
    return Object.keys(campaignMembershipMap).length;
  }, [campaignMembershipMap, filters.campaign_status]);

  const matchesTotalPages = Math.ceil(matchesContacts.length / rowsPerPage);

  const handleApplyFilters = (newFilters: ContactFilterParams) => {
    setFilters(newFilters);
    setAllPage(0);
    setCampaignPage(0);
    setMatchesPage(0);
    setAllCursorStack([undefined]);
    setCampaignCursorStack([undefined]);
  };

  const handleClearFilters = () => {
    setFilters({});
    setAllPage(0);
    setCampaignPage(0);
    setMatchesPage(0);
    setAllCursorStack([undefined]);
    setCampaignCursorStack([undefined]);
  };

  const handleViewModeChange = (_event: React.MouseEvent<HTMLElement>, next: ViewMode | null) => {
    if (!next) return;
    setViewMode(next);
    setSelectedIds([]);
    if (next === 'campaign') {
      setCampaignSortField('stage');
      setCampaignSortDirection('asc');
    }
  };

  const handleAllSortChange = (field: ContactSortField, direction: 'asc' | 'desc') => {
    setAllSortField(field);
    setAllSortDirection(direction);
    setAllPage(0);
    setAllCursorStack([undefined]);
  };

  const handleCampaignSortChange = (field: CampaignContactsOrderBy, direction: 'asc' | 'desc') => {
    setCampaignSortField(field);
    setCampaignSortDirection(direction);
    setCampaignPage(0);
    setCampaignCursorStack([undefined]);
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    if (viewMode === 'all') {
      if (newPage > allPage) {
        if (!regularHasMore) {
          return;
        }
        const contacts = (regularData?.data ?? []);
        const lastId = contacts.length > 0 ? contacts[contacts.length - 1].id : undefined;
        setAllCursorStack((prev) => {
          const copy = [...prev];
          copy[newPage] = lastId;
          return copy;
        });
      } else if (newPage < allPage) {
        setAllCursorStack((prev) => {
          const copy = [...prev];
          copy.length = Math.max(newPage + 1, 1);
          return copy;
        });
      }
      setAllPage(newPage);
      return;
    }

    if (viewMode === 'campaign') {
      if (newPage > campaignPage) {
        if (!campaignHasMore || !campaignNextCursor) {
          return;
        }
        setCampaignCursorStack((prev) => {
          const copy = [...prev];
          copy[newPage] = campaignNextCursor;
          return copy;
        });
      } else if (newPage < campaignPage) {
        setCampaignCursorStack((prev) => {
          const copy = [...prev];
          copy.length = Math.max(newPage + 1, 1);
          return copy;
        });
      }
      setCampaignPage(newPage);
      return;
    }

    if (viewMode === 'matches') {
      if (newPage > matchesPage && newPage >= matchesTotalPages) {
        return;
      }
      setMatchesPage(newPage);
    }
  };

  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    const nextRows = parseInt(event.target.value, 10);
    setRowsPerPage(nextRows);
    setAllPage(0);
    setCampaignPage(0);
    setMatchesPage(0);
    setAllCursorStack([undefined]);
    setCampaignCursorStack([undefined]);
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((selectedId) => selectedId !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = (contacts: Contact[]) => {
    if (contacts.every((contact) => selectedIds.includes(contact.id))) {
      setSelectedIds((prev) => prev.filter((id) => !contacts.some((c) => c.id === id)));
    } else {
      setSelectedIds((prev) => {
        const idsToAdd = contacts.map((contact) => contact.id).filter((id) => !prev.includes(id));
        return [...prev, ...idsToAdd];
      });
    }
  };

  const handleToggleSelectAllWrapper = (contacts: Contact[]) => () => handleToggleSelectAll(contacts);

  const displayedContacts = useMemo(() => {
    if (viewMode === 'all') {
      return allContacts;
    }
    if (viewMode === 'campaign') {
      if (!filters.campaign_status) {
        return campaignContacts;
      }
      return campaignContacts.filter((contact) => {
        const status = campaignMembershipMap[contact.id] ?? 'not_in_campaign';
        return status === filters.campaign_status;
      });
    }
    return matchesPaged;
  }, [allContacts, campaignContacts, campaignMembershipMap, filters.campaign_status, matchesPaged, viewMode]);

  useEffect(() => {
    setSelectedIds((prev) => prev.filter((id) => displayedContacts.some((contact) => contact.id === id)));
  }, [displayedContacts]);

  const totalCount = useMemo(() => {
    if (viewMode === 'all') {
      if (hasRemoteFilters) {
        return filteredData?.total ?? allContacts.length;
      }
      const base = allPage * rowsPerPage + allContacts.length;
      return regularHasMore ? base + rowsPerPage : base;
    }
    if (viewMode === 'campaign') {
      const base = campaignPage * rowsPerPage + campaignContacts.length;
      return campaignHasMore ? base + rowsPerPage : base;
    }
    return matchesContacts.length;
  }, [
    allContacts.length,
    allPage,
    campaignContacts.length,
    campaignHasMore,
    campaignPage,
    filteredData?.total,
    hasRemoteFilters,
    matchesContacts.length,
    regularHasMore,
    rowsPerPage,
    viewMode,
  ]);

  const isLoading =
    viewMode === 'all'
      ? hasRemoteFilters
        ? isLoadingFiltered
        : isLoadingRegular
      : viewMode === 'campaign'
      ? campaignQuery.isLoading
      : matchQuery.isLoading;

  const isError =
    viewMode === 'all'
      ? hasRemoteFilters
        ? isErrorFiltered
        : isErrorRegular
      : viewMode === 'campaign'
      ? Boolean(campaignQuery.error)
      : matchQuery.isError;

  const errorMessage =
    viewMode === 'all'
      ? (hasRemoteFilters ? errorFiltered : errorRegular)?.message
      : viewMode === 'campaign'
      ? campaignQuery.error?.message
      : matchQuery.error?.message;

  const handleAddToCampaign = () => runStageUpdate('prospect');

  const handleRemoveFromCampaign = () => runStageUpdate('not_in_campaign');

  const handleChangeStage = (stage: CampaignStatus) => {
    setPendingStage(stage);
    setConfirmOpen(true);
  };

  const handleConfirmYes = () => {
    if (!pendingStage) return;
    runStageUpdate(pendingStage);
    setConfirmOpen(false);
  };

  const handleConfirmNo = () => {
    setPendingStage(null);
    setConfirmOpen(false);
  };

  async function runStageUpdate(stage: CampaignStatus) {
    if (!selectedIds.length) {
      return;
    }

    try {
      setActionError(null);
      setIsActionLoading(true);
      await introductionsApi.bulkUpdateStages(
        campaignId,
        selectedIds.map((targetId) => ({
          targetId,
          stage: toApiCampaignStage(stage),
        }))
      );
      await Promise.all([
        refetchMembership(),
        queryClient.invalidateQueries({ queryKey: [CONTACTS_QUERY_KEY] }),
        queryClient.invalidateQueries({ queryKey: [CONTACT_FILTERS_QUERY_KEY] }),
        // Refresh the dedicated campaign contacts view as well
        queryClient.invalidateQueries({ queryKey: [CAMPAIGN_CONTACTS_QUERY_KEY] }),
      ]);
      setSelectedIds([]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update campaign stages';
      setActionError(message);
      console.error('[CampaignContacts] stage update failed', err);
    } finally {
      setIsActionLoading(false);
    }
  }

  const currentStageCounts = useMemo(() => {
    return displayedContacts.reduce<Record<CampaignStatus, number>>(
      (acc, contact) => {
        const status = campaignMembershipMap[contact.id] ?? 'not_in_campaign';
        acc[status] += 1;
        return acc;
      },
      {
        prospect: 0,
        qualified: 0,
        outreached: 0,
        interested: 0,
        to_meet: 0,
        met: 0,
        disqualified: 0,
        not_in_campaign: 0,
      }
    );
  }, [campaignMembershipMap, displayedContacts]);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Alert severity="error">
        Error loading contacts: {errorMessage || 'Unknown error'}
      </Alert>
    );
  }

  if (membershipError) {
    return (
      <Alert severity="error">
        Error loading membership data: {membershipError.message}
      </Alert>
    );
  }

  return (
    <Box>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} mb={2}>
        {/* View selector (All contacts vs In Campaign vs Matches) */}
        <ToggleButtonGroup value={viewMode} exclusive onChange={handleViewModeChange} color="primary">
          <ToggleButton value="all">All Contacts</ToggleButton>
          <ToggleButton value="campaign">In Campaign</ToggleButton>
          <ToggleButton value="matches">Matches</ToggleButton>
        </ToggleButtonGroup>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', md: 'center' }}>
          {viewMode === 'all' && (
            <ContactFilters
              onApplyFilters={handleApplyFilters}
              onClearFilters={handleClearFilters}
              currentFilters={filters}
              showCampaignFilters
              campaignStatusValues={CAMPAIGN_STAGE_OPTIONS}
            />
          )}
          {viewMode === 'campaign' && (
            <TableSortControl<CampaignContactsOrderBy>
              options={CAMPAIGN_SORT_OPTIONS}
              value={campaignSortField}
              direction={campaignSortDirection}
              onChange={handleCampaignSortChange}
            />
          )}
          {viewMode === 'all' && (
            <TableSortControl
              options={ALL_SORT_OPTIONS}
              value={allSortField}
              direction={allSortDirection}
              onChange={handleAllSortChange}
            />
          )}
        </Stack>
      </Stack>

      <Stack spacing={2} mb={2}>
        {actionError && (
          <Alert severity="error" onClose={() => setActionError(null)}>
            {actionError}
          </Alert>
        )}
        <CampaignActionBar
          selectedCount={selectedIds.length}
          onAddToCampaign={handleAddToCampaign}
          onRemoveFromCampaign={handleRemoveFromCampaign}
          onChangeStage={handleChangeStage}
          stageOptions={CAMPAIGN_STAGE_OPTIONS}
          disabled={isActionLoading || isMembershipLoading}
        />
        <Typography variant="caption" color="text.secondary">
          Stage distribution (
          {viewMode === 'all' ? 'all contacts' : viewMode === 'campaign' ? 'in campaign' : 'matches'} view):
          {' '}
          {JSON.stringify(currentStageCounts)}
        </Typography>
      </Stack>

      <CampaignContactsTable
        contacts={displayedContacts}
        selectedIds={selectedIds}
        onToggleSelect={handleToggleSelect}
        onToggleSelectAll={handleToggleSelectAllWrapper(displayedContacts)}
        campaignMembershipMap={campaignMembershipMap}
        mode={viewMode === 'matches' ? 'matches' : 'campaign'}
        matchMetaMap={matchMetaMap}
      />

      <Dialog open={confirmOpen} onClose={handleConfirmNo} fullWidth maxWidth="sm">
        <DialogTitle>Confirm Stage Change</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This action will trigger a message to the user showing the updated prospects. Continue?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 2, py: 1 }}>
          <Button onClick={handleConfirmNo} variant="outlined" color="error" disabled={isActionLoading}>
            No
          </Button>
          <Button onClick={handleConfirmYes} variant="contained" color="primary" disabled={isActionLoading}>
            Yes
          </Button>
        </DialogActions>
      </Dialog>

      <TablePagination
        component="div"
        count={totalCount}
        page={viewMode === 'all' ? allPage : viewMode === 'campaign' ? campaignPage : matchesPage}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
        labelRowsPerPage="Rows per page"
      />
    </Box>
  );
};
