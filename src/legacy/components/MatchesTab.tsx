import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Chip,
  Stack,
  Avatar,
  Divider,
} from '@mui/material';
import { useMatches } from '../hooks/useContactDetail';

interface MatchesTabProps {
  contactId: string;
  contactType: 'investor' | 'founder';
}

export const MatchesTab = ({ contactId, contactType }: MatchesTabProps) => {
  const { data, isLoading, isError, error } = useMatches(contactId, contactType, 10);

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
        Error loading matches: {error?.message || 'Unknown error'}
      </Alert>
    );
  }

  return (
    <Box>
      <Box mb={3}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Top Matches
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {data.totalMatches} matches found based on {data.attributes_used.join(', ')}
        </Typography>
      </Box>

      <Stack spacing={2}>
        {data.candidates.map((candidate, index) => (
          <Card key={index} variant="outlined">
            <CardContent>
              <Box display="flex" alignItems="flex-start" gap={2} mb={2}>
                <Avatar
                  sx={{
                    bgcolor: candidate.contact.contact_type === 'investor' ? 'primary.main' : 'secondary.main',
                    width: 48,
                    height: 48,
                  }}
                >
                  {candidate.contact.full_name.charAt(0)}
                </Avatar>
                <Box flex={1}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography variant="h6" fontWeight={600}>
                        {candidate.contact.full_name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {candidate.contact.headline}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {candidate.contact.current_company} • {candidate.contact.current_role}
                      </Typography>
                    </Box>
                    <Chip 
                      label={`Score: ${candidate.score}`}
                      color="primary"
                      size="small"
                    />
                  </Box>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                Overlapping Attributes
              </Typography>
              <Stack spacing={1}>
                {candidate.overlaps.map((overlap, idx) => (
                  <Box key={idx}>
                    <Typography variant="caption" fontWeight={600} textTransform="capitalize">
                      {overlap.attribute.replace(/_/g, ' ')}:
                    </Typography>
                    <Stack direction="row" spacing={0.5} mt={0.5} flexWrap="wrap" useFlexGap>
                      {overlap.values.map((value, vIdx) => (
                        <Chip
                          key={vIdx}
                          label={value.replace(/_/g, ' ')}
                          size="small"
                          variant="outlined"
                          color="success"
                        />
                      ))}
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
};
