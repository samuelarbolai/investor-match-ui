import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  Divider,
} from '@mui/material';
import type { Contact } from '../types/contact.types';

interface ContactDetailTabProps {
  contact: Contact;
}

export const ContactDetailTab = ({ contact }: ContactDetailTabProps) => {
  return (
    <Box>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 3,
        }}
      >
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" fontWeight={600} mb={2}>
              Basic Information
            </Typography>

            <Stack spacing={2}>
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Email
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {contact.email || '—'}
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  LinkedIn
                </Typography>
                <Typography
                  variant="body2"
                  fontWeight={500}
                  component="a"
                  href={contact.linkedin_url || '#'}
                  target="_blank"
                  rel="noreferrer"
                  sx={{ color: 'primary.main', textDecoration: 'none' }}
                >
                  {contact.linkedin_url ? 'View Profile' : '—'}
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Location
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {([contact.location_city, contact.location_country].filter(Boolean).join(', ') || '—')}
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Current Company
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {contact.current_company || '—'}
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Current Role
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {contact.current_role || '—'}
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Seniority Levels
                </Typography>
                <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap mt={0.5}>
                  {(contact.seniority_levels || []).map((level, index) => (
                    <Chip key={index} label={level} size="small" color="secondary" variant="outlined" />
                  ))}
                </Stack>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" fontWeight={600} mb={2}>
              Skills
            </Typography>

            <Stack spacing={2}>
              <Box>
                <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                  Hard Skills
                </Typography>
                <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                  {(contact.skills || []).map((skill, index) => (
                    <Chip key={index} label={skill} size="small" color="primary" />
                  ))}
                </Stack>
              </Box>

              <Divider />

              <Box>
                <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                  Soft Skills
                </Typography>
                {/* If you have separate soft skills they can be rendered here; using `skills` as fallback */}
                <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                  {(contact.skills || []).slice(0, 8).map((skill, index) => (
                    <Chip key={index} label={skill} size="small" color="secondary" />
                  ))}
                </Stack>
              </Box>

              <Divider />

              <Box>
                <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                  Keywords
                </Typography>
                {/* Keywords are not present on Contact type; render verticals as a proxy if available */}
                <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                  {(contact.verticals || []).map((kw, index) => (
                    <Chip key={index} label={kw} size="small" variant="outlined" />
                  ))}
                </Stack>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" fontWeight={600} mb={2}>
              Industries
            </Typography>

            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
              {(contact.industries || []).map((industry, index) => (
                <Chip
                  key={index}
                  label={industry}
                  size="small"
                  color="info"
                  sx={{ mb: 0.5 }}
                />
              ))}
            </Stack>
          </CardContent>
        </Card>

        {contact.contact_type === 'investor' && (contact.funding_stages || []).length > 0 && (
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>
                Funding Stages
              </Typography>

              <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                {(contact.funding_stages || []).map((stage, index) => (
                  <Chip
                    key={index}
                    label={stage}
                    size="small"
                    color="success"
                    sx={{ mb: 0.5 }}
                  />
                ))}
              </Stack>
            </CardContent>
          </Card>
        )}

        {/* company_size not available on Contact type - skip */}

        <Card variant="outlined" sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} mb={2}>
              Additional Information
            </Typography>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
                gap: 2,
              }}
            >
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Contact Type
                </Typography>
                <Chip
                  label={contact.contact_type}
                  size="small"
                  color={contact.contact_type === 'investor' ? 'primary' : 'secondary'}
                  sx={{ textTransform: 'capitalize', mt: 0.5 }}
                />
              </Box>

              {/* years_of_experience and education_level are not part of Contact type - omitted */}
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};
