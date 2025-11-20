import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Stack,
  Tooltip,
  Avatar,
  Button,
  IconButton,
  Menu,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Divider,
} from '@mui/material';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import BusinessIcon from '@mui/icons-material/Business';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WorkIcon from '@mui/icons-material/Work';
import ClearIcon from '@mui/icons-material/Clear';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useQueryClient } from '@tanstack/react-query';
import type { Contact, ContactFilterParams } from '../types/contact.types';
import {
  CAMPAIGN_STAGE_OPTIONS,
  fromApiCampaignStage,
  type CampaignStatus,
  type CampaignStageApi,
} from '../types/campaign.types';
import { useContacts, CONTACTS_QUERY_KEY } from '../hooks/useContacts';
import { useContactFilters, CONTACT_FILTERS_QUERY_KEY } from '../hooks/useContactFilters';
import { ContactFilters } from './ContactFilters';

const formatStageLabel = (status: CampaignStatus) => status.replace(/_/g, ' ');

const formatActionStatus = (status?: 'action_required' | 'waiting') => {
  if (status === 'action_required') return 'Action Required';
  if (status === 'waiting') return 'Waiting';
  return '—';
};

const mapStageCountsToUi = (
  _counts?: Partial<Record<CampaignStageApi, number>>
): Record<CampaignStatus, number> => {
  return CAMPAIGN_STAGE_OPTIONS.reduce((acc, status) => {
    acc[status] = 0;
    return acc;
  }, {} as Record<CampaignStatus, number>);
};

const mergeStageCounts = (
  counts?: Partial<Record<CampaignStageApi, number>>
): Record<CampaignStatus, number> => {
  const base = mapStageCountsToUi(counts);
  if (!counts) {
    return base;
  }
  Object.entries(counts).forEach(([apiStage, value]) => {
    const uiStage = fromApiCampaignStage(apiStage as CampaignStageApi);
    base[uiStage] = value ?? 0;
  });
  return base;
};

type TableColumnKey =
  | 'contact'
  | 'type'
  | 'actionStatus'
  | 'distributionPlatforms'
  | 'platformQuality'
  | 'location'
  | 'company'
  | 'skills'
  | 'industries'
  | 'roles'
  | 'fundingStages';

const DEFAULT_COLUMN_VISIBILITY: Record<TableColumnKey, boolean> = {
  contact: true,
  type: true,
  actionStatus: true,
  distributionPlatforms: true,
  platformQuality: true,
  location: true,
  company: false,
  skills: false,
  industries: false,
  roles: true,
  fundingStages: true,
};

