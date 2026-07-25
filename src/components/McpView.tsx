import React, { useState, useEffect } from 'react';
import { Cpu, Server, Terminal, Shield, RefreshCw, CheckCircle2, AlertTriangle, Play, Database, Activity } from 'lucide-react';

export function McpView() {
  const [mcpTools, setMcpTools] = useState<any[]>([]);
  const [herokuCheck, setHerokuCheck] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedTool, setSelectedTool] = useState<string>('kudbee_inspect_memory');
  const [toolQuery, setToolQuery] = useState<string>('system architecture');
  const [executionResult, setExecutionResult] = useState<any>(null);

  const fetchMcpData = async () => {
    setLoading(true);
    try {
      const toolsRes = await fetch('/api/mcp/tools');
      const toolsData = await toolsRes.json();
      setMcpTools(toolsData.tools || []);

      const herokuRes = await fetch('/api/heroku/production-check');
      const herokuData = await herokuRes.json();
      setHerokuCheck(herokuData);
    } catch (err) {
      console.error("Failed to load MCP/Heroku data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMcpData();
  }, []);

  const handleExecuteTool = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/mcp/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool: selectedTool,
          arguments: { query: toolQuery, formation: 'web', quantity: 2, force: true },
          id: Date.now()
        })
      });
      const data = await res.json();
      setExecutionResult(data);
    } catch (err) {
      console.error("Tool execution failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto pb-28 lg:pb-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-zinc-900 via-[#131924] to-zinc-900 border border-zinc-800/80 rounded-xl p-4 sm:p-5 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl text-purple-400">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-zinc-100 flex items-center gap-2">
              Model Context Protocol (MCP) & Heroku Production Check
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              Inspect MCP server tools, execute remote RPC bindings, and monitor Heroku production logs (H12/R14).
            </p>
          </div>
        </div>
        <button
          onClick={fetchMcpData}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-lg border border-zinc-700 transition-colors w-full md:w-auto justify-center"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh State
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Model Context Protocol (MCP) Inspector */}
        <div className="bg-[#121720] border border-zinc-800 rounded-xl p-5 shadow-lg space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Server className="w-5 h-5 text-purple-400" />
                <h3 className="font-semibold text-zinc-100 text-sm sm:text-base">MCP Server & Tools</h3>
              </div>
              <span className="px-2.5 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-500/30 text-[11px] rounded-full font-mono">
                v1.0.4-sdk
              </span>
            </div>

            <p className="text-xs text-zinc-400">
              Connected to local/remote Model Context Protocol runtime. Select an exposed tool and run live JSON-RPC execution payloads.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Select MCP Tool</label>
                <select
                  value={selectedTool}
                  onChange={(e) => setSelectedTool(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-purple-500"
                >
                  {mcpTools.map((t) => (
                    <option key={t.name} value={t.name}>{t.name} — {t.description}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Tool Arguments / Query</label>
                <input
                  type="text"
                  value={toolQuery}
                  onChange={(e) => setToolQuery(e.target.value)}
                  placeholder="e.g., system architecture / vector memory"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              <button
                onClick={handleExecuteTool}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs rounded-lg transition-colors shadow-md"
              >
                <Play className="w-3.5 h-3.5" />
                Execute MCP RPC Call
              </button>
            </div>

            {executionResult && (
              <div className="mt-4 p-3 bg-zinc-950 border border-purple-500/30 rounded-lg font-mono text-[11px] text-purple-300 space-y-1">
                <div className="text-zinc-400 font-semibold text-[10px] uppercase">JSON-RPC Execution Result:</div>
                <pre className="overflow-x-auto whitespace-pre-wrap">{JSON.stringify(executionResult, null, 2)}</pre>
              </div>
            )}
          </div>
        </div>

        {/* Heroku Production Check Log Monitoring */}
        <div className="bg-[#121720] border border-zinc-800 rounded-xl p-5 shadow-lg space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-400" />
                <h3 className="font-semibold text-zinc-100 text-sm sm:text-base">Heroku Production Check</h3>
              </div>
              <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] rounded-full font-mono">
                {herokuCheck?.status || 'checking...'}
              </span>
            </div>

            <p className="text-xs text-zinc-400">
              Live log monitoring and health checks (H12 Request Timeouts, H10 Boot Errors, R14 Memory Quotas).
            </p>

            <div className="space-y-2.5">
              {herokuCheck?.checks?.map((check: any) => (
                <div key={check.id} className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-lg flex items-start gap-3">
                  {check.status === 'pass' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                  )}
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-zinc-200">{check.name}</span>
                      <span className={`text-[10px] uppercase font-mono px-1.5 py-0.5 rounded ${check.status === 'pass' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                        {check.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-0.5">{check.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {herokuCheck?.recentLogs && (
              <div className="space-y-1.5 pt-2 border-t border-zinc-800">
                <div className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider">Recent Dyno Log Stream:</div>
                <div className="bg-zinc-950 p-2.5 rounded-lg font-mono text-[10px] text-zinc-300 space-y-1 max-h-32 overflow-y-auto border border-zinc-800">
                  {herokuCheck.recentLogs.map((log: any, idx: number) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-zinc-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                      <span className="text-indigo-400 font-semibold">[{log.dyno}]</span>
                      <span className="text-zinc-300">{log.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
