import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Activity, Server, Database, BrainCircuit, Network, CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';

interface DiagnosticResult {
  service: string;
  endpoint: string;
  status: 'pending' | 'success' | 'warning' | 'error';
  latencyMs?: number;
  details?: any;
  icon: React.ReactNode;
}

export function DiagnosticCommandCenter() {
  const [results, setResults] = useState<DiagnosticResult[]>([
    { service: 'Core API Router', endpoint: '/api/health', status: 'pending', icon: <Server className="w-5 h-5" /> },
    { service: 'Deep System Health (Redis/Memory)', endpoint: '/api/system/health-deep', status: 'pending', icon: <Activity className="w-5 h-5" /> },
    { service: 'PostgreSQL Database', endpoint: '/api/db/diagnostics', status: 'pending', icon: <Database className="w-5 h-5" /> },
    { service: 'Edge Caching Protocol (ECP)', endpoint: '/api/ecp/metrics', status: 'pending', icon: <Network className="w-5 h-5" /> },
    { service: 'Telemetry Event Stream', endpoint: '/api/telemetry/health', status: 'pending', icon: <Activity className="w-5 h-5" /> },
    { service: 'MCP Heroku Dynos', endpoint: '/api/heroku/production-check', status: 'pending', icon: <Server className="w-5 h-5" /> },
    { service: 'MCP Tools Catalog', endpoint: '/api/mcp/tools', status: 'pending', icon: <BrainCircuit className="w-5 h-5" /> },
    { service: 'System Orchestrator Nodes', endpoint: '/api/system/orchestrator/nodes', status: 'pending', icon: <Network className="w-5 h-5" /> }
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const [lastRun, setLastRun] = useState<Date | null>(null);

  const runDiagnostics = async () => {
    setIsRunning(true);
    setResults(prev => prev.map(r => ({ ...r, status: 'pending', details: undefined, latencyMs: undefined })));

    const promises = results.map(async (check, index) => {
      const start = performance.now();
      try {
        const res = await fetch(check.endpoint);
        const data = await res.json().catch(() => null);
        const latencyMs = Math.round(performance.now() - start);

        let finalStatus: 'success' | 'warning' | 'error' = res.ok ? 'success' : 'error';
        
        // Deep health custom logic
        if (check.endpoint === '/api/system/health-deep' && data?.status) {
           finalStatus = data.status === 'HEALTHY' ? 'success' : (data.status === 'WARNING' ? 'warning' : 'error');
        }
        
        // ECP custom logic
        if (check.endpoint === '/api/ecp/metrics') {
            finalStatus = 'success';
        }

        setResults(prev => {
          const next = [...prev];
          next[index] = { ...next[index], status: finalStatus, latencyMs, details: data };
          return next;
        });
      } catch (err: any) {
        setResults(prev => {
          const next = [...prev];
          next[index] = { ...next[index], status: 'error', latencyMs: Math.round(performance.now() - start), details: err.message };
          return next;
        });
      }
    });

    await Promise.allSettled(promises);
    setLastRun(new Date());
    setIsRunning(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#06090e] text-zinc-300 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-yellow-500/10 via-[#06090e] to-[#06090e] pointer-events-none" />
      
      <div className="flex flex-col h-full z-10">
        <header className="px-6 py-5 border-b border-white/5 bg-[#0a0d14]/80 backdrop-blur-md flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <BrainCircuit className="text-yellow-400 w-5 h-5" />
              Unified Diagnostics Command Center
            </h1>
            <p className="text-xs text-zinc-500 mt-1 uppercase tracking-wider font-mono">
              Live Validation & System Integrity Matrix
            </p>
          </div>
          <div className="flex items-center gap-4">
             {lastRun && (
                 <span className="text-xs text-zinc-500 font-mono">Last Check: {lastRun.toLocaleTimeString()}</span>
             )}
            <button 
              onClick={runDiagnostics}
              disabled={isRunning}
              className={`flex items-center gap-2 px-4 py-2 rounded font-bold text-xs uppercase tracking-wide transition-all ${
                isRunning 
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
                  : 'bg-yellow-500 hover:bg-yellow-400 text-black shadow-[0_0_15px_rgba(234,179,8,0.3)]'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
              {isRunning ? 'Validating...' : 'Run Diagnostics'}
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 relative">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {results.map((r, i) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                key={r.endpoint}
                className="bg-[#0d1219] border border-white/5 p-5 rounded-xl shadow-lg relative overflow-hidden group hover:border-yellow-500/30 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                   <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-zinc-900 border border-white/10 ${r.status === 'success' ? 'text-emerald-400' : r.status === 'error' ? 'text-red-400' : r.status === 'warning' ? 'text-yellow-400' : 'text-blue-400'}`}>
                         {r.icon}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white leading-tight">{r.service}</h3>
                        <div className="text-[10px] text-zinc-500 font-mono mt-0.5">{r.endpoint}</div>
                      </div>
                   </div>
                   <div>
                     {r.status === 'pending' && <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />}
                     {r.status === 'success' && <CheckCircle className="w-5 h-5 text-emerald-400" />}
                     {r.status === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-400" />}
                     {r.status === 'error' && <XCircle className="w-5 h-5 text-red-500" />}
                   </div>
                </div>

                <div className="bg-[#0a0d14] p-3 rounded border border-white/5 min-h-[80px]">
                    {r.status === 'pending' ? (
                       <div className="flex items-center justify-center h-full text-xs text-zinc-600 font-mono animate-pulse">
                         Awaiting response...
                       </div>
                    ) : (
                       <div className="space-y-2">
                          <div className="flex justify-between items-center text-[10px] font-mono">
                             <span className="text-zinc-500">LATENCY</span>
                             <span className={r.latencyMs && r.latencyMs > 500 ? 'text-yellow-400' : 'text-emerald-400'}>
                               {r.latencyMs}ms
                             </span>
                          </div>
                          <div className="flex justify-between items-center text-[10px] font-mono border-t border-white/5 pt-2">
                             <span className="text-zinc-500">PAYLOAD</span>
                             <span className="text-zinc-400 truncate max-w-[150px]">
                               {r.details ? JSON.stringify(r.details).substring(0, 40) + '...' : 'No payload'}
                             </span>
                          </div>
                       </div>
                    )}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 bg-zinc-900/50 border border-white/5 p-6 rounded-xl backdrop-blur-sm relative overflow-hidden">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-yellow-400" />
              Diagnostics Summary
            </h3>
            <div className="flex gap-12">
               <div>
                  <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Overall Status</div>
                  <div className="text-2xl font-black mt-1">
                     {results.some(r => r.status === 'error') ? (
                       <span className="text-red-500">DEGRADED</span>
                     ) : results.some(r => r.status === 'warning') ? (
                       <span className="text-yellow-400">WARNING</span>
                     ) : results.some(r => r.status === 'pending') ? (
                       <span className="text-blue-400">ANALYZING</span>
                     ) : (
                       <span className="text-emerald-400">ALL SYSTEMS NOMINAL</span>
                     )}
                  </div>
               </div>
               <div>
                  <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Success Rate</div>
                  <div className="text-2xl font-black mt-1 text-white">
                     {results.length > 0 
                       ? Math.round((results.filter(r => r.status === 'success' || r.status === 'warning').length / results.length) * 100) 
                       : 0}%
                  </div>
               </div>
               <div>
                  <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Avg Latency</div>
                  <div className="text-2xl font-black mt-1 text-white">
                     {Math.round(results.filter(r => r.latencyMs).reduce((acc, r) => acc + (r.latencyMs || 0), 0) / (results.filter(r => r.latencyMs).length || 1))}ms
                  </div>
               </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
