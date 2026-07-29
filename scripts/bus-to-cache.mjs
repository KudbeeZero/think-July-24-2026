export function handleBusEvent(topic, payload) {
  const flushRules = {
    'system:health': ['agent-state', 'dashboard'],
    'system:interrupt': ['agent-state', 'dashboard', 'decisions-recent'],
    'agent:decide': ['decisions-recent'],
    'agent:recall': ['agent-memories'],
    'agent:voicemail': ['agent-state', 'agent-memories'],
    'agent:voicemail:replayed': ['agent-state', 'agent-memories'],
    'session:end': ['*']
  };
  
  const cachesToFlush = flushRules[topic];
  if (cachesToFlush) {
    console.log(`[BusToCache] Flushed caches: ${cachesToFlush.join(', ')} due to event: ${topic}`);
    return cachesToFlush;
  }
  return [];
}
