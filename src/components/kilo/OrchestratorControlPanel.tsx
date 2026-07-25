import React, { useState, useEffect } from 'react';
import { Cpu, Server, Database, RefreshCw, Plus, CheckCircle, AlertTriangle, Play, ShieldAlert, Zap } from 'lucide-react';

interface ContainerNode {
  id: string;
  pid: number;
  port: number;
  role: string;
  status: 'starting' | 'healthy' | 'unhealthy';
  heartbeatCount: number;
  lastHeartbeat: string;
}

interface DBCheck {
  checkName: string;
  status: string;
}

export const OrchestratorControlPanel: React.FC = () => {
  const [nodes, setNodes] = useState<ContainerNode[]>([]);
  const [selectedRole, setSelectedRole] = useState('Fast Telemetry Sidecar');
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [isSyncingSQLite, setIsSyncingSQLite] = useState(false);
  const [isSelfHealing, setIsSelfHealing] = useState(false);
  
  // Cache sync state
  const [syncStatus, setSyncStatus] = useState<{ status: 'idle' | 'success' | 'failed'; message: string; records?: number }>({ status: 'idle', message: '' });
  
  // Database health states
  const [dbHealthStatus, setDbHealthStatus] = useState<{ status: string; diagnostics: string; checks: DBCheck[] } | null>(null);

  // Poll active nodes
  const fetchNodes = async () => {
    try {
      const res = await fetch('/api/system/orchestrator/nodes');
      if (res.ok) {
        const data = await res.json();
        setNodes(data.nodes || []);
      }
    } catch (e) {
      console.error('Failed to fetch container nodes', e);
    }
  };

  useEffect(() => {
    fetchNodes();
    const interval = setInterval(fetchNodes, 5000);
    return () => clearInterval(interval);
  }, []);

  // Deploy an ephemeral background process
  const handleDeployNode = async () => {
    setIsProvisioning(true);
    try {
      const res = await fetch('/api/system/orchestrator/provision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: selectedRole })
      });
      if (res.ok) {
        await fetchNodes();
      }
    } catch (e) {
      console.error('Failed to provision node', e);
    } finally {
      setIsProvisioning(false);
    }
  };

  // Sync SQLite mobile cache
  const handleSyncSQLite = async () => {
    setIsSyncingSQLite(true);
    setSyncStatus({ status: 'idle', message: 'Initiating cryptographic socket handshake...' });
    try {
      const res = await fetch('/api/system/cache/sqlite-mirror', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setSyncStatus({ 
          status: 'success', 
          message: data.message || 'SQLite cache mirror synchronized successfully.',
          records: data.recordsSynced 
        });
      } else {
        setSyncStatus({ 
          status: 'failed', 
          message: data.error || 'Mirror synchronization failed.' 
        });
      }
    } catch (e: any) {
      setSyncStatus({ status: 'failed', message: `Sync exception: ${e.message}` });
    } finally {
      setIsSyncingSQLite(false);
    }
  };

  // Run Self-Healing Migrations check
  const handleRunSelfHeal = async () => {
    setIsSelfHealing(true);
    setDbHealthStatus(null);
    try {
      const res = await fetch('/api/system/database/self-heal', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setDbHealthStatus({
          status: data.status,
          diagnostics: data.diagnostics,
          checks: data.checks || []
        });
      }
    } catch (e: any) {
      console.error('Database self-heal failed', e);
    } finally {
      setIsSelfHealing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* 1. Micro-Server Container Provisioner & Heartbeat Nodes */}
      <div className="xl:col-span-2 bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-4 sm:p-5 flex flex-col justify-between backdrop-blur-md shadow-xl hover:border-yellow-500/10 transition-all">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/40 pb-3 mb-4">
            <div>
              <h3 className="text-xs font-bold text-zinc-100 flex items-center gap-1.5 font-mono uppercase tracking-wider">
                <Cpu className="w-4 h-4 text-cyan-400" /> Ephemeral Process Orchestrator (Stage 3)
              </h3>
              <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                Spin up sidecar processes inside the loopback sandbox environment and manage port ranges dynamically.
              </p>
            </div>

            {/* Deploy Trigger controls */}
            <div className="flex items-center gap-2 font-mono text-[10px]">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 text-zinc-300 rounded px-2.5 py-1 focus:outline-none focus:border-cyan-500"
              >
                <option value="Fast Telemetry Sidecar">Telemetry Sidecar</option>
                <option value="SSE Connection Pooler">SSE Pooler</option>
                <option value="SQLite Mobile Sync Node">SQLite Sync Node</option>
                <option value="Cognitive Guardrail Agent">Guardrail Agent</option>
              </select>

              <button
                onClick={handleDeployNode}
                disabled={isProvisioning}
                className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-zinc-100 font-bold px-3 py-1.5 rounded flex items-center gap-1 shadow-md transition-all active:scale-95 text-[10px]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Deploy</span>
              </button>
            </div>
          </div>

          {/* Active Nodes List */}
          <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
            {nodes.map(node => {
              const isStarting = node.status === 'starting';
              return (
                <div 
                  key={node.id} 
                  className="bg-black/40 border border-zinc-900/80 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-[11px] hover:border-cyan-500/10 transition-all"
                >
                  <div className="flex items-start gap-2.5">
                    <Server className={`w-4 h-4 mt-0.5 shrink-0 ${isStarting ? 'text-zinc-500 animate-spin' : 'text-cyan-400'}`} />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-zinc-200">{node.role}</span>
                        <span className="text-[8px] px-1.5 py-0.2 bg-zinc-800 text-zinc-400 rounded">PORT: {node.port}</span>
                      </div>
                      <div className="text-[9px] text-zinc-500 mt-0.5">
                        ID: <span className="text-zinc-400">{node.id}</span> | PID: <span className="text-zinc-400">{node.pid}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <div className="text-right flex flex-col items-start sm:items-end">
                      <span className="text-[8px] text-zinc-500 uppercase">HEARTBEATS REGISTERED</span>
                      <span className="font-bold text-cyan-400 animate-pulse">{node.heartbeatCount} ticks</span>
                    </div>

                    <div className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider shrink-0 ${
                      isStarting ? 'bg-zinc-800 text-zinc-400 animate-pulse' : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                    }`}>
                      {node.status}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="border-t border-zinc-800/40 pt-3 mt-4 flex items-center justify-between text-[9px] text-zinc-500 font-mono">
          <span>Active sidecar processes: {nodes.length}</span>
          <span>Port Range Allocation: 3005 - 3900 [Loopback Only]</span>
        </div>
      </div>

      {/* 2. Self-Healing SQL Migrations & SQLite Mobile Caching Core */}
      <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-4 sm:p-5 flex flex-col justify-between backdrop-blur-md shadow-xl hover:border-yellow-500/10 transition-all">
        <div className="space-y-4">
          <div>
            <h3 className="text-xs font-bold text-zinc-100 flex items-center gap-1.5 font-mono uppercase tracking-wider">
              <Database className="w-4 h-4 text-emerald-400" /> Database Resilience (Stage 3)
            </h3>
            <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
              Verify database structural integrity, run self-healing SQL migrations, and sync volatile memory caches.
            </p>
          </div>

          {/* Buttons Controls */}
          <div className="grid grid-cols-2 gap-2.5 font-mono">
            <button
              onClick={handleSyncSQLite}
              disabled={isSyncingSQLite}
              className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-850 disabled:opacity-50 text-zinc-300 font-bold py-2 rounded text-[10px] flex flex-col items-center justify-center gap-1 shadow-md transition-all active:scale-95"
            >
              <RefreshCw className={`w-4 h-4 text-zinc-400 ${isSyncingSQLite ? 'animate-spin' : ''}`} />
              <span>SQLite Cache Sync</span>
            </button>

            <button
              onClick={handleRunSelfHeal}
              disabled={isSelfHealing}
              className="bg-emerald-950/20 border border-emerald-800/30 hover:border-emerald-700/40 hover:bg-emerald-900/10 disabled:opacity-50 text-emerald-400 font-bold py-2 rounded text-[10px] flex flex-col items-center justify-center gap-1 shadow-md transition-all active:scale-95"
            >
              <Zap className={`w-4 h-4 text-emerald-400 ${isSelfHealing ? 'animate-pulse' : ''}`} />
              <span>Self-Heal DB</span>
            </button>
          </div>

          {/* Output Display area */}
          {syncStatus.status !== 'idle' && (
            <div className={`p-2.5 rounded-lg border font-mono text-[9px] leading-relaxed ${
              syncStatus.status === 'success' 
                ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400' 
                : 'bg-red-500/5 border-red-500/10 text-red-400'
            }`}>
              <div className="font-bold uppercase text-[8px] pb-0.5 border-b border-white/5 mb-1 flex items-center justify-between">
                <span>SQLITE CACHE STATUS</span>
                {syncStatus.records && <span className="bg-emerald-500/10 px-1 py-0.2 rounded">Synced {syncStatus.records} items</span>}
              </div>
              <p>{syncStatus.message}</p>
            </div>
          )}

          {dbHealthStatus && (
            <div className="bg-black/40 border border-zinc-900 p-2.5 rounded-lg font-mono text-[9px] space-y-2">
              <div className="flex items-center justify-between border-b border-zinc-850 pb-1 mb-1 text-[8px] font-bold">
                <span>SELF-HEALING REPORT</span>
                <span className={`px-1.5 py-0.2 rounded ${
                  dbHealthStatus.status === 'healed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                }`}>
                  {dbHealthStatus.status.toUpperCase()}
                </span>
              </div>

              {/* Grid of checks */}
              <div className="space-y-1">
                {dbHealthStatus.checks.map((check, i) => (
                  <div key={i} className="flex items-center justify-between text-zinc-400">
                    <span>{check.checkName}:</span>
                    <span className={check.status === 'OK' || check.status === 'SUCCESS' ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                      {check.status}
                    </span>
                  </div>
                ))}
              </div>

              <p className="text-[8px] text-zinc-500 leading-normal pt-1 border-t border-zinc-900">
                {dbHealthStatus.diagnostics}
              </p>
            </div>
          )}
        </div>

        <div className="border-t border-zinc-800/40 pt-3 mt-4 flex items-center gap-1.5 text-[9px] text-zinc-500 font-mono">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span>Local SQLite schema matching & columns validated.</span>
        </div>
      </div>
    </div>
  );
};
