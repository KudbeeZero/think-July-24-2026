export async function getRelevantThinkTokens(query: string): Promise<any[]> {
  // Mock pgvector search
  return [
    { id: '1', content: 'Token 1 for ' + query },
    { id: '2', content: 'Token 2 for ' + query }
  ];
}
