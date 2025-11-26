import { useCallback, useEffect, useMemo, useState, type ChangeEvent } from 'react';
import {
  Alert,
  Box,
  CircularProgress,
  FormControlLabel,
  Button,
  Stack,
  Switch,
  TablePagination,
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
import { contactsApi } from '../../api/contacts.api';

type ViewMode = 'campaign' | 'matches';

interface CampaignContactsManagerProps {
  campaignId: string;
  contactType: 'investor' | 'founder';
}

type CampaignSortField = ContactSortField | 'pipeline';

const PIPELINE_SORT_OPTION = { value: 'pipeline' as CampaignSortField, label: 'Pipeline priority' };

const CONTACT_SORT_OPTIONS: { value: CampaignSortField; label: string }[] = [
  PIPELINE_SORT_OPTION,
  { value: 'updated_at', label: 'Last updated' },
  { value: 'created_at', label: 'Created' },
  { value: 'full_name', label: 'Name' },
  { value: 'contact_type', label: 'Contact Type' },
];

const STAGE_PRIORITY_ORDER: CampaignStatus[] = [
  'met',
  'to_meet',
  'interested',
  'qualified',
  'outreached',
  'prospect',
  'disqualified',
  'not_in_campaign',
];

const STAGE_RANK: Record<CampaignStatus, number> = STAGE_PRIORITY_ORDER.reduce(
  (acc, stage, index) => {
    acc[stage] = index;
    return acc;
  },
  {} as Record<CampaignStatus, number>
);

const sortByPipeline = (
  contacts: Contact[],
  membershipMap: Record<string, CampaignStatus | null>
): Contact[] => {
  return [...contacts].sort((a, b) => {
    const statusA = membershipMap[a.id] ?? 'not_in_campaign';
    const statusB = membershipMap[b.id] ?? 'not_in_campaign';
    return STAGE_RANK[statusA] - STAGE_RANK[statusB];
  });
};

const getSortValue = (contact: Contact, field: ContactSortField): string | number => {
  switch (field) {
    case 'full_name':
      return contact.full_name?.toLowerCase() ?? '';
    case 'contact_type':
      return contact.contact_type ?? '';
    case 'created_at':
      return contact.created_at?._seconds ?? 0;
    case 'updated_at':
      return contact.updated_at?._seconds ?? 0;
    default:
      return '';
  }
};

const sortContactsLocally = (
  contacts: Contact[],
  field: ContactSortField,
  direction: 'asc' | 'desc'
): Contact[] => {
  const sorted = [...contacts].sort((a, b) => {
    const valueA = getSortValue(a, field);
    const valueB = getSortValue(b, field);
    if (valueA < valueB) return -1;
    if (valueA > valueB) return 1;
    return 0;
  });
  return direction === 'asc' ? sorted : sorted.reverse();
};

export const CampaignContactsManager = ({ campaignId, contactType }: CampaignContactsManagerProps) => {
  const queryClient = useQueryClient();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filters, setFilters] = useState<ContactFilterParams>({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [cursorStack, setCursorStack] = useState<Array<string | undefined>>([undefined]);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('campaign');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingStage, setPendingStage] = useState<CampaignStatus | null>(null);
  const [sortField, setSortField] = useState<CampaignSortField>('pipeline');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

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

  type ArrayFilterKey =
    | 'industries'
    | 'skills'
    | 'roles'
    | 'funding_stages'
    | 'verticals'
    | 'product_types'
    | 'seniority_levels';

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

  const shouldUseFilteredQuery = viewMode === 'campaign' && hasRemoteFilters;
  const startAfterCursor = cursorStack[page];

  const baseQueryParams = useMemo<ContactsQueryParams>(() => {
    const params: ContactsQueryParams = {
      limit: rowsPerPage,
      startAfter: startAfterCursor,
    };
    if (sortField !== 'pipeline') {
      params.orderBy = sortField;
      params.orderDirection = sortDirection;
    }
    return params;
  }, [rowsPerPage, startAfterCursor, sortField, sortDirection]);

  const {
    data: regularData,
    isLoading: isLoadingRegular,
    isError: isErrorRegular,
    error: errorRegular,
  } = useContacts(baseQueryParams, viewMode === 'campaign' && !shouldUseFilteredQuery);

  const filterQueryParams = useMemo(() => {
    const params: ContactFilterParams = {
      ...remoteFilters,
      limit: rowsPerPage,
    };
    if (sortField !== 'pipeline') {
      params.orderBy = sortField;
      params.orderDirection = sortDirection;
    }
    return params;
  }, [remoteFilters, rowsPerPage, sortField, sortDirection]);

  const {
    data: filteredData,
    isLoading: isLoadingFiltered,
    isError: isErrorFiltered,
    error: errorFiltered,
  } = useContactFilters(filterQueryParams, shouldUseFilteredQuery);

  const baseContacts = useMemo<Contact[]>(() => {
    if (shouldUseFilteredQuery) {
      return filteredData?.data ?? [];
    }
    return regularData?.data ?? [];
  }, [filteredData, regularData, shouldUseFilteredQuery]);

  const matchQuery = useMatches(campaignId, contactType, 25);
  const matchCandidates = useMemo<MatchCandidate[]>(
    () => matchQuery.data?.candidates ?? [],
    [matchQuery.data]
  );
  const matchContacts = useMemo<Contact[]>(
    () => matchCandidates.map((candidate) => candidate.contact),
    [matchCandidates]
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

  const {
    membershipMap,
    isLoading: isMembershipLoading,
    error: membershipError,
    refetch: refetchMembership,
  } = useCampaignMembership(campaignId);

  const membershipIds = useMemo(() => Object.keys(membershipMap), [membershipMap]);
  const [campaignContactCache, setCampaignContactCache] = useState<Record<string, Contact>>({});

  useEffect(() => {
    let cancelled = false;
    if (!membershipIds.length) {
      return;
    }
    const existingIds = new Set<string>([
      ...baseContacts.map((contact) => contact.id),
      ...matchContacts.map((contact) => contact.id),
    ]);
    const missing = membershipIds.filter(
      (id) => !existingIds.has(id) && !campaignContactCache[id]
    );
    if (!missing.length) {
      return;
    }

    (async () => {
      try {
        const results = await Promise.all(
          missing.map(async (id) => {
            try {
              const contact = await contactsApi.getContactById(id);
              return { id, contact };
            } catch (error) {
              console.error('[CampaignContacts] failed to load contact', id, error);
              return null;
            }
          })
        );
        if (cancelled) {
          return;
        }
        setCampaignContactCache((prev) => {
          const next = { ...prev };
          results.forEach((result) => {
            if (result?.contact) {
              next[result.id] = result.contact;
            }
          });
          return next;
        });
      } catch (error) {
        if (!cancelled) {
          console.error('[CampaignContacts] failed to load campaign contacts', error);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [membershipIds, baseContacts, matchContacts, campaignContactCache]);

  const membershipContacts = useMemo(() => {
    return membershipIds
      .map((id) => {
        return (
          baseContacts.find((contact) => contact.id === id) ||
          campaignContactCache[id] ||
          null
        );
      })
      .filter((contact): contact is Contact => contact !== null);
  }, [membershipIds, baseContacts, campaignContactCache]);

  const combinedContacts = useMemo(() => {
    const map = new Map<string, Contact>();
    membershipContacts.forEach((contact) => map.set(contact.id, contact));
    baseContacts.forEach((contact) => map.set(contact.id, contact));
    return Array.from(map.values());
  }, [membershipContacts, baseContacts]);

  const campaignDataset = shouldUseFilteredQuery ? baseContacts : combinedContacts;

  const campaignContacts = useMemo(() => {
    if (!filters.campaign_status) {
      return campaignDataset;
    }

    return campaignDataset.filter((contact) => {
      const status = membershipMap[contact.id] ?? 'not_in_campaign';
      return status === filters.campaign_status;
    });
  }, [campaignDataset, filters.campaign_status, membershipMap]);

  const matchesContacts = useMemo(() => {
    let dataset = matchContacts;

    if (hasRemoteFilters) {
      dataset = dataset.filter(matchesLocalFilter);
    }

    if (filters.campaign_status) {
      dataset = dataset.filter((contact) => {
        const status = membershipMap[contact.id] ?? 'not_in_campaign';
        return status === filters.campaign_status;
      });
    }

    return dataset;
  }, [matchContacts, hasRemoteFilters, matchesLocalFilter, filters.campaign_status, membershipMap]);

  const contacts = viewMode === 'matches' ? matchesContacts : campaignContacts;

  const totalCount = useMemo(() => {
    if (viewMode === 'matches') {
      return contacts.length;
    }
    if (sortField === 'pipeline' || filters.campaign_status) {
      return campaignContacts.length;
    }
    if (shouldUseFilteredQuery) {
      return filteredData?.total ?? campaignContacts.length;
    }
    return regularData?.pagination?.total ?? campaignContacts.length;
  }, [
    campaignContacts.length,
    contacts.length,
    filteredData?.total,
    filters.campaign_status,
    regularData?.pagination?.total,
    shouldUseFilteredQuery,
    sortField,
    viewMode,
  ]);

  const isBaseLoading =
    viewMode === 'matches'
      ? matchQuery.isLoading
      : shouldUseFilteredQuery
      ? isLoadingFiltered
      : isLoadingRegular;
  const isBaseError =
    viewMode === 'matches'
      ? matchQuery.isError
      : shouldUseFilteredQuery
      ? isErrorFiltered
      : isErrorRegular;
  const baseError =
    viewMode === 'matches'
      ? matchQuery.error
      : shouldUseFilteredQuery
      ? errorFiltered
      : errorRegular;

  const orderedContacts = useMemo(() => {
    if (sortField === 'pipeline') {
      return sortByPipeline(contacts, membershipMap);
    }
    if (viewMode === 'matches') {
      return sortContactsLocally(contacts, sortField, sortDirection);
    }
    return contacts;
  }, [contacts, membershipMap, sortDirection, sortField, viewMode]);

  const displayedContacts = useMemo(() => {
    const start = page * rowsPerPage;
    return orderedContacts.slice(start, start + rowsPerPage);
  }, [orderedContacts, page, rowsPerPage]);

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((selectedId) => selectedId !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    if (displayedContacts.every((contact) => selectedIds.includes(contact.id))) {
      setSelectedIds((prev) => prev.filter((id) => !displayedContacts.some((c) => c.id === id)));
    } else {
      setSelectedIds((prev) => {
        const idsToAdd = displayedContacts
          .map((contact) => contact.id)
          .filter((id) => !prev.includes(id));
        return [...prev, ...idsToAdd];
      });
    }
  };

  useEffect(() => {
    setSelectedIds((prev) =>
      prev.filter((id) => displayedContacts.some((contact) => contact.id === id))
    );
    setPage((prevPage) => {
      const maxPage = Math.max(0, Math.ceil(totalCount / rowsPerPage) - 1);
      return Math.min(prevPage, maxPage);
    });
  }, [displayedContacts, rowsPerPage, totalCount]);

  const currentStageCounts = useMemo(() => {
    return displayedContacts.reduce<Record<CampaignStatus, number>>(
      (acc, contact) => {
        const status = membershipMap[contact.id] ?? 'not_in_campaign';
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
  }, [displayedContacts, membershipMap]);

  const runStageUpdate = async (stage: CampaignStatus) => {
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
      await refetchMembership();
      queryClient.invalidateQueries({ queryKey: [CONTACTS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [CONTACT_FILTERS_QUERY_KEY] });
      setSelectedIds([]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update campaign stages';
      setActionError(message);
      console.error('[CampaignContacts] stage update failed', err);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleAddToCampaign = () => runStageUpdate('prospect');
  const handleRemoveFromCampaign = () => runStageUpdate('not_in_campaign');
  const handleChangeStage = (stage: CampaignStatus) => {
    if (!selectedIds.length) return;
    setPendingStage(stage);
    setConfirmOpen(true);
  };

  const handleConfirmNo = () => {
    setConfirmOpen(false);
    setPendingStage(null);
  };

  const handleConfirmYes = async () => {
    if (!pendingStage) return;
    setConfirmOpen(false);
    await runStageUpdate(pendingStage);
    setPendingStage(null);
  };

  const handleApplyFilters = (newFilters: ContactFilterParams) => {
    setFilters(newFilters);
    setPage(0);
    setCursorStack([undefined]);
  };

  const handleClearFilters = () => {
    setFilters({});
    setPage(0);
    setCursorStack([undefined]);
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    if (viewMode === 'matches') {
      setPage(newPage);
      return;
    }
    if (newPage > page) {
      const contacts = regularData?.data ?? [];
      const lastId = contacts.length > 0 ? contacts[contacts.length - 1].id : undefined;
      setCursorStack((prev) => {
        const copy = [...prev];
        copy[newPage] = lastId;
        return copy;
      });
    }
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
    setCursorStack([undefined]);
  };

  const handleToggleViewMode = (_event: ChangeEvent<HTMLInputElement>, checked: boolean) => {
    setViewMode(checked ? 'matches' : 'campaign');
    setSelectedIds([]);
    setPage(0);
    setCursorStack([undefined]);
    if (checked) {
      setSortField('pipeline');
      setSortDirection('desc');
    }
  };

  const handleSortChange = (field: CampaignSortField, direction: 'asc' | 'desc') => {
    setSortField(field);
    setSortDirection(direction);
    setPage(0);
    setCursorStack([undefined]);
  };

  if (isBaseLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }

  if (isBaseError) {
    return (
      <Alert severity="error">
        Error loading contacts: {baseError?.message || 'Unknown error'}
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
      <Stack spacing={2} mb={3}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', md: 'center' }}
          flexDirection={{ xs: 'column', md: 'row' }}
          gap={2}
        >
          <Stack spacing={1}>
            <Typography variant="h5" fontWeight={700}>
              Campaign & Matches Manager
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Use the slider to switch between campaign contacts and match suggestions while keeping the same bulk actions.
            </Typography>
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <FormControlLabel
              control={
                <Switch
                  checked={viewMode === 'matches'}
                  onChange={handleToggleViewMode}
                  inputProps={{ 'aria-label': 'Toggle matches view' }}
                />
              }
              label="Matches view"
            />
            <ContactFilters
              onApplyFilters={handleApplyFilters}
              onClearFilters={handleClearFilters}
              currentFilters={filters}
              showCampaignFilters
              campaignStatusValues={CAMPAIGN_STAGE_OPTIONS}
            />
            <TableSortControl<CampaignSortField>
              options={CONTACT_SORT_OPTIONS}
              value={sortField}
              direction={sortDirection}
              onChange={handleSortChange}
            />
          </Stack>
        </Box>
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
          Stage distribution ({viewMode === 'matches' ? 'matches' : 'campaign'} view):{' '}
          {JSON.stringify(currentStageCounts)}
        </Typography>
      </Stack>

      <CampaignContactsTable
        contacts={displayedContacts}
        selectedIds={selectedIds}
        onToggleSelect={handleToggleSelect}
        onToggleSelectAll={handleToggleSelectAll}
        campaignMembershipMap={membershipMap}
        mode={viewMode}
        matchMetaMap={matchMetaMap}
      />

      {/* Confirmation dialog before changing stage */}
      <Dialog open={confirmOpen} onClose={handleConfirmNo} fullWidth maxWidth="sm">
        <DialogTitle>Confirm Stage Change</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This action will trigger a message to the user showing him the new prospects, are you ok with that?
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
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
        labelRowsPerPage="Rows per page"
      />
    </Box>
  );
};
