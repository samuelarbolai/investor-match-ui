import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import {
  Box,
  Typography,
  Stack,
  TablePagination,
  CircularProgress,
  Alert,
} from '@mui/material';
import { CampaignContactsTable } from './CampaignContactsTable';
import { CampaignActionBar } from './CampaignActionBar';
import { ContactFilters } from '../ContactFilters';
import type { Contact, ContactFilterParams } from '../../types/contact.types';
import {
  CAMPAIGN_STAGE_OPTIONS,
  type CampaignStatus,
  toApiCampaignStage,
} from '../../types/campaign.types';
import { useContacts } from '../../hooks/useContacts';
import { useContactFilters } from '../../hooks/useContactFilters';
import { useCampaignMembership } from '../../hooks/useCampaignMembership';
import { introductionsApi } from '../../api/introductions.api';

interface CampaignContactsManagerProps {
  campaignId: string;
}

export const CampaignContactsManager = ({ campaignId }: CampaignContactsManagerProps) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filters, setFilters] = useState<ContactFilterParams>({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const remoteFilters = useMemo(() => {
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

  const shouldUseFilteredQuery = hasRemoteFilters;

  const {
    data: regularData,
    isLoading: isLoadingRegular,
    isError: isErrorRegular,
    error: errorRegular,
  } = useContacts(
    {
      limit: rowsPerPage,
      startAfter: page * rowsPerPage,
    },
    !shouldUseFilteredQuery
  );

  const filterQueryParams = useMemo(
    () => ({
      ...remoteFilters,
      limit: rowsPerPage,
    }),
    [remoteFilters, rowsPerPage]
  );

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

  const contactIds = useMemo(() => baseContacts.map((contact) => contact.id), [baseContacts]);
  const {
    membershipMap,
    isLoading: isMembershipLoading,
    error: membershipError,
    refetch: refetchMembership,
  } = useCampaignMembership(campaignId, contactIds);

  const contacts = useMemo(() => {
    if (!filters.campaign_status) {
      return baseContacts;
    }

    return baseContacts.filter((contact) => {
      const status = membershipMap[contact.id] ?? 'not_in_campaign';
      return status === filters.campaign_status;
    });
  }, [baseContacts, filters.campaign_status, membershipMap]);

  const totalCount = useMemo(() => {
    if (filters.campaign_status) {
      return contacts.length;
    }
    if (shouldUseFilteredQuery) {
      return filteredData?.total ?? contacts.length;
    }
    return regularData?.pagination?.total ?? contacts.length;
  }, [contacts.length, filteredData?.total, filters.campaign_status, regularData?.pagination?.total, shouldUseFilteredQuery]);

  const isLoading = shouldUseFilteredQuery ? isLoadingFiltered : isLoadingRegular;
  const isError = shouldUseFilteredQuery ? isErrorFiltered : isErrorRegular;
  const error = shouldUseFilteredQuery ? errorFiltered : errorRegular;

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((selectedId) => selectedId !== id) : [...prev, id]
    );
  };

  const displayedContacts = contacts;

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
        lead: 0,
        to_meet: 0,
        met: 0,
        not_in_campaign: 0,
        disqualified: 0,
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
  const handleChangeStage = (stage: CampaignStatus) => runStageUpdate(stage);

  const handleApplyFilters = (newFilters: ContactFilterParams) => {
    setFilters(newFilters);
    setPage(0);
  };

  const handleClearFilters = () => {
    setFilters({});
    setPage(0);
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

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
        Error loading campaign contacts: {error?.message || 'Unknown error'}
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
              Campaign Contacts Manager
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Powered by live contacts from the API; campaign membership is still mocked until the
              intro stage endpoints are ready.
            </Typography>
          </Stack>

          <ContactFilters
            onApplyFilters={handleApplyFilters}
            onClearFilters={handleClearFilters}
            currentFilters={filters}
            showCampaignFilters
            campaignStatusValues={CAMPAIGN_STAGE_OPTIONS}
          />
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
          Stage distribution: {JSON.stringify(currentStageCounts)}
        </Typography>
      </Stack>

      <CampaignContactsTable
        contacts={displayedContacts}
        selectedIds={selectedIds}
        onToggleSelect={handleToggleSelect}
        onToggleSelectAll={handleToggleSelectAll}
        campaignMembershipMap={membershipMap}
      />

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