export const ContactsTable = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState<ContactFilterParams>({});
  const [columnVisibility, setColumnVisibility] =
    useState<Record<TableColumnKey, boolean>>(DEFAULT_COLUMN_VISIBILITY);
  const [columnMenuAnchor, setColumnMenuAnchor] = useState<null | HTMLElement>(null);
  const hasActiveFilters = Object.keys(filters).length > 0;
  const [isRefreshingCounts, setIsRefreshingCounts] = useState(false);
  // Cursor-based pagination: store the startAfter (last id of previous page)
  const [cursorStack, setCursorStack] = useState<(string | number | undefined)[]>([0]);

  const handleOpenColumnMenu = (event: React.MouseEvent<HTMLElement>) => {
    setColumnMenuAnchor(event.currentTarget);
  };

  const handleCloseColumnMenu = () => setColumnMenuAnchor(null);

  const handleToggleColumn = (key: TableColumnKey) => {
    if (key === 'contact') {
      return;
    }
    setColumnVisibility((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const columnMenuOpen = Boolean(columnMenuAnchor);
  const columnOptions: { key: TableColumnKey; label: string; disabled?: boolean }[] = [
    { key: 'contact', label: 'Contact', disabled: true },
    { key: 'type', label: 'Type' },
    { key: 'actionStatus', label: 'Action Status' },
    { key: 'distributionPlatforms', label: 'Distribution Platforms' },
    { key: 'platformQuality', label: 'Platform Quality' },
    { key: 'location', label: 'Location' },
    { key: 'company', label: 'Company' },
    { key: 'skills', label: 'Skills' },
    { key: 'industries', label: 'Industries' },
    { key: 'roles', label: 'Roles' },
    { key: 'fundingStages', label: 'Funding Stages' },
  ];

  const handleRefreshCounts = async () => {
    try {
      setIsRefreshingCounts(true);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [CONTACTS_QUERY_KEY] }),
        queryClient.invalidateQueries({ queryKey: [CONTACT_FILTERS_QUERY_KEY] }),
      ]);
    } finally {
      setIsRefreshingCounts(false);
    }
  };

  // Use filtered query if filters are active, otherwise use regular query
  const startAfterCursor = cursorStack[page];

  const {
    data: regularData,
    isLoading: isLoadingRegular,
    isError: isErrorRegular,
    error: errorRegular,
  } = useContacts(
    {
      limit: rowsPerPage,
      startAfter: startAfterCursor,
    },
    !hasActiveFilters // Only fetch if no filters
  );

  const {
    data: filteredData,
    isLoading: isLoadingFiltered,
    isError: isErrorFiltered,
    error: errorFiltered,
  } = useContactFilters(
    { ...filters, limit: rowsPerPage, startAfter: startAfterCursor },
    hasActiveFilters // Only fetch if filters exist
  );

  const isLoading = hasActiveFilters ? isLoadingFiltered : isLoadingRegular;
  const isError = hasActiveFilters ? isErrorFiltered : isErrorRegular;
  const error = hasActiveFilters ? errorFiltered : errorRegular;
  const data = hasActiveFilters ? filteredData : regularData;

  const handleApplyFilters = (newFilters: ContactFilterParams) => {
    setFilters(newFilters);
    setPage(0);
    setCursorStack([0]);
  };

  const handleClearFilters = () => {
    setFilters({});
    setPage(0);
    setCursorStack([0]);
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleNextPage = () => {
    // Use last contact id of current page as cursor.
    const contacts = (hasActiveFilters ? filteredData?.data : regularData?.data) || [];
    const lastId = contacts.length > 0 ? contacts[contacts.length - 1].id : undefined;
    setCursorStack((prev) => {
      const copy = [...prev];
      copy[page + 1] = lastId; // may be undefined if empty page; backend should return empty next page too.
      return copy;
    });
    setPage((p) => p + 1);
  };

  const handlePrevPage = () => {
    if (page === 0) return;
    setPage((p) => Math.max(0, p - 1));
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
    setCursorStack([0]);
  };

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box p={3}>
        <Alert severity="error">
          Error loading contacts: {error?.message || 'Unknown error'}
        </Alert>
      </Box>
    );
  }

  const contacts = data?.data || [];
  const _extractPlatformCategory = (id: string): string => {
    const parts = id.split('_');
    if (parts.length === 0) return id;
    const primary = parts[0];
    const second = parts[1] && !parts[1].includes('quality') ? parts[1] : '';
    return [primary, second].filter(Boolean).join(' ');
  };

  const computeQualityScore = (
    bucketIds: string[] = []
  ): { score5: number | null; details: string[]; rawScores: number[] } => {
    const scores: number[] = [];
    const details: string[] = [];
    bucketIds.forEach((b) => {
      // Accept patterns: something_quality_7, something_quality7, something_quality_tier_7, trailing digits
      const match = b.match(/quality[_a-z]*?(\d+)/i) || b.match(/(\d+)$/);
      if (match) {
        const raw = parseInt(match[1], 10);
        if (!Number.isNaN(raw)) {
          // Normalize: if raw > 10 assume 0-100 scale
          const normalized = raw > 10 ? raw / 10 : raw; // bring to 0-10 scale
          scores.push(normalized);
          details.push(`${b.split('_')[0]}: ${normalized}/10`);
        }
      }
    });
    if (scores.length === 0) return { score5: null, details: [], rawScores: [] };
    const avg10 = scores.reduce((a, c) => a + c, 0) / scores.length; // average out of 10
    const mapped = Math.round((avg10 / 10) * 5); // map to 0-5
    return { score5: Math.min(5, Math.max(0, mapped)), details, rawScores: scores };
  };

  // Custom actions to always allow going to next page even with unknown total
  interface PaginationActionsProps {
    count: number;
    page: number;
    rowsPerPage: number;
    onPageChange: (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => void;
  }
  const PaginationActions = ({ page }: PaginationActionsProps) => {
    return (
      <Box sx={{ flexShrink: 0, ml: 2.5 }}>
        <IconButton onClick={handlePrevPage} disabled={page === 0} aria-label="previous page">
          <KeyboardArrowLeft />
        </IconButton>
        <IconButton onClick={handleNextPage} aria-label="next page">
          <KeyboardArrowRight />
        </IconButton>
      </Box>
    );
  };

  return (
    <Box>
      {/* Header with Filters */}
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
            Contacts
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage and view all investor and founder contacts
          </Typography>
        </Box>
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" justifyContent="flex-end">
          {hasActiveFilters && (
            <Button
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={handleClearFilters}
              color="secondary"
              sx={{ borderRadius: 2 }}
            >
              Clear Filters
            </Button>
          )}
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefreshCounts}
            disabled={isRefreshingCounts}
            sx={{ borderRadius: 2 }}
          >
            {isRefreshingCounts ? 'Refreshing…' : 'Refresh Counts'}
          </Button>
          <Tooltip title="Show/Hide columns">
            <IconButton
              onClick={handleOpenColumnMenu}
              sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
            >
              <ViewColumnIcon />
            </IconButton>
          </Tooltip>
          <ContactFilters 
            onApplyFilters={handleApplyFilters}
            onClearFilters={handleClearFilters}
            currentFilters={filters}
          />
        </Stack>
        <Menu
          anchorEl={columnMenuAnchor}
          open={columnMenuOpen}
          onClose={handleCloseColumnMenu}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Box px={2} py={1}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Columns
            </Typography>
            <Divider sx={{ mb: 1 }} />
            <FormGroup>
              {columnOptions.map(({ key, label, disabled }) => (
                <FormControlLabel
                  key={key}
                  control={
                    <Checkbox
                      checked={columnVisibility[key]}
                      onChange={() => handleToggleColumn(key)}
                      disabled={disabled}
                      size="small"
                    />
                  }
                  label={label}
                />
              ))}
            </FormGroup>
          </Box>
        </Menu>
      </Box>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <Box mb={2}>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {filters.contact_type && (
              <Chip
                label={`Type: ${filters.contact_type}`}
                onDelete={() => {
                  const { contact_type: _, ...rest } = filters;
                  setFilters(rest);
                }}
                color="primary"
                size="small"
              />
            )}
            {filters.location_country && (
              <Chip
                label={`Country: ${filters.location_country}`}
                onDelete={() => {
                  const { location_country: _, ...rest } = filters;
                  setFilters(rest);
                }}
                color="primary"
                size="small"
              />
            )}
            {filters.location_city && (
              <Chip
                label={`City: ${filters.location_city}`}
                onDelete={() => {
                  const { location_city: _, ...rest } = filters;
                  setFilters(rest);
                }}
                color="primary"
                size="small"
              />
            )}
            {filters.industries?.map((industry) => (
              <Chip
                key={industry}
                label={`Industry: ${industry}`}
                onDelete={() => {
                  setFilters({
                    ...filters,
                    industries: filters.industries?.filter((i) => i !== industry)
                  });
                }}
                color="info"
                size="small"
              />
            ))}
            {filters.skills?.map((skill) => (
              <Chip
                key={skill}
                label={`Skill: ${skill}`}
                onDelete={() => {
                  setFilters({
                    ...filters,
                    skills: filters.skills?.filter((s) => s !== skill)
                  });
                }}
                color="success"
                size="small"
              />
            ))}
            {filters.roles?.map((role) => (
              <Chip
                key={role}
                label={`Role: ${role}`}
                onDelete={() => {
                  setFilters({
                    ...filters,
                    roles: filters.roles?.filter((r) => r !== role)
                  });
                }}
                color="warning"
                size="small"
              />
            ))}
            {filters.stage_count_filters &&
              Object.entries(filters.stage_count_filters).map(([stage, range]) => {
                if (!range || (range.min === undefined && range.max === undefined)) {
                  return null;
                }
                const labelParts: string[] = [];
                if (range.min !== undefined) {
                  labelParts.push(`≥ ${range.min}`);
                }
                if (range.max !== undefined) {
                  labelParts.push(`≤ ${range.max}`);
                }
                const stageLabel = formatStageLabel(stage as CampaignStatus);
                return (
                  <Chip
                    key={`stage-count-${stage}`}
                    label={`${stageLabel}: ${labelParts.join(' & ')}`}
                    onDelete={() => {
                      const nextFilters = { ...filters };
                      const nextStageFilters = { ...(filters.stage_count_filters ?? {}) };
                      delete nextStageFilters[stage as CampaignStatus];
                      if (Object.keys(nextStageFilters).length === 0) {
                        delete nextFilters.stage_count_filters;
                      } else {
                        nextFilters.stage_count_filters = nextStageFilters;
                      }
                      setFilters(nextFilters);
                    }}
                    color="default"
                    size="small"
                  />
                );
              })}
          </Stack>
        </Box>
      )}

      <Paper
        elevation={0}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
        }}
      >
        <TableContainer
          sx={{
            width: '100%',
            overflowX: 'auto',
          }}
        >
          <Table sx={{ minWidth: 1250 }} size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: 'grey.50', '& th': { whiteSpace: 'nowrap' } }}>
                {columnVisibility.contact && (
                  <TableCell sx={{ fontWeight: 700 }}>Contact</TableCell>
                )}
                {columnVisibility.type && (
                  <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                )}
                {columnVisibility.actionStatus && (
                  <TableCell sx={{ fontWeight: 700 }}>Action Status</TableCell>
                )}
                {columnVisibility.distributionPlatforms && (
                  <TableCell sx={{ fontWeight: 700 }}>Distribution Platforms</TableCell>
                )}
                {columnVisibility.platformQuality && (
                  <TableCell sx={{ fontWeight: 700 }}>Platform Quality</TableCell>
                )}
                {columnVisibility.location && (
                  <TableCell sx={{ fontWeight: 700 }}>Location</TableCell>
                )}
                {columnVisibility.company && (
                  <TableCell sx={{ fontWeight: 700 }}>Company</TableCell>
                )}
                {columnVisibility.skills && (
                  <TableCell sx={{ fontWeight: 700 }}>Skills</TableCell>
                )}
                {columnVisibility.industries && (
                  <TableCell sx={{ fontWeight: 700 }}>Industries</TableCell>
                )}
                {columnVisibility.roles && (
                  <TableCell sx={{ fontWeight: 700 }}>Roles</TableCell>
                )}
                {columnVisibility.fundingStages && (
                  <TableCell sx={{ fontWeight: 700 }}>Funding Stages</TableCell>
                )}
                {CAMPAIGN_STAGE_OPTIONS.map((stage) => (
                  <TableCell
                    key={`stage-head-${stage}`}
                    sx={{ fontWeight: 700 }}
                    align="center"
                  >
                    {formatStageLabel(stage)}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {contacts.map((contact: Contact) => {
                const stageCounts = mergeStageCounts(contact.stage_counts);
                return (
                  <TableRow
                    key={contact.id}
                    hover
                    onClick={() => navigate(`/contact/${contact.id}`)}
                    sx={{
                      '&:last-child td, &:last-child th': { border: 0 },
                      cursor: 'pointer',
                    }}
                  >
                    {columnVisibility.contact && (
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar
                            sx={{
                              bgcolor:
                                contact.contact_type === 'investor'
                                  ? 'primary.main'
                                  : 'secondary.main',
                            }}
                          >
                            {contact.full_name.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {contact.full_name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {contact.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                    )}

                    {columnVisibility.type && (
                      <TableCell>
                        <Chip
                          label={contact.contact_type}
                          size="small"
                          color={contact.contact_type === 'investor' ? 'primary' : 'secondary'}
                          sx={{ textTransform: 'capitalize', fontWeight: 600 }}
                        />
                      </TableCell>
                    )}

                    {columnVisibility.actionStatus && (
                      <TableCell>
                        {contact.action_status ? (
                          <Chip
                            label={formatActionStatus(contact.action_status)}
                            size="small"
                            color={contact.action_status === 'action_required' ? 'warning' : 'info'}
                            variant="filled"
                            sx={{ fontWeight: 600 }}
                          />
                        ) : (
                          <Typography variant="body2" color="text.secondary">—</Typography>
                        )}
                      </TableCell>
                    )}
                    {columnVisibility.distributionPlatforms && (
                      <TableCell>
                        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                          {(contact.distribution_capability_labels ?? []).slice(0, 2).map((label, idx) => (
                            <Tooltip key={idx} title={label}>
                              <Chip
                                label={label.length > 20 ? `${label.slice(0, 18)}…` : label}
                                size="small"
                                color="secondary"
                                variant="outlined"
                                sx={{ mb: 0.5, maxWidth: 120 }}
                              />
                            </Tooltip>
                          ))}
                          {(contact.distribution_capability_labels ?? []).length > 2 && (
                            <Tooltip title={(contact.distribution_capability_labels ?? []).slice(2).join(', ')}>
                              <Chip
                                label={`+${(contact.distribution_capability_labels ?? []).length - 2}`}
                                size="small"
                                variant="outlined"
                                sx={{ mb: 0.5 }}
                              />
                            </Tooltip>
                          )}
                          {(contact.distribution_capability_labels ?? []).length === 0 && (
                            <Typography variant="body2" color="text.secondary">—</Typography>
                          )}
                        </Stack>
                      </TableCell>
                    )}
                    {columnVisibility.platformQuality && (
                      <TableCell>
                        {(() => {
                          const { score5, details, rawScores } = computeQualityScore(
                            contact.distribution_quality_bucket_ids ?? []
                          );
                          if (score5 === null) {
                            return <Typography variant="body2" color="text.secondary">—</Typography>;
                          }
                          const stars = '★★★★★'.slice(0, score5).padEnd(5, '☆');
                          return (
                            <Tooltip
                              title={`Avg: ${score5}/5\nRaw: ${rawScores.map((r) => r.toFixed(1)).join(', ')}\n${details.join('\n')}`}
                            >
                              <Chip
                                label={`${score5}/5 ${stars}`}
                                size="small"
                                color={score5 >= 4 ? 'success' : score5 >= 2 ? 'warning' : 'default'}
                                variant="filled"
                                sx={{ fontWeight: 600 }}
                              />
                            </Tooltip>
                          );
                        })()}
                      </TableCell>
                    )}

                    {columnVisibility.location && (
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <LocationOnIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2">
                            {contact.location_city}, {contact.location_country}
                          </Typography>
                        </Box>
                      </TableCell>
                    )}

                    {columnVisibility.company && (
                      <TableCell>
                        <Box>
                          <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
                            <BusinessIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2" fontWeight={500}>
                              {contact.current_company}
                            </Typography>
                          </Box>
                          <Box display="flex" alignItems="center" gap={0.5}>
                            <WorkIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">
                              {contact.current_role}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                    )}

                    {columnVisibility.skills && (
                      <TableCell>
                        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                          {(contact.skills ?? []).slice(0, 3).map((skill, index) => (
                            <Chip
                              key={index}
                              label={skill}
                              size="small"
                              variant="outlined"
                              sx={{ mb: 0.5, fontSize: '0.7rem' }}
                            />
                          ))}
                          {(contact.skills ?? []).length > 3 && (
                            <Tooltip title={(contact.skills ?? []).slice(3).join(', ')}>
                              <Chip
                                label={`+${(contact.skills ?? []).length - 3}`}
                                size="small"
                                variant="outlined"
                                sx={{ mb: 0.5, fontSize: '0.7rem' }}
                              />
                            </Tooltip>
                          )}
                        </Stack>
                      </TableCell>
                    )}

                    {columnVisibility.industries && (
                      <TableCell>
                        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                          {(contact.industries ?? []).slice(0, 2).map((industry, index) => (
                            <Chip
                              key={index}
                              label={industry}
                              size="small"
                              color="info"
                              variant="outlined"
                              sx={{ mb: 0.5, fontSize: '0.7rem' }}
                            />
                          ))}
                          {(contact.industries ?? []).length > 2 && (
                            <Tooltip title={(contact.industries ?? []).slice(2).join(', ')}>
                              <Chip
                                label={`+${(contact.industries ?? []).length - 2}`}
                                size="small"
                                color="info"
                                variant="outlined"
                                sx={{ mb: 0.5, fontSize: '0.7rem' }}
                              />
                            </Tooltip>
                          )}
                        </Stack>
                      </TableCell>
                    )}

                    {columnVisibility.roles && (
                      <TableCell>
                        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                          {(contact.roles ?? []).slice(0, 2).map((role, index) => (
                            <Chip
                              key={index}
                              label={role}
                              size="small"
                              color="success"
                              variant="outlined"
                              sx={{ mb: 0.5, fontSize: '0.7rem' }}
                            />
                          ))}
                          {(contact.roles ?? []).length > 2 && (
                            <Tooltip title={(contact.roles ?? []).slice(2).join(', ')}>
                              <Chip
                                label={`+${(contact.roles ?? []).length - 2}`}
                                size="small"
                                color="success"
                                variant="outlined"
                                sx={{ mb: 0.5, fontSize: '0.7rem' }}
                              />
                            </Tooltip>
                          )}
                        </Stack>
                      </TableCell>
                    )}

                    {columnVisibility.fundingStages && (
                      <TableCell>
                        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                          {(contact.funding_stages ?? []).slice(0, 2).map((stage, index) => (
                            <Chip
                              key={index}
                              label={stage.replace('_', ' ')}
                              size="small"
                              color="warning"
                              variant="outlined"
                              sx={{ mb: 0.5, fontSize: '0.7rem', textTransform: 'capitalize' }}
                            />
                          ))}
                          {(contact.funding_stages ?? []).length > 2 && (
                            <Tooltip title={(contact.funding_stages ?? []).slice(2).join(', ')}>
                              <Chip
                                label={`+${(contact.funding_stages ?? []).length - 2}`}
                                size="small"
                                color="warning"
                                variant="outlined"
                                sx={{ mb: 0.5, fontSize: '0.7rem' }}
                              />
                            </Tooltip>
                          )}
                        </Stack>
                      </TableCell>
                    )}
                    {CAMPAIGN_STAGE_OPTIONS.map((stage) => (
                      <TableCell key={`${contact.id}-${stage}`} align="center">
                        {stageCounts[stage] ?? 0}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          // Use unknown total to always allow next page
          count={-1}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Rows per page:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} of ${count !== -1 ? count : `more than ${to}`}`
          }
          showFirstButton={false}
          showLastButton={false}
          ActionsComponent={PaginationActions}
        />
      </Paper>
    </Box>
  );
};
