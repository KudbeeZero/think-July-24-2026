import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, TerminalSquare, RefreshCw, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export const GeminiChatDrawer: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: "Initialization Complete. I am the KUDBEEKILO Blockchain Oracle & Think Token Monitoring Agent. My glass projection isolation is active. I am monitoring Solana Devnet smart contracts and dynamic token compression matrices. How may I direct the MCP server today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userMessage.content })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to fetch response');
      
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.response || "No response received."
      }]);
    } catch (err: any) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Error: ${err.message}`
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 border-l border-zinc-800 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/50">
        <div className="flex items-center gap-2 text-zinc-100">
          <TerminalSquare className="w-4 h-4 text-purple-400" />
          <h3 className="font-bold font-mono tracking-tight text-sm">KUDBEEKILO Terminal</h3>
        </div>
        <span className="px-2 py-0.5 rounded bg-purple-500/20 border border-purple-500/40 text-[9px] font-mono font-bold text-purple-300 uppercase">
          Gemini Pro Live
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-xl p-3 text-xs md:text-sm font-sans leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-purple-600/20 border border-purple-500/30 text-zinc-200' 
                : 'bg-zinc-900 border border-zinc-800 text-zinc-300'
            }`}>
              {msg.role === 'assistant' && (
                <div className="flex items-center gap-1.5 mb-1 text-purple-400">
                  <Bot className="w-3.5 h-3.5" /> <span className="text-[10px] font-bold uppercase tracking-wider">KudbeeKilo</span>
                </div>
              )}
              <div className="markdown-body">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-zinc-400 text-xs flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-zinc-900/80 border-t border-zinc-800">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Query KUDBEEKILO Agent..."
            className="w-full bg-zinc-950 border border-zinc-700 rounded-xl pl-4 pr-12 py-2.5 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-colors font-sans"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute right-2 p-1.5 rounded-lg bg-purple-600/20 text-purple-400 hover:bg-purple-600/40 hover:text-purple-300 disabled:opacity-50 disabled:hover:bg-purple-600/20 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
