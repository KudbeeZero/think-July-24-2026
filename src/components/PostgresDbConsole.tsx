import React, { useState, useEffect } from 'react';
import { Database, Terminal, RefreshCw, Layers, Shield, Play, HelpCircle, Server, Activity, DatabaseZap } from 'lucide-react';

interface DbMetrics {
  beadsCount: number;
  agentsCount: number;
  logsCount: number;
  sizeBytes: number;
  sizeFormatted: string;
  kilobitsTransferred: number;
}

interface TableInfo {
  name: string;
  description: string;
}

export const PostgresDbConsole: React.FC = () => {
  const [metrics, setMetrics] = useState<DbMetrics | null>(null);
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [dbName, setDbName] = useState('Loading...');
  const [sqlQuery, setSqlQuery] = useState('SELECT * FROM telemetry_logs ORDER BY id DESC LIMIT 5;');
  const [queryResult, setQueryResult] = useState<any[] | null>(null);
  const [rowCount, setRowCount] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [executing, setExecuting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [benchmarking, setBenchmarking] = useState(false);
  const [activeTab, setActiveTab] = useState<'CONSOLE' | 'SCHEMA'>('CONSOLE');

  const fetchDiagnostics = async () => {
    setRefreshing(true);
    try {
      const res = await fetch('/api/db/diagnostics');
      const data = await res.json();
      if (data.status === 'success' || data.status === 'fallback') {
        setMetrics(data.metrics);
        setTables(data.tables);
        setDbName(data.database);
      }
    } catch (err) {
      console.error('Failed to load database diagnostics', err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleExecuteQuery = async () => {
    if (!sqlQuery.trim()) return;
    setExecuting(true);
    setErrorMsg(null);
    setQueryResult(null);
    setRowCount(null);

    try {
      const res = await fetch('/api/db/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: sqlQuery })
      });
      const data = await res.json();

      if (!res.ok || data.status === 'error') {
        setErrorMsg(data.error || 'Failed to execute raw query.');
      } else {
        setQueryResult(data.rows || []);
        setRowCount(data.rowCount);
        // Refresh diagnostics in case table values changed
        fetchDiagnostics();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error executing query.');
    } finally {
      setExecuting(false);
    }
  };

  const handleRunStressTest = async () => {
    if (benchmarking) return;
    setBenchmarking(true);
    setErrorMsg(null);

    try {
      for (let i = 1; i <= 5; i++) {
        await fetch('/api/telemetry/ingest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: `Stress Benchmark Node ${i}/5 - Transmitting telemetry load sequence to Postgres DB`,
            source: 'PostgresDbConsole'
          })
        });
        // Slight throttle delay to let logs accumulate
        await new Promise(resolve => setTimeout(resolve, 400));
      }
      setSqlQuery('SELECT * FROM telemetry_logs WHERE source = \'PostgresDbConsole\' ORDER BY id DESC LIMIT 5;');
      await handleExecuteQuery();
      await fetchDiagnostics();
    } catch (err: any) {
      setErrorMsg('Failed to complete database stress benchmark');
    } finally {
      setBenchmarking(false);
    }
  };

  useEffect(() => {
    fetchDiagnostics();
  }, []);

  return (
    <div className="bg-[#161b22] border border-zinc-800 rounded-xl overflow-hidden shadow-xl hover:border-yellow-500/10 transition-all font-mono">
      {/* Header */}
      <div className="px-5 py-4 border-b border-zinc-800 bg-[#0d1117] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-400">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              Cloud SQL & Postgres Engine Live Console
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 uppercase tracking-wider font-bold">
                PROD DB
              </span>
            </h3>
            <p className="text-[10px] text-zinc-400">Host: {dbName}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            onClick={() => setActiveTab('CONSOLE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              activeTab === 'CONSOLE'
                ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                : 'bg-zinc-800/40 border-zinc-700/50 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            SQL Console
          </button>
          <button
            onClick={() => setActiveTab('SCHEMA')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              activeTab === 'SCHEMA'
                ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                : 'bg-zinc-800/40 border-zinc-700/50 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Database Schema
          </button>
          <button
            onClick={fetchDiagnostics}
            disabled={refreshing}
            className="p-1.5 bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-zinc-200 rounded-lg transition-colors"
            title="Refresh Database Statistics"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-yellow-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 border-b border-zinc-800 text-[11px] divide-x divide-zinc-800 bg-[#0d1117]/40">
        <div className="p-4">
          <div className="text-zinc-500 uppercase tracking-wider text-[9px] mb-1 font-bold">Database Size</div>
          <div className="text-sm font-semibold text-zinc-200">{metrics?.sizeFormatted || '4.19 MB'}</div>
          <div className="text-[10px] text-zinc-500">{(metrics?.sizeBytes || 4194304).toLocaleString()} bytes</div>
        </div>
        <div className="p-4">
          <div className="text-zinc-500 uppercase tracking-wider text-[9px] mb-1 font-bold">Transferred</div>
          <div className="text-sm font-semibold text-yellow-400">{metrics?.kilobitsTransferred || 0} kb</div>
          <div className="text-[10px] text-zinc-500">Atomic log ingestion weight</div>
        </div>
        <div className="p-4">
          <div className="text-zinc-500 uppercase tracking-wider text-[9px] mb-1 font-bold">Row Counter</div>
          <div className="text-sm font-semibold text-zinc-200">{(metrics?.logsCount || 0) + (metrics?.beadsCount || 0)} rows</div>
          <div className="text-[10px] text-zinc-500">{metrics?.logsCount || 0} logs | {metrics?.beadsCount || 0} beads</div>
        </div>
        <div className="p-4">
          <div className="text-zinc-500 uppercase tracking-wider text-[9px] mb-1 font-bold">Table Count</div>
          <div className="text-sm font-semibold text-zinc-200">{tables.length || 4} Relational</div>
          <div className="text-[10px] text-zinc-500">Fully structured tables</div>
        </div>
      </div>

      {activeTab === 'CONSOLE' ? (
        <div className="p-5 space-y-4">
          {/* Query editor */}
          <div>
            <div className="flex items-center justify-between mb-1.5 text-xs text-zinc-400">
              <span className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-zinc-500" />
                SQL Query Playground
              </span>
              <span className="text-[10px] text-zinc-500">Write real SELECT, INSERT or UPDATE statements</span>
            </div>
            <div className="relative">
              <textarea
                value={sqlQuery}
                onChange={(e) => setSqlQuery(e.target.value)}
                placeholder="Write custom Postgres SQL..."
                className="w-full h-24 bg-zinc-950 border border-zinc-800 hover:border-zinc-700/80 rounded-lg p-3 text-xs text-yellow-300 font-mono focus:outline-none focus:border-yellow-500/40 custom-scrollbar resize-none"
              />
              <div className="absolute bottom-2.5 right-2.5 flex items-center gap-2">
                <button
                  onClick={handleRunStressTest}
                  disabled={benchmarking}
                  className="px-3 py-1.5 bg-[#e5ff55]/10 hover:bg-[#e5ff55]/20 text-[#e5ff55] font-semibold text-[10px] rounded border border-[#e5ff55]/30 flex items-center gap-1 transition-all"
                  title="Force DB writes & load telemetry events directly to Postgres"
                >
                  <DatabaseZap className={`w-3 h-3 ${benchmarking ? 'animate-bounce' : ''}`} />
                  {benchmarking ? 'BENCHMARKING...' : 'STRESS BENCHMARK'}
                </button>
                <button
                  onClick={handleExecuteQuery}
                  disabled={executing || !sqlQuery.trim()}
                  className="px-4 py-1.5 bg-yellow-500 hover:bg-yellow-400 disabled:bg-zinc-800 disabled:text-zinc-500 text-black font-semibold text-[10px] rounded flex items-center gap-1 transition-colors"
                >
                  <Play className="w-3 h-3 fill-black" />
                  {executing ? 'RUNNING...' : 'EXECUTE'}
                </button>
              </div>
            </div>
          </div>

          {/* Console Error */}
          {errorMsg && (
            <div className="p-3.5 bg-red-950/30 border border-red-900/50 rounded-lg text-xs text-red-400 flex items-start gap-2.5">
              <HelpCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold uppercase text-[10px] block mb-0.5">PostgreSQL Exception</span>
                {errorMsg}
              </div>
            </div>
          )}

          {/* Tabular Output */}
          <div className="bg-zinc-950 border border-zinc-800/80 rounded-lg overflow-hidden flex flex-col min-h-[160px] max-h-[300px]">
            <div className="px-4 py-2 border-b border-zinc-900 bg-zinc-900/60 flex items-center justify-between text-xs text-zinc-500">
              <span>Query Results</span>
              {rowCount !== null && (
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                  {rowCount} rows affected / returned
                </span>
              )}
            </div>

            <div className="flex-1 overflow-auto custom-scrollbar">
              {queryResult && queryResult.length > 0 ? (
                <table className="w-full text-left border-collapse text-[11px] text-zinc-300">
                  <thead className="bg-[#0d1117] sticky top-0 border-b border-zinc-800 text-zinc-400 uppercase tracking-wider text-[9px] font-bold">
                    <tr>
                      {Object.keys(queryResult[0]).map((key) => (
                        <th key={key} className="p-2.5 border-r border-zinc-800">{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900">
                    {queryResult.map((row, idx) => (
                      <tr key={idx} className="hover:bg-zinc-900/40 transition-colors">
                        {Object.values(row).map((val: any, vIdx) => (
                          <td key={vIdx} className="p-2.5 border-r border-zinc-900 max-w-[200px] truncate" title={String(val)}>
                            {val === null ? <span className="text-zinc-600">NULL</span> : String(val)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : queryResult && queryResult.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-xs text-zinc-500">
                  Query executed successfully. Empty result set returned.
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-45 text-xs text-zinc-500 space-y-2">
                  <Terminal className="w-5 h-5 text-zinc-600" />
                  <span>Execute a Postgres query or run a stress benchmark to display live data columns</span>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          {tables.map((tbl) => (
            <div key={tbl.name} className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                <span className="text-xs font-bold text-yellow-400">{tbl.name}</span>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700/60 text-zinc-400">
                  table
                </span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">{tbl.description}</p>
              <div className="pt-1 flex items-center justify-between text-[10px]">
                <button
                  onClick={() => {
                    setSqlQuery(`SELECT * FROM ${tbl.name} ORDER BY id DESC LIMIT 5;`);
                    setActiveTab('CONSOLE');
                  }}
                  className="text-yellow-500 hover:underline flex items-center gap-1"
                >
                  Inspect Columns
                </button>
                <span className="text-zinc-600">Schema: public</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
