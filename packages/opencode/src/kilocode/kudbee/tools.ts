import { getRelevantThinkTokens } from '../../../../../services/memory/vectorStore.ts';

export async function kudbee_recall_memories(query: string) {
  try {
    const relevantTokens = await getRelevantThinkTokens(query);
    return { memories: relevantTokens };
  } catch (error) {
    console.error('Error recalling memories:', error);
    return { memories: [] };
  }
}
