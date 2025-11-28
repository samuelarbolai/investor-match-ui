import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import type { AgentPrompt } from '../api/prompts.api';
import { usePrompts, useSavePrompt } from '../hooks/usePrompts';

const AGENT_OPTIONS = [
  { label: 'Onboarding', value: 'onboarding' },
  { label: 'Conversation Parser', value: 'conversation_parser' },
  { label: 'Campaign Proposal / Feedback', value: 'campaign_proposal_feedback' },
  { label: 'Setter (coming soon)', value: 'setter' },
];

const DEFAULT_PROMPT_TYPE = 'system';
const DEFAULT_LANGUAGE = 'multi';

type TabValue = 'new' | 'stored';

interface PromptFormState {
  agent_name: string;
  content: string;
  updated_by: string;
}

const emptyForm: PromptFormState = {
  agent_name: '',
  content: '',
  updated_by: '',
};

export const PromptEditorPage = () => {
  const [agentFilter, setAgentFilter] = useState('');
  const [activeTab, setActiveTab] = useState<TabValue>('new');
  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(null);
  const [form, setForm] = useState<PromptFormState>({ ...emptyForm });

  const { data, isLoading, isError, error } = usePrompts({
    agent_name: agentFilter || undefined,
  });
  const saveMutation = useSavePrompt({ agent_name: agentFilter || undefined });

  const availableAgents = useMemo(
    () => AGENT_OPTIONS.map(option => option.value),
    []
  );

  const handleFormChange = (field: keyof PromptFormState, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSelectPrompt = (prompt: AgentPrompt) => {
    setSelectedPromptId(prompt.id);
    setForm({
      agent_name: prompt.agent_name,
      content: prompt.content,
      updated_by: prompt.updated_by ?? '',
    });
    setActiveTab('new');
  };

  const handleReset = () => {
    setSelectedPromptId(null);
    setForm({
      ...emptyForm,
      agent_name: agentFilter,
    });
    setActiveTab('new');
  };

  const handleSave = () => {
    const trimmedAgent = form.agent_name.trim();
    const trimmedContent = form.content.trim();
    const trimmedUpdatedBy = form.updated_by.trim();

    if (!trimmedAgent || !trimmedContent) return;

    saveMutation.mutate({
      agent_name: trimmedAgent,
      prompt_type: DEFAULT_PROMPT_TYPE,
      language: DEFAULT_LANGUAGE,
      content: trimmedContent,
      updated_by: trimmedUpdatedBy || undefined,
    }, {
      onSuccess: () => {
        setSelectedPromptId(null);
      },
    });
  };

  const isSaveDisabled =
    !form.agent_name.trim() ||
    !form.content.trim() ||
    saveMutation.isPending;

  return (
    <Box sx={{ width: '100%' }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ pb: 4 }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Prompt Editor
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={3}>
            Select an agent, review stored prompts, and update the system prompt the agent uses in Supabase.
          </Typography>

          <Stack spacing={2}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ letterSpacing: 1 }}>
              AGENT FILTER
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }}>
              <TextField
                select
                label="Select agent"
                value={agentFilter}
                placeholder="Pick an agent"
                fullWidth
                onChange={(event) => {
                  setAgentFilter(event.target.value);
                  setSelectedPromptId(null);
                }}
              >
                <MenuItem value="">All agents</MenuItem>
                {AGENT_OPTIONS.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
              <Button
                variant="text"
                onClick={() => {
                  setAgentFilter('');
                  setSelectedPromptId(null);
                }}
              >
                Clear filter
              </Button>
            </Stack>
          </Stack>
        </Box>

        <Box component="section" sx={{ width: '100%' }}>
          <Tabs
            value={activeTab}
            onChange={(_, tabValue) => setActiveTab(tabValue)}
            textColor="primary"
            indicatorColor="primary"
            sx={{ mb: 3 }}
          >
            <Tab value="new" label="New Prompt" />
            <Tab value="stored" label="Stored Prompts" />
          </Tabs>

          {activeTab === 'stored' && (
            <Card variant="outlined" sx={{ width: '100%' }}>
              <CardContent sx={{ p: { xs: 2, md: 4 } }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">Stored Prompts</Typography>
                  {isLoading && <CircularProgress size={24} />}
                </Stack>
                {isError && (
                  <Alert severity="error">
                    {error instanceof Error ? error.message : 'Failed to load prompts'}
                  </Alert>
                )}
                {!isLoading && data && (
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Agent</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Language</TableCell>
                        <TableCell width={220}>Updated</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.map(prompt => (
                        <TableRow
                          key={prompt.id}
                          hover
                          selected={selectedPromptId === prompt.id}
                          sx={{ cursor: 'pointer' }}
                          onClick={() => handleSelectPrompt(prompt)}
                        >
                          <TableCell>{prompt.agent_name}</TableCell>
                          <TableCell>{prompt.prompt_type}</TableCell>
                          <TableCell>{prompt.language}</TableCell>
                          <TableCell>{new Date(prompt.updated_at).toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                      {data.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} align="center">
                            No prompts found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === 'new' && (
            <Card variant="outlined" sx={{ width: '100%' }}>
              <CardContent sx={{ p: { xs: 2, md: 4 } }}>
                <Stack spacing={3} alignItems="stretch">
                  <Stack
                    direction={{ xs: 'column', lg: 'row' }}
                    spacing={2}
                    alignItems={{ xs: 'flex-start', lg: 'center' }}
                    justifyContent="space-between"
                    flexWrap="wrap"
                  >
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center" flexWrap="wrap">
                      <TextField
                        select
                        label="Agent"
                        placeholder="Pick an agent"
                        required
                        value={form.agent_name}
                        sx={{ minWidth: 240 }}
                        onChange={(event) => handleFormChange('agent_name', event.target.value)}
                      >
                        <MenuItem value="">Select an agent</MenuItem>
                        {availableAgents.map(value => (
                          <MenuItem key={value} value={value}>
                            {AGENT_OPTIONS.find(option => option.value === value)?.label ?? value}
                          </MenuItem>
                        ))}
                      </TextField>
                      <Button variant="outlined" onClick={handleReset}>
                        {selectedPromptId ? 'Editing Existing Prompt' : 'New Prompt'}
                      </Button>
                      <TextField
                        size="small"
                        label="Updated By"
                        placeholder="Name or initials"
                        value={form.updated_by}
                        onChange={(event) => handleFormChange('updated_by', event.target.value)}
                      />
                    </Stack>
                    <Button
                      variant="contained"
                      onClick={handleSave}
                      disabled={isSaveDisabled}
                      sx={{ minWidth: 200 }}
                    >
                      {saveMutation.isPending ? 'Saving…' : 'Save Prompt'}
                    </Button>
                  </Stack>
                  <TextField
                    placeholder="Write or paste the entire prompt here"
                    multiline
                    minRows={24}
                    value={form.content}
                    onChange={(event) => handleFormChange('content', event.target.value)}
                    fullWidth
                    sx={{
                      '& .MuiInputBase-root': { alignItems: 'flex-start' },
                      '& .MuiInputBase-inputMultiline': {
                        fontFamily: 'monospace',
                        fontSize: 14,
                        lineHeight: 1.7,
                      },
                    }}
                  />
                  {saveMutation.isError && (
                    <Alert severity="error">
                      {saveMutation.error instanceof Error ? saveMutation.error.message : 'Failed to save prompt'}
                    </Alert>
                  )}
                  {saveMutation.isSuccess && (
                    <Alert severity="success">Prompt saved successfully</Alert>
                  )}
                </Stack>
              </CardContent>
            </Card>
          )}
        </Box>
      </Container>
    </Box>
  );
};
