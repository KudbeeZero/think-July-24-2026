import React, { useRef, useEffect, useState } from 'react';
import { Sparkles, Cpu, Radio, Copy, Check } from 'lucide-react';
import { KudbeeMessage } from '../../types';

interface VirtualizedMessageListProps {
  messages: KudbeeMessage[];
  height: number;
}

export function VirtualizedMessageList({ messages, height }: VirtualizedMessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  const ITEM_HEIGHT = 110;
  const OVERSCAN = 3;

  const totalHeight = messages.length * ITEM_HEIGHT;

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages.length]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - OVERSCAN);
  const endIndex = Math.min(messages.length, Math.ceil((scrollTop + height) / ITEM_HEIGHT) + OVERSCAN);

  const visibleMessages = messages.slice(startIndex, endIndex);
  const offsetY = startIndex * ITEM_HEIGHT;

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      style={{ height }}
      className="flex-1 bg-[#090d12] relative overflow-y-auto custom-scrollbar touch-pan-y"
    >
      <div style={{ height: totalHeight, width: '100%', position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)`, position: 'absolute', top: 0, left: 0, right: 0 }}>
          {visibleMessages.map((msg, idx) => {
            const actualIndex = startIndex + idx;
            return (
              <MessageRow key={msg.id || actualIndex} msg={msg} itemHeight={ITEM_HEIGHT} />
            );
          })}
        </div>
      </div>
      {/* Smooth fade gradients for depth */}
      <div className="sticky top-0 left-0 right-0 h-4 bg-gradient-to-b from-[#090d12] to-transparent pointer-events-none z-10" />
      <div className="sticky bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-[#090d12] to-transparent pointer-events-none z-10" />
    </div>
  );
}

function MessageRow({ msg, itemHeight }: { msg: KudbeeMessage; itemHeight: number }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ height: itemHeight }} className="px-4 py-1.5 border-b border-zinc-900/30 box-border">
      <div className="flex flex-col gap-1 h-full">
        <div className="flex items-center justify-between text-[9px] text-zinc-500 font-mono">
          <div className="flex items-center gap-2">
            {msg.sender === 'user' ? (
              <span className="text-yellow-400 font-bold uppercase tracking-tighter">&gt;_ OPERATOR</span>
            ) : msg.sender === 'kudbee' ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1 uppercase tracking-tighter">
                <Sparkles className="w-2.5 h-2.5" /> KUDBEE
              </span>
            ) : msg.sender === 'agent-worker' ? (
              <span className="text-purple-400 font-bold flex items-center gap-1 uppercase tracking-tighter">
                <Cpu className="w-2.5 h-2.5" /> WORKER
              </span>
            ) : (
              <span className="text-blue-400 font-bold flex items-center gap-1 uppercase tracking-tighter">
                <Radio className="w-2.5 h-2.5" /> SYSTEM
              </span>
            )}
            <span className="opacity-50">{msg.timestamp}</span>
          </div>
          {msg.sender === 'kudbee' && msg.text && (
            <button onClick={handleCopy} className="hover:text-zinc-300 transition-colors p-1">
              {copied ? <Check className="w-2.5 h-2.5 text-green-400" /> : <Copy className="w-2.5 h-2.5" />}
            </button>
          )}
        </div>
        <div className={`p-2.5 rounded-lg border text-[10px] leading-relaxed overflow-y-auto custom-scrollbar flex-1 font-mono transition-all ${
          msg.sender === 'user' ? 'bg-[#121822] border-yellow-500/10 text-zinc-100' :
          msg.sender === 'kudbee' ? 'bg-[#0f151f] border-zinc-800 text-zinc-200' :
          msg.sender === 'agent-worker' ? 'bg-purple-950/10 border-purple-900/20 text-purple-200' :
          'bg-zinc-900/30 border-zinc-800/30 text-zinc-400'
        }`}>
          {msg.status === 'sending' ? (
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
              <span className="italic opacity-70">KUDBEE thinking...</span>
            </div>
          ) : (
            <span className="whitespace-pre-wrap break-words">{msg.text}</span>
          )}
        </div>
      </div>
    </div>
  );
}

