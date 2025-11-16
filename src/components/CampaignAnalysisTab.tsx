import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Chip,
  Stack,
  Divider,
} from '@mui/material';
import { useCampaignAnalysis } from '../hooks/useContactDetail';

interface CampaignAnalysisTabProps {
  contactId: string;
  contactType: 'investor' | 'founder';
}

export const CampaignAnalysisTab = ({ contactId, contactType }: CampaignAnalysisTabProps) => {
  const { data, isLoading, isError, error } = useCampaignAnalysis(contactId, contactType);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !data) {
    return (
      <Alert severity="error">
        Error loading campaign analysis: {error?.message || 'Unknown error'}
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        Campaign Analysis
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Discover the best combination of attributes to find similar contacts
      </Typography>

      <Stack spacing={2}>
        {data.combinations.map((combination, index) => (
          <Card key={index} variant="outlined">
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="subtitle1" fontWeight={600}>
                  {combination.description}
                </Typography>
                <Chip 
                  label={`${combination.match_count} matches`}
                  color={combination.match_count > 0 ? 'success' : 'default'}
                  size="small"
                />
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                {combination.attributes.map((attr, idx) => (
                  <Chip
                    key={idx}
                    label={attr.replace(/_/g, ' ')}
                    size="small"
                    variant="outlined"
                    color="primary"
                  />
                ))}
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
};
