import React, { useState, useEffect } from 'react';
import { ShieldCheck, Download, Key, CheckCircle2, XCircle, ShieldAlert, Cpu, Hash, ExternalLink } from 'lucide-react';
import { AuditVaultPayload, AuditVaultAnchor } from '../types';
import { useEd25519Verify } from '../hooks/useEd25519Verify';

export const AuditVaultCard: React.FC = () => {
  const [payload, setPayload] = useState<AuditVaultPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedAnchor, setSelectedAnchor] = useState<AuditVaultAnchor | null>(null);
  const { verify, isVerified, status } = useEd25519Verify();

  const fetchAuditVault = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/audit/vault/export');
      const data: AuditVaultPayload = await res.json();
      setPayload(data);
      if (data.anchors && data.anchors.length > 0) {
        setSelectedAnchor(data.anchors[data.anchors.length - 1]);
      }
    } catch (err) {
      console.error('[AuditVaultCard] Fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditVault();
  }, []);

  const handleVerifyCurrentAnchor = async () => {
    if (!selectedAnchor) return;

    try {
      // Fetch system public key from server
      const keyRes = await fetch('/api/audit/public-key');
      const keyData = await keyRes.json();
      const pubKeyHex = keyData.publicKeyHex;

      const pubKey = new Uint8Array(Buffer.from(pubKeyHex, 'hex'));
      const msg = new TextEncoder().encode(selectedAnchor.hash);

      let sigBytes: Uint8Array;
      if (selectedAnchor.signature.startsWith('sig_mock') || selectedAnchor.signature === 'genesis_sig_000') {
        // Mock verification pass for demo genesis
        sigBytes = new Uint8Array(64);
      } else {
        sigBytes = new Uint8Array(Buffer.from(selectedAnchor.signature, 'hex'));
      }

      await verify(pubKey, sigBytes, msg);
    } catch (err) {
      console.error('[AuditVaultCard] Verification error:', err);
    }
  };

  return (
    <div className="bg-[#161b22] border border-zinc-800 rounded-xl p-5 shadow-xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-zinc-100">Spheroid BlockTrain Ledger</h3>
              {status === 'PROVEN' ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1 shadow-sm">
                  <CheckCircle2 className="w-3 h-3" /> PROVEN
                </span>
              ) : status === 'VERIFYING' ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 animate-pulse">
                  VERIFYING...
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-zinc-800 text-zinc-400 border border-zinc-700">
                  IDLE
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400 font-mono">Sentinel Ed25519 Provenance & Hash-Chain Audit</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchAuditVault}
            className="px-3 py-1.5 text-xs font-mono font-medium rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/60 transition-colors"
          >
            Re-sync Chain
          </button>
          <a
            href="/api/audit/vault/export"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 text-xs font-mono font-medium rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export Vault
          </a>
        </div>
      </div>

      {payload && (
        <div className="space-y-4">
          <div className="bg-[#0d1117] border border-zinc-800/80 rounded-lg p-3 font-mono text-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div className="flex items-center gap-2 text-zinc-300">
              <Hash className="w-4 h-4 text-emerald-400" />
              <span>X-Audit-Hash:</span>
              <span className="text-emerald-400 font-bold truncate max-w-xs sm:max-w-md">
                {payload.exportHeader['X-Audit-Hash']}
              </span>
            </div>
            <span className="text-[10px] text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">
              Version {payload.exportHeader.version}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Anchors List */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">
                Anchors ({payload.anchors.length})
              </h4>
              <div className="space-y-2 max-h-56 overflow-y-auto custom-scrollbar">
                {payload.anchors.map((anchor) => (
                  <div
                    key={anchor.id}
                    onClick={() => setSelectedAnchor(anchor)}
                    className={`p-3 rounded-lg border text-xs font-mono cursor-pointer transition-colors ${
                      selectedAnchor?.id === anchor.id
                        ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300'
                        : 'bg-[#0d1117] border-zinc-800 text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-zinc-100">{anchor.id}</span>
                      <span className="text-[10px] text-zinc-500">
                        {new Date(anchor.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-[10px] text-zinc-500 truncate font-mono">Hash: {anchor.hash}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Anchor Details & Verification */}
            {selectedAnchor && (
              <div className="bg-[#0d1117] border border-zinc-800 rounded-lg p-4 flex flex-col justify-between font-mono text-xs">
                <div>
                  <div className="flex items-center justify-between mb-2 pb-2 border-b border-zinc-800">
                    <span className="text-xs font-bold text-zinc-200">{selectedAnchor.id}</span>
                    <span className="text-[10px] text-zinc-400">
                      Cost: ${selectedAnchor.payload.spendUSD || 0.0001}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div>
                      <span className="text-[10px] text-zinc-500 block">SHA-256 Hash:</span>
                      <span className="text-[11px] text-emerald-400 break-all">{selectedAnchor.hash}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 block">Ed25519 Signature:</span>
                      <span className="text-[10px] text-zinc-400 break-all">
                        {selectedAnchor.signature.substring(0, 32)}...
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleVerifyCurrentAnchor}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <Key className="w-3.5 h-3.5" />
                  Verify Anchor Ed25519 Provenance
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
