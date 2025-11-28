import { supabaseAdminClient } from '../lib/supabaseClient';

export interface AgentPrompt {
  id: string;
  agent_name: string;
  prompt_type: string;
  language: string;
  content: string;
  updated_at: string;
  updated_by?: string | null;
}

export interface PromptFilters {
  agent_name?: string;
  prompt_type?: string;
  language?: string;
}

export const promptsApi = {
  async list(filters: PromptFilters = {}): Promise<AgentPrompt[]> {
    let query = supabaseAdminClient
      .from('agent_prompts')
      .select('*')
      .order('updated_at', { ascending: false });

    if (filters.agent_name) {
      query = query.eq('agent_name', filters.agent_name);
    }
    if (filters.prompt_type) {
      query = query.eq('prompt_type', filters.prompt_type);
    }
    if (filters.language) {
      query = query.eq('language', filters.language);
    }

    const { data, error } = await query;
    if (error) {
      throw new Error(error.message || 'Failed to load prompts');
    }
    return (data ?? []) as AgentPrompt[];
  },

  async save(payload: {
    agent_name: string;
    prompt_type: string;
    language?: string;
    content: string;
    updated_by?: string;
  }): Promise<AgentPrompt> {
    const { data, error } = await supabaseAdminClient
      .from('agent_prompts')
      .upsert({
        agent_name: payload.agent_name,
        prompt_type: payload.prompt_type,
        language: payload.language || 'multi',
        content: payload.content,
        updated_by: payload.updated_by ?? null,
      }, { onConflict: 'agent_name,prompt_type,language' })
      .select()
      .single();

    if (error) {
      throw new Error(error.message || 'Failed to save prompt');
    }
    return data as AgentPrompt;
  },
};
