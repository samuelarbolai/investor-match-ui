import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Tabs,
  Tab,
  IconButton,
  Typography,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useContactDetail } from '../hooks/useContactDetail';
import { ContactDetailTab } from '../components/ContactDetailTabFixed';
import { CampaignAnalysisTab } from '../components/CampaignAnalysisTab';
import { MatchesTab } from '../components/MatchesTab';
import { CampaignContactsManager } from '../components/campaign/CampaignContactsManager';

export const ContactDetailPage = () => {
  const { contactId } = useParams<{ contactId: string }>();
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState(0);

  const { data: contact, isLoading, isError, error } = useContactDetail(contactId!);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleBack = () => {
    navigate('/');
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (isError || !contact) {
    return (
      <Box p={3}>
        <Alert severity="error">
          Error loading contact: {error?.message || 'Contact not found'}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header with Back Button */}
      <Box mb={3} display="flex" alignItems="center" gap={2}>
        <IconButton onClick={handleBack} sx={{ bgcolor: 'background.paper' }}>
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
            {contact.full_name}
          </Typography>
          <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
            <Typography variant="body2" color="text.secondary">
              {contact.headline}
            </Typography>
            <Chip
              label={contact.contact_type}
              size="small"
              color={contact.contact_type === 'investor' ? 'primary' : 'secondary'}
              sx={{ textTransform: 'capitalize' }}
            />
          </Box>
        </Box>
      </Box>

      {/* Tabs */}
      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            px: 2,
          }}
        >
          <Tab label="Details" />
          <Tab label="Campaign Analysis" />
          <Tab label="Matches" />
          <Tab label="Campaign" />
        </Tabs>

        <Box p={3}>
          {currentTab === 0 && <ContactDetailTab contact={contact} />}
          {currentTab === 1 && (
            <CampaignAnalysisTab
              contactId={contact.id}
              contactType={contact.contact_type}
            />
          )}
          {currentTab === 2 && (
            <MatchesTab contactId={contact.id} contactType={contact.contact_type} />
          )}
          {currentTab === 3 && <CampaignContactsManager />}
        </Box>
      </Paper>
    </Box>
  );
};
