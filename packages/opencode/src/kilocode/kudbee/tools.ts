import { getRelevantThinkTokens } from '../../../../../services/memory/vectorStore.ts';

export async function kudbee_recall_memories(input: string | { query: string }) {
  try {
    const query = typeof input === 'string' ? input : input?.query || '';
    const memories = await getRelevantThinkTokens(query);
    return memories;
  } catch (error) {
    console.error('Error recalling memories:', error);
    return [];
  }
}

