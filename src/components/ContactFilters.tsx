import { useEffect, useState } from 'react';
import {
  Box,
  Drawer,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  Typography,
  IconButton,
  Divider,
  Autocomplete,
  Badge,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import CloseIcon from '@mui/icons-material/Close';
import type { ContactFilterParams } from '../types/contact.types';
import type { CampaignStatus } from '../types/campaign.types';

interface ContactFiltersProps {
  onApplyFilters: (filters: ContactFilterParams) => void;
  onClearFilters: () => void;
  currentFilters: ContactFilterParams;
  showCampaignFilters?: boolean;
  campaignStatusValues?: CampaignStatus[];
}

// Options for different filter fields
const INDUSTRIES = [
  'fintech', 'healthcare', 'ai', 'saas', 'e-commerce', 'edtech', 
  'biotech', 'cleantech', 'crypto', 'marketplace'
];

const SKILLS = [
  'javascript', 'python', 'typescript', 'react', 'node.js', 
  'machine_learning', 'product_management', 'sales', 'marketing'
];

const ROLES = [
  'ceo', 'cto', 'engineer', 'product_manager', 'designer', 
  'sales', 'marketing', 'founder'
];

const FUNDING_STAGES = [
  'pre-seed', 'seed', 'series_a', 'series_b', 'series_c', 'growth'
];

const VERTICALS = ['b2b', 'b2c', 'b2b2c'];

const PRODUCT_TYPES = ['saas', 'marketplace', 'platform', 'hardware', 'ai_platform'];

const SENIORITY_LEVELS = ['junior', 'mid', 'senior', 'executive', 'c-level'];

export const ContactFilters = ({ 
  onApplyFilters, 
  onClearFilters,
  currentFilters,
  showCampaignFilters = false,
  campaignStatusValues = ['prospect', 'lead', 'to_meet', 'met', 'not_in_campaign']
}: ContactFiltersProps) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<ContactFilterParams>(currentFilters);
  const selectedCampaignStatus = localFilters.campaign_status ?? 'any';

  useEffect(() => {
    setLocalFilters(currentFilters);
  }, [currentFilters]);

  const handleOpenDrawer = () => setDrawerOpen(true);
  const handleCloseDrawer = () => setDrawerOpen(false);

  const handleApply = () => {
    onApplyFilters(localFilters);
    handleCloseDrawer();
  };

  const handleClear = () => {
    setLocalFilters({});
    onClearFilters();
    handleCloseDrawer();
  };

  const activeFiltersCount = Object.keys(currentFilters).filter(
    key => currentFilters[key as keyof ContactFilterParams] !== undefined &&
           currentFilters[key as keyof ContactFilterParams] !== null &&
           (Array.isArray(currentFilters[key as keyof ContactFilterParams]) 
             ? (currentFilters[key as keyof ContactFilterParams] as string[]).length > 0 
             : true)
  ).length;

  return (
    <>
      <Badge badgeContent={activeFiltersCount} color="primary">
        <Button
          variant="outlined"
          startIcon={<FilterListIcon />}
          onClick={handleOpenDrawer}
          sx={{ borderRadius: 2 }}
        >
          Filters
        </Button>
      </Badge>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleCloseDrawer}
        PaperProps={{
          sx: { width: { xs: '100%', sm: 400 }, p: 3 }
        }}
      >
        <Box>
          {/* Header */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6" fontWeight={700}>
              Filter Contacts
            </Typography>
            <IconButton onClick={handleCloseDrawer} size="small">
              <CloseIcon />
            </IconButton>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Filters Form */}
          <Stack spacing={3}>
            {showCampaignFilters && (
              <Box>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Campaign Status
                </Typography>
                <FormControl component="fieldset">
                  <RadioGroup
                    value={selectedCampaignStatus}
                    onChange={(event) => {
                      const value = event.target.value;
                      if (value === 'any') {
                        const { campaign_status, ...rest } = localFilters;
                        setLocalFilters(rest);
                      } else {
                        setLocalFilters({
                          ...localFilters,
                          campaign_status: value as CampaignStatus,
                        });
                      }
                    }}
                  >
                    <FormControlLabel value="any" control={<Radio size="small" />} label="Any" />
                    {campaignStatusValues.map((status) => (
                      <FormControlLabel
                        key={status}
                        value={status}
                        control={<Radio size="small" />}
                        label={status.replace(/_/g, ' ')}
                      />
                    ))}
                  </RadioGroup>
                </FormControl>
              </Box>
            )}

            {/* Contact Type */}
            <FormControl fullWidth>
              <InputLabel>Contact Type</InputLabel>
              <Select
                value={localFilters.contact_type || ''}
                label="Contact Type"
                onChange={(e) => setLocalFilters({
                  ...localFilters,
                  contact_type: e.target.value as 'investor' | 'founder'
                })}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="investor">Investor</MenuItem>
                <MenuItem value="founder">Founder</MenuItem>
              </Select>
            </FormControl>

            {/* Location Country */}
            <TextField
              fullWidth
              label="Country"
              value={localFilters.location_country || ''}
              onChange={(e) => setLocalFilters({
                ...localFilters,
                location_country: e.target.value
              })}
              placeholder="e.g., USA, UK, Canada"
            />

            {/* Location City */}
            <TextField
              fullWidth
              label="City"
              value={localFilters.location_city || ''}
              onChange={(e) => setLocalFilters({
                ...localFilters,
                location_city: e.target.value
              })}
              placeholder="e.g., San Francisco, New York"
            />

            {/* Industries */}
            <Autocomplete
              multiple
              options={INDUSTRIES}
              value={localFilters.industries || []}
              onChange={(_, newValue) => setLocalFilters({
                ...localFilters,
                industries: newValue
              })}
              renderInput={(params) => (
                <TextField {...params} label="Industries" placeholder="Select industries" />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    label={option}
                    size="small"
                    {...getTagProps({ index })}
                    key={option}
                  />
                ))
              }
            />

            {/* Skills */}
            <Autocomplete
              multiple
              options={SKILLS}
              value={localFilters.skills || []}
              onChange={(_, newValue) => setLocalFilters({
                ...localFilters,
                skills: newValue
              })}
              renderInput={(params) => (
                <TextField {...params} label="Skills" placeholder="Select skills" />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    label={option}
                    size="small"
                    {...getTagProps({ index })}
                    key={option}
                  />
                ))
              }
            />

            {/* Roles */}
            <Autocomplete
              multiple
              options={ROLES}
              value={localFilters.roles || []}
              onChange={(_, newValue) => setLocalFilters({
                ...localFilters,
                roles: newValue
              })}
              renderInput={(params) => (
                <TextField {...params} label="Roles" placeholder="Select roles" />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    label={option}
                    size="small"
                    {...getTagProps({ index })}
                    key={option}
                  />
                ))
              }
            />

            {/* Funding Stages */}
            <Autocomplete
              multiple
              options={FUNDING_STAGES}
              value={localFilters.funding_stages || []}
              onChange={(_, newValue) => setLocalFilters({
                ...localFilters,
                funding_stages: newValue
              })}
              renderInput={(params) => (
                <TextField {...params} label="Funding Stages" placeholder="Select stages" />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    label={option.replace('_', ' ')}
                    size="small"
                    {...getTagProps({ index })}
                    key={option}
                  />
                ))
              }
            />

            {/* Verticals */}
            <Autocomplete
              multiple
              options={VERTICALS}
              value={localFilters.verticals || []}
              onChange={(_, newValue) => setLocalFilters({
                ...localFilters,
                verticals: newValue
              })}
              renderInput={(params) => (
                <TextField {...params} label="Verticals" placeholder="Select verticals" />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    label={option}
                    size="small"
                    {...getTagProps({ index })}
                    key={option}
                  />
                ))
              }
            />

            {/* Product Types */}
            <Autocomplete
              multiple
              options={PRODUCT_TYPES}
              value={localFilters.product_types || []}
              onChange={(_, newValue) => setLocalFilters({
                ...localFilters,
                product_types: newValue
              })}
              renderInput={(params) => (
                <TextField {...params} label="Product Types" placeholder="Select types" />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    label={option.replace('_', ' ')}
                    size="small"
                    {...getTagProps({ index })}
                    key={option}
                  />
                ))
              }
            />

            {/* Seniority Levels */}
            <Autocomplete
              multiple
              options={SENIORITY_LEVELS}
              value={localFilters.seniority_levels || []}
              onChange={(_, newValue) => setLocalFilters({
                ...localFilters,
                seniority_levels: newValue
              })}
              renderInput={(params) => (
                <TextField {...params} label="Seniority Levels" placeholder="Select levels" />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    label={option}
                    size="small"
                    {...getTagProps({ index })}
                    key={option}
                  />
                ))
              }
            />

            {/* Match Mode */}
            <FormControl fullWidth>
              <InputLabel>Match Mode</InputLabel>
              <Select
                value={localFilters.match_mode || 'all'}
                label="Match Mode"
                onChange={(e) => setLocalFilters({
                  ...localFilters,
                  match_mode: e.target.value as 'all' | 'any'
                })}
              >
                <MenuItem value="all">Match All Filters</MenuItem>
                <MenuItem value="any">Match Any Filter</MenuItem>
              </Select>
            </FormControl>
          </Stack>

          {/* Actions */}
          <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={handleClear}
              sx={{ borderRadius: 2 }}
            >
              Clear All
            </Button>
            <Button
              fullWidth
              variant="contained"
              onClick={handleApply}
              sx={{ borderRadius: 2 }}
            >
              Apply Filters
            </Button>
          </Stack>
        </Box>
      </Drawer>
    </>
  );
};
