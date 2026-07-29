import { getRelevantThinkTokens } from '../../../../../services/memory/vectorStore.ts';

export async function kudbee_recall_memories(query: string) {
  try {
    const memories = await getRelevantThinkTokens(query);
    return memories;
  } catch (error) {
    console.error('Error recalling memories:', error);
    return [];
  }
}

