import { useState, useCallback } from 'react';
import * as ed from '@noble/ed25519';
import { Ed25519VerifyHook } from '../types';

export function useEd25519Verify(): Ed25519VerifyHook {
  const [status, setStatus] = useState<'IDLE' | 'VERIFYING' | 'PROVEN' | 'FAILED'>('IDLE');
  const [isVerified, setIsVerified] = useState(false);

  const verify = useCallback(
    async (publicKey: Uint8Array, signature: Uint8Array, message: Uint8Array): Promise<boolean> => {
      setStatus('VERIFYING');
      try {
        const result = await ed.verifyAsync(signature, message, publicKey);
        if (result) {
          setIsVerified(true);
          setStatus('PROVEN');
          return true;
        } else {
          setIsVerified(false);
          setStatus('FAILED');
          return false;
        }
      } catch (err) {
        console.error('[useEd25519Verify] Verification failed:', err);
        setIsVerified(false);
        setStatus('FAILED');
        return false;
      }
    },
    []
  );

  return { verify, isVerified, status };
}
