import React, { useState } from 'react';
import { CheckCircle2, Circle, Shield, Cpu, Server, Smartphone, Terminal, Activity, Database, GitMerge, RefreshCw } from 'lucide-react';

interface TrackerItem {
  id: number;
  title: string;
  category: 'Frontend & Mobile' | 'Backend & API' | 'AI & MCP' | 'Database & Redis';
  status: 'completed' | 'in_progress' | 'verified';
  description: string;
}

export function SystemTrackerView() {
  const [items, setItems] = useState<TrackerItem[]>([
    {
      id: 1,
      title: 'Mobile Header & Footer Polish (iPhone/Android/Tablet)',
      category: 'Frontend & Mobile',
      status: 'verified',
      description: 'Fluid responsive layout preventing title overlap with Think Token meter, optimized safe-area padding for mobile navigation.'
    },
    {
      id: 2,
      title: 'Rebrand Grok to Kudbee AI Assistant',
      category: 'AI & MCP',
      status: 'verified',
      description: 'Renamed all terminal drawers, assistant personas, and prompt injection endpoints from Grok to Kudbee AI.'
    },
    {
      id: 3,
      title: 'Model Context Protocol (MCP) Server & RPC',
      category: 'AI & MCP',
      status: 'verified',
      description: 'Exposed /api/mcp/tools and /api/mcp/execute for remote JSON-RPC agent tool calls and memory inspections.'
    },
    {
      id: 4,
      title: 'Heroku Production Check & Log Monitoring',
      category: 'Backend & API',
      status: 'verified',
      description: 'Integrated H12 timeout detection, H10 boot error checks, and R14 memory quota alerts at /api/heroku/production-check.'
    },
    {
      id: 5,
      title: 'Redis Backpressure & Connection Resilience',
      category: 'Database & Redis',
      status: 'verified',
      description: 'Added exponential backoff reconnection strategies, command timeouts, and rediss:// URL sanitization.'
    },
    {
      id: 6,
      title: 'Memory Vault & Semantic Recall Indexing',
      category: 'AI & MCP',
      status: 'verified',
      description: 'Vector similarity scoring, cosine recall, and persistent memory vault seed pipeline.'
    },
    {
      id: 7,
      title: 'Real-Time Telemetry Stream (SSE)',
      category: 'Backend & API',
      status: 'verified',
      description: 'EventSource streaming for live agent actions, telemetry polling, and fallbacks.'
    },
    {
      id: 8,
      title: 'Multi-Agent Fleet Supervisor (Mayor & Polecats)',
      category: 'Frontend & Mobile',
      status: 'verified',
      description: 'Active state monitoring, reasoning token tracking, and live task dispatch controls.'
    },
    {
      id: 9,
      title: 'Interactive Merge Queue & CI/CD Pipeline',
      category: 'Frontend & Mobile',
      status: 'verified',
      description: 'Pull request status simulation, test check validation, and merge execution flow.'
    },
    {
      id: 10,
      title: 'Full-Stack Express + Vite Orchestration',
      category: 'Backend & API',
      status: 'verified',
      description: 'Single-container Express server supporting API routes, Vite middleware, and robust error boundaries.'
    }
  ]);

  const toggleStatus = (id: number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const nextStatus = item.status === 'verified' ? 'completed' : 'verified';
        return { ...item, status: nextStatus };
      }
      return item;
    }));
  };

  const completedCount = items.filter(i => i.status === 'verified' || i.status === 'completed').length;

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto pb-28 lg:pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-zinc-900 via-[#131924] to-zinc-900 border border-zinc-800/80 rounded-xl p-4 sm:p-5 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-[#e5ff55]/10 border border-[#e5ff55]/30 rounded-xl text-[#e5ff55]">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-zinc-100 flex items-center gap-2">
              Kudbee 10-Point System Integration & Feature Tracker
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              Complete verification checklist tracking backend APIs, MCP protocols, mobile responsive UI polish, and Redis resilience.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-xs font-mono text-zinc-300">
            Progress: <span className="text-[#e5ff55] font-bold">{completedCount} / {items.length} Verified</span>
          </div>
        </div>
      </div>

      {/* Tracker List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => toggleStatus(item.id)}
            className="bg-[#121720] border border-zinc-800 hover:border-zinc-700 rounded-xl p-4 shadow-lg flex items-start gap-3.5 cursor-pointer transition-all group"
          >
            <div className="mt-0.5 shrink-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="space-y-1 flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-xs sm:text-sm font-semibold text-zinc-100 truncate">
                  <span className="text-zinc-500 font-mono mr-2">#{item.id}</span>
                  {item.title}
                </h3>
                <span className="px-2 py-0.5 bg-zinc-800 text-zinc-300 text-[10px] font-mono rounded border border-zinc-700/60 shrink-0">
                  {item.category}
                </span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
