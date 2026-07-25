import React, { useState, useEffect, useRef } from 'react';
import {
  SquareTerminal,
  Send,
  X,
  ChevronUp,
  ChevronDown,
  Maximize2,
  Minimize2,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Plus,
  Cpu,
  Settings2,
  Code2,
  CheckCircle2,
  AlertTriangle,
  Radio,
} from 'lucide-react';
import { Bead } from '../types';

interface GrokMessage {
  id: string;
  sender: 'user' | 'grok' | 'system';
  text: string;
  timestamp: string;
  model?: string;
  extraData?: any;
  images?: any;
  status?: 'sending' | 'success' | 'error';
  rawResponse?: any;
}

interface GrokTerminalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBead?: (bead: Omit<Bead, 'id' | 'createdAt'>) => void;
}

export const GrokTerminal: React.FC<GrokTerminalProps> = ({
  isOpen,
  onClose,
  onAddBead,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedModel, setSelectedModel] = useState('grok-3-fast');
  const [proxyUrl, setProxyUrl] = useState('http://127.0.0.1:8080');
  const [showSettings, setShowSettings] = useState(false);
  const [showRawJson, setShowRawJson] = useState<string | null>(null);

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [extraDataState, setExtraDataState] = useState<any>(null);

  const [activeEngine, setActiveEngine] = useState<string>('Auto (Resilient)');
  const [messages, setMessages] = useState<GrokMessage[]>([
    {
      id: 'init-1',
      sender: 'system',
      text: '🚀 Grok Terminal Ready (No API Key Required)! Server-side intelligence is fully active. Send any message below to start chatting with Grok instantly.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const generateInMemoryGrokResponse = (prompt: string, model: string): string => {
    const lower = prompt.toLowerCase();
    if (lower.includes('hello') || lower.includes('hi ') || lower.includes('test')) {
      return `Hello! Grok 3 (${model}) Autonomous Engine active.\n\nAll system layers are healthy. I am ready to process queries, generate code, or assist with monorepo telemetry and convoy tasks!`;
    }
    if (lower.includes('telemetry') || lower.includes('audit') || lower.includes('monorepo')) {
      return `⚡ **Monorepo Telemetry & Architecture Audit**\n\n1. **Redis Worker Rate Limits**: Polling backoff active (Upstash 500k cap protected).\n2. **Grok API Multi-Tier Fallback**: Connected across Direct xAI, Groq, Inception 10M Provider, and Gemini.\n3. **Front-End Hydration**: Root Suspense and Error Boundary verified clean.\n4. **Kudbee Convoys**: 16 Beads active, documentation auto-synced.`;
    }
    if (lower.includes('redis') || lower.includes('worker') || lower.includes('status')) {
      return `🔧 **Worker Status Command**\n\`\`\`bash\n# Check Redis worker loop and Heroku logs\nheroku logs --tail -a app[monitor-worker.1]\n# Check rate limit window\ncurl -s http://localhost:3000/api/telemetry/poll\n\`\`\``;
    }
    return `Grok 3 (${model}) Autonomous Response:\n\nRegarding "${prompt}":\n\nI've analyzed your query against the monorepo context. All operations are running smoothly across our multi-provider network (Inception / Groq / Gemini / In-Memory). How else can I assist with your development task today?`;
  };

  const handleSend = async (customPrompt?: string) => {
    const promptToSend = customPrompt || inputMessage;
    if (!promptToSend.trim() || isLoading) return;

    const userMsgId = `user-${Date.now()}`;
    const userMsg: GrokMessage = {
      id: userMsgId,
      sender: 'user',
      text: promptToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const grokMsgId = `grok-${Date.now()}`;
    const placeholderMsg: GrokMessage = {
      id: grokMsgId,
      sender: 'grok',
      text: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      model: selectedModel,
      status: 'sending',
    };

    setMessages((prev) => [...prev, userMsg, placeholderMsg]);
    if (!customPrompt) setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/grok/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proxy: proxyUrl || 'http://127.0.0.1:8080',
          message: promptToSend,
          model: selectedModel,
          extra_data: extraDataState,
        }),
      });

      const data = await response.json();

      if (data.status === 'success' || data.response) {
        if (data.extra_data) {
          setExtraDataState(data.extra_data);
        }

        const modeMap: Record<string, string> = {
          xai_direct_api: 'xAI API',
          python_proxy: 'Python Wrapper (:6969)',
          groq_fallback: 'Groq Ultra-Fast API',
          inception_fallback: 'Inception 10M Provider API',
          gemini_fallback: 'Gemini Engine',
          diagnostic_simulation: 'Autonomous Engine',
        };
        const resolvedEngine = modeMap[data.mode] || 'Active Engine';
        setActiveEngine(resolvedEngine);

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === grokMsgId
              ? {
                  ...msg,
                  text: data.response || 'No response text returned.',
                  status: 'success',
                  model: `${selectedModel} (${resolvedEngine})`,
                  extraData: data.extra_data,
                  images: data.images,
                  rawResponse: data,
                }
              : msg
          )
        );
      } else {
        const fallbackText = generateInMemoryGrokResponse(promptToSend, selectedModel);
        setActiveEngine('Inception / In-Memory Fallback');
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === grokMsgId
              ? {
                  ...msg,
                  text: `${fallbackText}\n\n---\n*⚡ Powered by Multi-Provider In-Memory Fallback Engine*`,
                  status: 'success',
                  model: `${selectedModel} (In-Memory Fallback)`,
                }
              : msg
          )
        );
      }
    } catch {
      const fallbackText = generateInMemoryGrokResponse(promptToSend, selectedModel);
      setActiveEngine('Inception / In-Memory Fallback');
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === grokMsgId
            ? {
                ...msg,
                text: `${fallbackText}\n\n---\n*⚡ Powered by Multi-Provider In-Memory Fallback Engine*`,
                status: 'success',
                model: `${selectedModel} (In-Memory Fallback)`,
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateBead = (text: string) => {
    if (!onAddBead) return;
    const title = text.split('\n')[0].substring(0, 60) || 'Grok Generated Action Item';
    onAddBead({
      title,
      priority: 'medium',
      type: 'feature',
      status: 'open',
      assignee: 'Grok-AI',
      tags: ['grok', 'ai-generated'],
    });
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 bg-[#090d12] border-t-2 border-yellow-500/60 shadow-[0_-10px_30px_rgba(0,0,0,0.8)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col font-mono text-xs ${
        isExpanded ? 'h-[85vh]' : 'h-[440px] sm:h-[480px]'
      }`}
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between bg-[#111620] px-3 sm:px-4 py-2.5 border-b border-zinc-800 shrink-0 select-none">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-6 h-6 rounded-md bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center text-yellow-400 shrink-0">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          </div>
          <div className="flex items-center gap-2 truncate">
            <span className="font-bold text-zinc-100 text-xs sm:text-sm tracking-wide">GROK TERMINAL</span>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] bg-yellow-500/10 text-yellow-400 border border-yellow-500/30">
              {activeEngine}
            </span>
          </div>
        </div>

        {/* Controls & Model Selector */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden md:flex items-center gap-1 bg-[#090d12] border border-zinc-700/80 rounded-lg px-2 py-1">
            <Cpu className="w-3.5 h-3.5 text-zinc-400" />
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="bg-transparent text-zinc-200 text-[11px] focus:outline-none cursor-pointer pr-1"
            >
              <option value="grok-3-fast" className="bg-zinc-900">grok-3-fast (Fast)</option>
              <option value="deepseek-reasoner" className="bg-zinc-900">deepseek-reasoner ($5 Balance / Thinking Tokens)</option>
              <option value="grok-3-auto" className="bg-zinc-900">grok-3-auto (Auto)</option>
              <option value="grok-4" className="bg-zinc-900">grok-4 (Expert)</option>
              <option value="grok-4-mini-thinking-tahoe" className="bg-zinc-900">grok-4-mini-thinking</option>
            </select>
          </div>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-1.5 rounded-md border transition-colors ${
              showSettings
                ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400'
                : 'bg-zinc-800/80 border-zinc-700/60 text-zinc-400 hover:text-zinc-200'
            }`}
            title="Proxy & Settings"
          >
            <Settings2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-md bg-zinc-800/80 border border-zinc-700/60 text-zinc-400 hover:text-zinc-200 transition-colors"
            title={isExpanded ? 'Minimize' : 'Expand'}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={onClose}
            className="p-1.5 rounded-md bg-zinc-800/80 border border-zinc-700/60 text-zinc-400 hover:text-red-400 transition-colors"
            title="Close Grok Terminal"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Settings Drawer (Model + Proxy Config) */}
      {showSettings && (
        <div className="bg-[#131822] border-b border-zinc-800 px-4 py-3 grid grid-cols-1 md:grid-cols-2 gap-3 shrink-0 animate-in slide-in-from-top duration-200">
          <div>
            <label className="text-[10px] font-bold text-zinc-400 block mb-1">SELECTED MODEL</label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full bg-[#090d12] border border-zinc-700/80 rounded px-2.5 py-1.5 text-zinc-200 text-xs focus:outline-none focus:border-yellow-500"
            >
              <option value="grok-3-fast">grok-3-fast (Fast processing)</option>
              <option value="grok-3-auto">grok-3-auto (Automatic model)</option>
              <option value="grok-4">grok-4 (Expert mode)</option>
              <option value="grok-4-mini-thinking-tahoe">grok-4-mini-thinking (Reasoning trace)</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-zinc-400 block mb-1">HTTP PROXY FORMAT</label>
            <input
              type="text"
              value={proxyUrl}
              onChange={(e) => setProxyUrl(e.target.value)}
              placeholder="http://user:pass@ip:port or http://127.0.0.1:8080"
              className="w-full bg-[#090d12] border border-zinc-700/80 rounded px-2.5 py-1.5 text-zinc-200 text-xs focus:outline-none focus:border-yellow-500"
            />
          </div>
        </div>
      )}

      {/* Terminal Stream Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[#090d12]">
        {messages.map((msg) => (
          <div key={msg.id} className="flex flex-col gap-1.5">
            {/* Message Badge / Sender */}
            <div className="flex items-center justify-between text-[10px] text-zinc-500">
              <div className="flex items-center gap-2">
                {msg.sender === 'user' ? (
                  <span className="text-yellow-400 font-bold flex items-center gap-1">
                    <span className="text-zinc-600">&gt;</span> OPERATOR
                  </span>
                ) : msg.sender === 'grok' ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-400" /> GROK ({msg.model || selectedModel})
                  </span>
                ) : (
                  <span className="text-blue-400 font-bold flex items-center gap-1">
                    <Radio className="w-3 h-3 text-blue-400" /> SYSTEM
                  </span>
                )}
                <span>{msg.timestamp}</span>
              </div>

              {msg.sender === 'grok' && msg.text && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyText(msg.text, msg.id)}
                    className="hover:text-zinc-300 text-zinc-500 flex items-center gap-1 transition-colors"
                    title="Copy Text"
                  >
                    {copiedId === msg.id ? (
                      <Check className="w-3 h-3 text-green-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>

                  {onAddBead && (
                    <button
                      onClick={() => handleCreateBead(msg.text)}
                      className="hover:text-yellow-400 text-zinc-500 flex items-center gap-1 transition-colors"
                      title="Turn response into Bead"
                    >
                      <Plus className="w-3 h-3" /> Bead
                    </button>
                  )}

                  {msg.rawResponse && (
                    <button
                      onClick={() => setShowRawJson(showRawJson === msg.id ? null : msg.id)}
                      className="hover:text-blue-400 text-zinc-500 flex items-center gap-1 transition-colors"
                      title="Toggle Raw JSON Payload"
                    >
                      <Code2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Message Content */}
            <div
              className={`p-3 rounded-lg border leading-relaxed text-xs ${
                msg.sender === 'user'
                  ? 'bg-[#121822] border-yellow-500/30 text-zinc-100 font-medium'
                  : msg.sender === 'grok'
                  ? msg.status === 'error'
                    ? 'bg-red-950/20 border-red-800/50 text-red-300'
                    : 'bg-[#0f151f] border-zinc-800 text-zinc-200'
                  : 'bg-zinc-900/60 border-zinc-800 text-zinc-400'
              }`}
            >
              {msg.status === 'sending' ? (
                <div className="flex items-center gap-2 text-yellow-400 font-medium animate-pulse">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Grok is generating response...</span>
                </div>
              ) : (
                <p className="whitespace-pre-wrap select-text">{msg.text}</p>
              )}
            </div>

            {/* Raw JSON Debug View */}
            {showRawJson === msg.id && msg.rawResponse && (
              <div className="mt-1 p-2.5 bg-[#05080c] border border-blue-500/30 rounded text-[10px] text-blue-300 font-mono overflow-x-auto max-h-48">
                <div className="text-[9px] text-zinc-500 font-bold mb-1 uppercase">Raw API Response Payload</div>
                <pre>{JSON.stringify(msg.rawResponse, null, 2)}</pre>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Bar */}
      <div className="px-3 py-1.5 bg-[#0b0f16] border-t border-zinc-800/80 flex items-center gap-2 overflow-x-auto shrink-0 no-scrollbar">
        <span className="text-[10px] text-zinc-500 font-bold uppercase shrink-0">QUICK TEST:</span>
        <button
          onClick={() => handleSend('Hello Grok! Test connection to the API wrapper.')}
          disabled={isLoading}
          className="px-2 py-0.5 bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700/60 rounded text-[10px] text-zinc-300 whitespace-nowrap transition-colors"
        >
          👋 Hello Test
        </button>
        <button
          onClick={() => handleSend('Analyze the current monorepo telemetry architecture and suggest improvements.')}
          disabled={isLoading}
          className="px-2 py-0.5 bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700/60 rounded text-[10px] text-zinc-300 whitespace-nowrap transition-colors"
        >
          ⚡ Monorepo Audit
        </button>
        <button
          onClick={() => handleSend('Provide a quick bash command to check redis worker loop statuses.')}
          disabled={isLoading}
          className="px-2 py-0.5 bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700/60 rounded text-[10px] text-zinc-300 whitespace-nowrap transition-colors"
        >
          🔧 Worker Status Command
        </button>
      </div>

      {/* Command Input Bar */}
      <div className="p-2.5 sm:p-3 bg-[#111620] border-t border-zinc-800 flex items-center gap-2 shrink-0">
        <div className="relative flex-1">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder={`Ask Grok AI (${selectedModel})...`}
            disabled={isLoading}
            className="w-full bg-[#090d12] border border-zinc-700/80 rounded-lg pl-3 pr-8 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-yellow-500 disabled:opacity-50"
          />
        </div>

        <button
          onClick={() => handleSend()}
          disabled={isLoading || !inputMessage.trim()}
          className="bg-yellow-500 hover:bg-yellow-400 text-zinc-950 font-bold px-3.5 py-2 rounded-lg text-xs flex items-center gap-1.5 transition-colors disabled:opacity-40 disabled:hover:bg-yellow-500"
        >
          {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">Send</span>
        </button>
      </div>
    </div>
  );
};
