import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Chip,
  Avatar,
  Box,
  Typography,
  Stack,
} from '@mui/material';
import type { Contact } from '../../types/contact.types';
import type { CampaignMembershipMap, CampaignStatus } from '../../types/campaign.types';

const STATUS_COLOR_MAP: Record<CampaignStatus, 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error'> = {
  prospect: 'primary',
  lead: 'secondary',
  to_meet: 'warning',
  met: 'success',
  not_in_campaign: 'default',
  disqualified: 'error',
};

interface CampaignContactsTableProps {
  contacts: Contact[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  campaignMembershipMap: CampaignMembershipMap;
}

export const CampaignContactsTable = ({
  contacts,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  campaignMembershipMap,
}: CampaignContactsTableProps) => {
  const allSelected = contacts.length > 0 && contacts.every((contact) => selectedIds.includes(contact.id));
  const isIndeterminate =
    !allSelected && contacts.some((contact) => selectedIds.includes(contact.id));

  const renderStatus = (contactId: string) => {
    const status = campaignMembershipMap[contactId] ?? 'not_in_campaign';
    const color = STATUS_COLOR_MAP[status];
    const label = status.replace(/_/g, ' ');

    return (
      <Chip
        label={label}
        size="small"
        color={color}
        sx={{ textTransform: 'capitalize', fontWeight: 600 }}
      />
    );
  };

  return (
    <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'grey.50' }}>
              <TableCell padding="checkbox">
                <Checkbox
                  color="primary"
                  checked={allSelected}
                  indeterminate={isIndeterminate}
                  onChange={onToggleSelectAll}
                  inputProps={{ 'aria-label': 'select all contacts' }}
                />
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Contact</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Company</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Campaign Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {contacts.map((contact) => {
              const isSelected = selectedIds.includes(contact.id);
              return (
                <TableRow
                  hover
                  key={contact.id}
                  sx={{
                    '&:last-child td, &:last-child th': { border: 0 },
                    cursor: 'default',
                  }}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      color="primary"
                      checked={isSelected}
                      onChange={() => onToggleSelect(contact.id)}
                      inputProps={{ 'aria-label': `select contact ${contact.full_name}` }}
                    />
                  </TableCell>
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
                    <Stack spacing={0.5}>
                      <Typography variant="body2" fontWeight={500}>
                        {contact.current_company}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {contact.current_role}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>{renderStatus(contact.id)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};
