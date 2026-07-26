import { useState, useEffect } from 'react';

const LATENCY_STATUSES = ['KUDBEE thinking...', 'KUDBEE flabbergasted...', 'KUDBEE recalibrating...', 'KUDBEE syncing core...'];

export function useAgentLatency(agentId: string, currentState: string, delayMs: number = 2000) {
  const [processingStatus, setProcessingStatus] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // When state changes, trigger processing delay
    setIsProcessing(true);
    
    let currentIndex = 0;
    const interval = setInterval(() => {
      setProcessingStatus(LATENCY_STATUSES[currentIndex % LATENCY_STATUSES.length]);
      currentIndex++;
    }, 400);

    const timeout = setTimeout(() => {
      setIsProcessing(false);
      setProcessingStatus(null);
      clearInterval(interval);
    }, delayMs);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [currentState, agentId]);

  return { processingStatus, isProcessing };
}
