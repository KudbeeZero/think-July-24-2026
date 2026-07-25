import React, { useState } from 'react';
import { Settings, Shield, Key, Database, Cpu, CheckCircle2, RefreshCw } from 'lucide-react';

export function SettingsView() {
  const [redisUrlSanitization, setRedisUrlSanitization] = useState(true);
  const [rateLimitFallback, setRateLimitFallback] = useState(true);
  const [contextWindowLimit, setContextWindowLimit] = useState('250k');
  const [modelName, setModelName] = useState('DeepSeek V4 Pro');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="pb-4 border-b border-zinc-800">
        <h2 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
          <Settings className="w-5 h-5 text-yellow-500" /> System Settings & Infrastructure Config
        </h2>
        <p className="text-xs text-zinc-400 mt-1">
          Configure worker pool resilience, Redis URL sanitizers, and token limits
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Environment Settings */}
        <div className="bg-[#161b22] border border-zinc-800/80 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
            <Database className="w-4 h-4 text-purple-400" /> Redis & Worker Resilience
          </h3>

          <label className="flex items-center justify-between p-3 sm:p-4 bg-[#0d1117] rounded-lg border border-zinc-800 cursor-pointer active:bg-zinc-800/50 transition-colors">
            <div className="pr-4">
              <div className="text-xs sm:text-sm font-semibold text-zinc-200">REDIS_URL Sanitization (https:// → rediss://)</div>
              <div className="text-[11px] sm:text-xs text-zinc-500 mt-0.5">Automatically fixes Heroku/Upstash protocol prefixes at runtime</div>
            </div>
            <div className="relative flex items-center justify-center shrink-0 w-10 h-10">
              <input
                type="checkbox"
                checked={redisUrlSanitization}
                onChange={(e) => setRedisUrlSanitization(e.target.checked)}
                className="w-5 h-5 accent-yellow-500 rounded cursor-pointer"
              />
            </div>
          </label>

          <label className="flex items-center justify-between p-3 sm:p-4 bg-[#0d1117] rounded-lg border border-zinc-800 cursor-pointer active:bg-zinc-800/50 transition-colors">
            <div className="pr-4">
              <div className="text-xs sm:text-sm font-semibold text-zinc-200">Fail-Open In-Memory Rate Limiting Fallback</div>
              <div className="text-[11px] sm:text-xs text-zinc-500 mt-0.5">Bypasses 500k Upstash max request cap errors to prevent frontend black screens</div>
            </div>
            <div className="relative flex items-center justify-center shrink-0 w-10 h-10">
              <input
                type="checkbox"
                checked={rateLimitFallback}
                onChange={(e) => setRateLimitFallback(e.target.checked)}
                className="w-5 h-5 accent-yellow-500 rounded cursor-pointer"
              />
            </div>
          </label>
        </div>

        {/* Model & Agent Specs */}
        <div className="bg-[#161b22] border border-zinc-800/80 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-blue-400" /> Agent Gateway & Model Context
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">
                Active Inference Model
              </label>
              <select
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                className="w-full bg-[#0d1117] border border-zinc-700/60 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none"
              >
                <option value="DeepSeek V4 Pro">DeepSeek V4 Pro (1M Context)</option>
                <option value="Gemini 2.5 Flash">Gemini 2.5 Flash</option>
                <option value="Claude 3.7 Sonnet">Claude 3.7 Sonnet</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">
                Context Window Throttle
              </label>
              <select
                value={contextWindowLimit}
                onChange={(e) => setContextWindowLimit(e.target.value)}
                className="w-full bg-[#0d1117] border border-zinc-700/60 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none"
              >
                <option value="250k">250,000 Tokens (Standard Free Tier)</option>
                <option value="500k">500,000 Tokens</option>
                <option value="1M">1,000,000 Tokens (Pro Context)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
          {saved && (
            <span className="text-xs text-green-400 flex items-center gap-1.5 font-medium animate-fadeIn">
              <CheckCircle2 className="w-4 h-4" /> Settings Saved!
            </span>
          )}
          <button
            type="submit"
            className="px-5 py-2 rounded-lg bg-[#e5ff55] hover:bg-[#d4ed44] text-zinc-950 font-semibold text-xs transition-colors shadow-sm"
          >
            Save Infrastructure Configuration
          </button>
        </div>
      </form>
    </div>
  );
}
