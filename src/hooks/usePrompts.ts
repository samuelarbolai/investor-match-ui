import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AgentPrompt, PromptFilters } from '../api/prompts.api';
import { promptsApi } from '../api/prompts.api';

export const PROMPTS_QUERY_KEY = 'agent-prompts';

export const usePrompts = (filters: PromptFilters = {}) => {
  return useQuery({
    queryKey: [PROMPTS_QUERY_KEY, filters],
    queryFn: () => promptsApi.list(filters),
    staleTime: 2 * 60 * 1000,
  });
};

export const useSavePrompt = (filters: PromptFilters = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: promptsApi.save,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROMPTS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [PROMPTS_QUERY_KEY, filters] });
    },
  });
};
