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
} from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WorkIcon from '@mui/icons-material/Work';
import ClearIcon from '@mui/icons-material/Clear';
import type { Contact, ContactFilterParams } from '../types/contact.types';
import { useContacts } from '../hooks/useContacts';
import { useContactFilters } from '../hooks/useContactFilters';
import { ContactFilters } from './ContactFilters';

export const ContactsTable = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState<ContactFilterParams>({});
  const hasActiveFilters = Object.keys(filters).length > 0;

  // Use filtered query if filters are active, otherwise use regular query
  const { 
    data: regularData, 
    isLoading: isLoadingRegular, 
    isError: isErrorRegular, 
    error: errorRegular 
  } = useContacts(
    {
      limit: rowsPerPage,
      startAfter: page * rowsPerPage,
    },
    !hasActiveFilters // Only fetch if no filters
  );

  const { 
    data: filteredData, 
    isLoading: isLoadingFiltered, 
    isError: isErrorFiltered, 
    error: errorFiltered 
  } = useContactFilters(
    { ...filters, limit: rowsPerPage },
    hasActiveFilters // Only fetch if filters exist
  );

  const isLoading = hasActiveFilters ? isLoadingFiltered : isLoadingRegular;
  const isError = hasActiveFilters ? isErrorFiltered : isErrorRegular;
  const error = hasActiveFilters ? errorFiltered : errorRegular;
  const data = hasActiveFilters ? filteredData : regularData;

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

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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
  const total = hasActiveFilters 
    ? (data as typeof filteredData)?.total 
    : (data as typeof regularData)?.pagination?.total;

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
        <Stack direction="row" spacing={2} alignItems="center">
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
          <ContactFilters 
            onApplyFilters={handleApplyFilters}
            onClearFilters={handleClearFilters}
            currentFilters={filters}
          />
        </Stack>
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
          </Stack>
        </Box>
      )}

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <TableContainer>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 700 }}>Contact</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Location</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Company</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Skills</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Industries</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Roles</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Funding Stages</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {contacts.map((contact: Contact) => (
                <TableRow
                  key={contact.id}
                  hover
                  onClick={() => navigate(`/contact/${contact.id}`)}
                  sx={{
                    '&:last-child td, &:last-child th': { border: 0 },
                    cursor: 'pointer',
                  }}
                >
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar
                        sx={{
                          bgcolor: contact.contact_type === 'investor' 
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

                  <TableCell>
                    <Chip
                      label={contact.contact_type}
                      size="small"
                      color={contact.contact_type === 'investor' ? 'primary' : 'secondary'}
                      sx={{ textTransform: 'capitalize', fontWeight: 600 }}
                    />
                  </TableCell>

                  <TableCell>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <LocationOnIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        {contact.location_city}, {contact.location_country}
                      </Typography>
                    </Box>
                  </TableCell>

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

                  <TableCell>
                    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                      {contact.skills.slice(0, 3).map((skill, index) => (
                        <Chip
                          key={index}
                          label={skill}
                          size="small"
                          variant="outlined"
                          sx={{ mb: 0.5, fontSize: '0.7rem' }}
                        />
                      ))}
                      {contact.skills.length > 3 && (
                        <Tooltip title={contact.skills.slice(3).join(', ')}>
                          <Chip
                            label={`+${contact.skills.length - 3}`}
                            size="small"
                            variant="outlined"
                            sx={{ mb: 0.5, fontSize: '0.7rem' }}
                          />
                        </Tooltip>
                      )}
                    </Stack>
                  </TableCell>

                  <TableCell>
                    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                      {contact.industries.slice(0, 2).map((industry, index) => (
                        <Chip
                          key={index}
                          label={industry}
                          size="small"
                          color="info"
                          variant="outlined"
                          sx={{ mb: 0.5, fontSize: '0.7rem' }}
                        />
                      ))}
                      {contact.industries.length > 2 && (
                        <Tooltip title={contact.industries.slice(2).join(', ')}>
                          <Chip
                            label={`+${contact.industries.length - 2}`}
                            size="small"
                            color="info"
                            variant="outlined"
                            sx={{ mb: 0.5, fontSize: '0.7rem' }}
                          />
                        </Tooltip>
                      )}
                    </Stack>
                  </TableCell>

                  <TableCell>
                    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                      {contact.roles.slice(0, 2).map((role, index) => (
                        <Chip
                          key={index}
                          label={role}
                          size="small"
                          color="success"
                          variant="outlined"
                          sx={{ mb: 0.5, fontSize: '0.7rem' }}
                        />
                      ))}
                      {contact.roles.length > 2 && (
                        <Tooltip title={contact.roles.slice(2).join(', ')}>
                          <Chip
                            label={`+${contact.roles.length - 2}`}
                            size="small"
                            color="success"
                            variant="outlined"
                            sx={{ mb: 0.5, fontSize: '0.7rem' }}
                          />
                        </Tooltip>
                      )}
                    </Stack>
                  </TableCell>

                  <TableCell>
                    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                      {contact.funding_stages.slice(0, 2).map((stage, index) => (
                        <Chip
                          key={index}
                          label={stage.replace('_', ' ')}
                          size="small"
                          color="warning"
                          variant="outlined"
                          sx={{ mb: 0.5, fontSize: '0.7rem', textTransform: 'capitalize' }}
                        />
                      ))}
                      {contact.funding_stages.length > 2 && (
                        <Tooltip title={contact.funding_stages.slice(2).join(', ')}>
                          <Chip
                            label={`+${contact.funding_stages.length - 2}`}
                            size="small"
                            color="warning"
                            variant="outlined"
                            sx={{ mb: 0.5, fontSize: '0.7rem' }}
                          />
                        </Tooltip>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={total || 0}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Rows per page:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} of ${count !== -1 ? count : `more than ${to}`}`
          }
        />
      </Paper>
    </Box>
  );
};
