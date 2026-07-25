import React from 'react';
import { GitMerge, CheckCircle2, Clock, GitPullRequest, AlertCircle, Shield, Check } from 'lucide-react';

export function MergeQueueView() {
  const prList = [
    {
      id: 'pr-182',
      title: 'feat: Deprecate REDIS_RATE_LIMIT_URL & implement in-memory fallback',
      author: 'Toast',
      branch: 'convoy/phase-11-blockers-and-ui-hotfixes',
      status: 'In Refinery Review',
      checks: '22/22 Green',
      time: '12 mins ago',
    },
    {
      id: 'pr-181',
      title: 'feat: Kudbee Memory Seeding & MCP Integration Pipeline',
      author: 'Toast',
      branch: 'feat/kudbee-memory-seeding-and-mcp',
      status: 'Merged',
      checks: '21/21 Green',
      time: '1 hour ago',
    },
    {
      id: 'pr-179',
      title: 'fix: Upstash 500k Max Requests Exceeded exponential backoff',
      author: 'refinery',
      branch: 'fix/worker-redis-backoff',
      status: 'Merged',
      checks: '18/18 Green',
      time: '3 hours ago',
    },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto pb-28 lg:pb-8">
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
        <div>
          <h2 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
            <GitMerge className="w-5 h-5 text-purple-400" /> Automated Merge Queue
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Automated verification pipeline managed by Refinery agent before land on main
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/30">
            Refinery Engine Active
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {prList.map((pr) => (
          <div
            key={pr.id}
            className="bg-[#161b22] border border-zinc-800/80 rounded-xl p-5 hover:border-zinc-700 transition-colors"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-purple-400">{pr.id}</span>
                  <h3 className="text-sm font-semibold text-zinc-200">{pr.title}</h3>
                </div>
                <div className="flex items-center gap-3 text-xs text-zinc-500">
                  <span>
                    by <strong className="text-zinc-400">{pr.author}</strong>
                  </span>
                  <span>•</span>
                  <span className="font-mono text-zinc-400">{pr.branch}</span>
                  <span>•</span>
                  <span>{pr.time}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {pr.checks}
                </span>
                <span
                  className={`px-3 py-1 rounded-md text-xs font-semibold ${
                    pr.status === 'Merged'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 animate-pulse'
                  }`}
                >
                  {pr.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
