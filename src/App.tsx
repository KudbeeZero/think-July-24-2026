import React, { useState, useEffect, useRef } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useKilo } from './context/KiloContext';
import {
  PanelLeft,
  GitBranch,
  Settings,
  Plus,
  Play,
  X,
  Trash2,
  Hexagon,
  SquareTerminal,
  Activity,
  Crown,
  Bug,
  Layout,
  ChevronDown,
  ChevronRight,
  Menu,
  ArrowLeft,
  LayoutGrid,
  Bot,
  GitMerge,
  Mail,
  Shield,
  CheckCircle2,
  Search,
  Copy,
  Check,
  Terminal as TerminalIcon,
  Filter,
  Sparkles,
  Cpu,
  Brain,
} from 'lucide-react';
import { INITIAL_BEADS, INITIAL_AGENTS, INITIAL_CONVOYS, INITIAL_MAIL_ITEMS } from './data';
import { Bead, Agent, Convoy, Status, Priority, MailItem } from './types';
import { NewBeadModal } from './components/NewBeadModal';
import { BeadDetailModal } from './components/BeadDetailModal';
import { AgentDetailModal } from './components/AgentDetailModal';
import { ConvoyDetailModal } from './components/ConvoyDetailModal';
import { ObservabilityView } from './components/ObservabilityView';
import { MergeQueueView } from './components/MergeQueueView';
import { MailView } from './components/MailView';
import { SettingsView } from './components/SettingsView';
import { AgentsView } from './components/AgentsView';
import { NewRigModal } from './components/NewRigModal';
import { KudbeeTerminal } from './components/KudbeeTerminal';
import { ThinkTokenMeter } from './components/ThinkTokenMeter';
import { SpinUpAgentModal } from './components/SpinUpAgentModal';
import { OverviewView } from './components/OverviewView';
import { BeadsView } from './components/BeadsView';
import { McpView } from './components/McpView';
import { SystemTrackerView } from './components/SystemTrackerView';
import { KiloTerminalView } from './components/KiloTerminalView';
import { ThinkTokenVault } from './components/ThinkTokenVault';
import { RackMountWrapper } from './components/kilo/RackMountWrapper';

export default function App() {
  const {
    beads,
    agents,
    convoys,
    mailItems,
    toasts,
    totalReasoningTokens,
    budgetLimit,
    activeModel,
    isSpinUpModalOpen,
    activeNav,
    searchQuery,
    priorityFilter,
    isNewBeadOpen,
    isNewRigOpen,
    selectedBead,
    selectedAgent,
    selectedConvoy,
    setSelectedConvoy,
    isSidebarOpen,
    showTerminalMobile,
    isGrokTerminalOpen,
    promptCopied,
    liveFeed,
    KILO_PROMPT_TEXT,
    
    navHistory,
    historyIndex,
    handleGoBack,
    handleGoForward,
    handleNavigateToHistory,
    
    handleAddBead,
    handleUpdateBeadStatus,
    handleUpdateBeadAssignee,
    handleDeleteBead,
    handleToggleAgentStatus,
    handleAddConvoy,
    handleAgentCreated,
    handleRunTestTask,
    handleMarkMailAsRead,
    handleMarkAllMailAsRead,
    simulateIncomingAlert,
    handleClearToasts,
    handleCopyPrompt,
    
    setBeads,
    setAgents,
    setConvoys,
    setMailItems,
    setToasts,
    setTotalReasoningTokens,
    setActiveNav,
    setSearchQuery,
    setPriorityFilter,
    setIsSidebarOpen,
    setShowTerminalMobile,
    setIsGrokTerminalOpen,
    setIsNewBeadOpen,
    setIsNewRigOpen,
    setSelectedBead,
    setSelectedAgent,
    setIsSpinUpModalOpen,
    setPromptCopied,
    setLiveFeed,
    setActiveModel,
    handleMintThinkTokens,
    syncThinkTokens,
    agentHeartbeat
  } = useKilo();

  // Periodic heartbeat and token sync
  useEffect(() => {
    const interval = setInterval(() => {
      // Sync tokens to database every 30 seconds
      syncThinkTokens();
      
      // Ping heartbeat for active agents
      agents.forEach(agent => {
        if (agent.status === 'working') {
          agentHeartbeat(agent.id);
        }
      });
    }, 30000);

    return () => clearInterval(interval);
  }, [syncThinkTokens, agentHeartbeat, agents]);



  // Filtered Beads
  const filteredBeads = beads.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.assignee && b.assignee.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (b.tags && b.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesPriority = priorityFilter === 'all' || b.priority === priorityFilter;

    return matchesSearch && matchesPriority;
  });

  const openCount = beads.filter((b) => b.status === 'open').length;
  const inProgressCount = beads.filter((b) => b.status === 'in_progress').length;
  const inReviewCount = beads.filter((b) => b.status === 'in_review').length;
  const closedCount = beads.filter((b) => b.status === 'closed').length;
  const unreadMailCount = mailItems.filter((m) => m.unread).length;



  return (
    <div className="h-[100dvh] w-full bg-[#0d1117] text-zinc-200 font-sans flex overflow-hidden relative">
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:static inset-y-0 left-0 z-50 w-[280px] lg:w-64 bg-[#0d1117] border-r border-zinc-800/60 flex flex-col h-full shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] shadow-2xl lg:shadow-none ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4 flex items-center justify-between text-zinc-400 hover:text-zinc-200 cursor-pointer text-sm font-medium">
          <div className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> All towns
          </div>
          <button className="lg:hidden p-1 text-zinc-500" onClick={() => setIsSidebarOpen(false)}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-4 py-2 flex items-center gap-3 mb-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center text-yellow-500 font-bold">
            <Crown className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-zinc-200 text-sm">Kudbeeville</div>
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
              Live
            </div>
          </div>
        </div>

        {/* Scrollable navigation container for mobile screen & landscape safety */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-1 py-2 space-y-6 min-h-0">
          {/* Navigation Section */}
          <div>
            <div className="px-3 mb-2 text-[10px] font-bold text-zinc-500 tracking-wider uppercase">Navigation</div>
        <nav className="flex flex-col gap-0.5 px-2 mb-6">
          <button
            onClick={() => {
              setActiveNav('overview');
              setIsSidebarOpen(false);
            }}
            className={`flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors text-left ${
              activeNav === 'overview'
                ? 'text-zinc-100 bg-zinc-800/80 font-medium'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
            }`}
          >
            <LayoutGrid className="w-4 h-4 text-yellow-500" /> Overview
          </button>

          <button
            onClick={() => {
              setActiveNav('beads');
              setIsSidebarOpen(false);
            }}
            className={`flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors text-left ${
              activeNav === 'beads'
                ? 'text-zinc-100 bg-zinc-800/80 font-medium'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
            }`}
          >
            <span className="flex items-center gap-3">
              <Hexagon className="w-4 h-4 text-blue-400" /> Beads
            </span>
            <span className="text-xs font-mono text-zinc-500">{beads.length}</span>
          </button>

          <button
            onClick={() => {
              setActiveNav('agents');
              setIsSidebarOpen(false);
            }}
            className={`flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors text-left ${
              activeNav === 'agents'
                ? 'text-zinc-100 bg-zinc-800/80 font-medium'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
            }`}
          >
            <span className="flex items-center gap-3">
              <Bot className="w-4 h-4 text-green-400" /> Agents
            </span>
            <span className="text-xs font-mono text-zinc-500">{agents.length}</span>
          </button>

          <button
            onClick={() => {
              setActiveNav('merge_queue');
              setIsSidebarOpen(false);
            }}
            className={`flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors text-left ${
              activeNav === 'merge_queue'
                ? 'text-zinc-100 bg-zinc-800/80 font-medium'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
            }`}
          >
            <GitMerge className="w-4 h-4 text-purple-400" /> Merge Queue
          </button>

          <button
            onClick={() => {
              setActiveNav('mail');
              setIsSidebarOpen(false);
            }}
            className={`flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors text-left ${
              activeNav === 'mail'
                ? 'text-zinc-100 bg-zinc-800/80 font-medium'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
            }`}
          >
            <span className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-amber-400" /> Mail
            </span>
            {unreadMailCount > 0 && (
              <span className="px-1.5 py-0.5 text-[9px] font-bold font-mono rounded-full bg-amber-500 text-zinc-950 animate-pulse leading-none shrink-0">
                {unreadMailCount}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setActiveNav('observability');
              setIsSidebarOpen(false);
            }}
            className={`flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors text-left ${
              activeNav === 'observability'
                ? 'text-zinc-100 bg-zinc-800/80 font-medium'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
            }`}
          >
            <Activity className="w-4 h-4 text-red-400" /> Observability
          </button>

          <button
            onClick={() => {
              setActiveNav('mcp');
              setIsSidebarOpen(false);
            }}
            className={`flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors text-left ${
              activeNav === 'mcp'
                ? 'text-zinc-100 bg-zinc-800/80 font-medium'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
            }`}
          >
            <Cpu className="w-4 h-4 text-purple-400" /> MCP & Heroku Check
          </button>

          <button
            onClick={() => {
              setActiveNav('tracker');
              setIsSidebarOpen(false);
            }}
            className={`flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors text-left ${
              activeNav === 'tracker'
                ? 'text-zinc-100 bg-zinc-800/80 font-medium'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-[#e5ff55]" /> System Tracker (10 items)
          </button>

          <button
            onClick={() => {
              setActiveNav('kilo-terminal');
              setIsSidebarOpen(false);
            }}
            className={`flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors text-left ${
              activeNav === 'kilo-terminal'
                ? 'text-zinc-100 bg-zinc-800/80 font-medium'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
            }`}
          >
            <span className="flex items-center gap-3">
              <Brain className="w-4 h-4 text-yellow-400" /> KUDBEE Token & Limits
            </span>
            <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-yellow-500/25 text-yellow-400 font-bold border border-yellow-500/10">
              Live API
            </span>
          </button>

          <button
            onClick={() => {
              setActiveNav('think-token-vault');
              setIsSidebarOpen(false);
            }}
            className={`flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors text-left ${
              activeNav === 'think-token-vault'
                ? 'text-zinc-100 bg-zinc-800/80 font-medium font-bold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
            }`}
          >
            <span className="flex items-center gap-3">
              <Cpu className="w-4 h-4 text-cyan-400 animate-pulse" /> Think Token Vault
            </span>
            <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-bold border border-cyan-500/10">
              New
            </span>
          </button>

          <button
            onClick={() => {
              setIsGrokTerminalOpen(!isGrokTerminalOpen);
              setIsSidebarOpen(false);
            }}
            className="flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors text-left text-yellow-400/90 hover:bg-yellow-500/10 hover:text-yellow-400 font-medium border border-yellow-500/20 my-1"
          >
            <span className="flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" /> Kudbee AI Terminal
            </span>
            <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-400">
              Slide-Up
            </span>
          </button>
        </nav>
        </div> {/* Closing Navigation Section */}

        {/* Rigs & Convoys Section */}
        <div>
          <div className="px-3 mb-2 flex items-center justify-between text-[10px] font-bold text-zinc-500 tracking-wider uppercase">
            <span>Rigs & Convoys</span>
            <button
              onClick={() => setIsNewRigOpen(true)}
              className="hover:text-yellow-400 text-xs transition-colors p-1"
              title="New Rig"
            >
              + New
            </button>
          </div>
          <nav className="flex flex-col gap-0.5 px-1.5">
          {convoys.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setActiveNav('overview');
                setIsSidebarOpen(false);
              }}
              className="flex items-center gap-3 px-3 py-2 text-sm text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 rounded-md font-medium text-left truncate"
            >
              <div className="w-5 h-5 rounded bg-zinc-700/80 flex items-center justify-center text-xs font-bold text-zinc-300 shrink-0">
                k
              </div>
              <span className="truncate">{c.title}</span>
            </button>
          ))}
        </nav>
        </div> {/* Closing Rigs & Convoys Section */}

        {/* System Topology Map */}
        <div>
          <div className="px-3 mb-2 flex items-center justify-between">
            <span className="text-[10px] font-bold text-zinc-500 tracking-wider uppercase">System Topology</span>
            <span className="text-[9px] font-mono text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> 5 SWARM NODES
            </span>
          </div>
          <div className="px-3 flex justify-center">
          <div className="relative w-full aspect-square max-w-[210px] flex items-center justify-center bg-[#080c11] border border-zinc-800/80 rounded-2xl p-2 shadow-inner">
            {/* Background Glow */}
            <div className="absolute inset-0 bg-yellow-500/5 rounded-2xl blur-xl pointer-events-none" />

            {/* Connection Lines with Pulsing Data Flow */}
            <svg className="absolute inset-0 w-full h-full text-zinc-800" style={{ zIndex: 0 }}>
              <style>{`
                @keyframes pulse-dash {
                  to {
                    stroke-dashoffset: -40;
                  }
                }
                .flow-line {
                  stroke-dasharray: 6, 4;
                  animation: pulse-dash 2s linear infinite;
                }
              `}</style>
              <line x1="50%" y1="75%" x2="20%" y2="40%" stroke="#1f2937" strokeWidth="2" />
              <line x1="50%" y1="75%" x2="20%" y2="40%" stroke="#e5ff55" strokeWidth="2" className="flow-line" style={{ animationDelay: '0s' }} />

              <line x1="50%" y1="75%" x2="35%" y2="30%" stroke="#1f2937" strokeWidth="2" />
              <line x1="50%" y1="75%" x2="35%" y2="30%" stroke="#60a5fa" strokeWidth="2" className="flow-line" style={{ animationDelay: '0.4s' }} />

              <line x1="50%" y1="75%" x2="50%" y2="25%" stroke="#1f2937" strokeWidth="2" />
              <line x1="50%" y1="75%" x2="50%" y2="25%" stroke="#34d399" strokeWidth="2" className="flow-line" style={{ animationDelay: '0.8s' }} />

              <line x1="50%" y1="75%" x2="65%" y2="30%" stroke="#1f2937" strokeWidth="2" />
              <line x1="50%" y1="75%" x2="65%" y2="30%" stroke="#c084fc" strokeWidth="2" className="flow-line" style={{ animationDelay: '1.2s' }} />

              <line x1="50%" y1="75%" x2="80%" y2="40%" stroke="#1f2937" strokeWidth="2" />
              <line x1="50%" y1="75%" x2="80%" y2="40%" stroke="#fbbf24" strokeWidth="2" className="flow-line" style={{ animationDelay: '1.6s' }} />
            </svg>
            
            {/* Mayor Node */}
            <div className="absolute bottom-[8%] w-16 h-16 rounded-full bg-[#e5ff55] flex flex-col items-center justify-center shadow-[0_0_20px_rgba(229,255,85,0.4)] z-10 border-4 border-[#080c11] relative group cursor-pointer transition-transform hover:scale-110">
              <span className="text-[9px] font-extrabold text-zinc-950">MAYOR</span>
              <span className="text-[7px] font-bold text-zinc-800">100% HEALTH</span>
              <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
            </div>
            
            {/* Worker Nodes */}
            <div className="absolute top-[32%] left-[8%] w-8 h-8 rounded-full bg-zinc-900 border-2 border-emerald-500/80 flex flex-col items-center justify-center z-10 relative shadow-[0_0_10px_rgba(16,185,129,0.3)] group cursor-pointer hover:scale-110 transition-transform">
              <span className="text-[7px] text-zinc-200 font-bold">Toast</span>
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#080c11]" />
            </div>

            <div className="absolute top-[20%] left-[26%] w-8 h-8 rounded-full bg-zinc-900 border-2 border-emerald-500/80 flex flex-col items-center justify-center z-10 relative shadow-[0_0_10px_rgba(16,185,129,0.3)] group cursor-pointer hover:scale-110 transition-transform">
              <span className="text-[7px] text-zinc-200 font-bold">Maple</span>
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#080c11]" />
            </div>

            <div className="absolute top-[14%] left-[50%] -translate-x-1/2 w-9 h-9 rounded-full bg-zinc-900 border-2 border-yellow-400 flex flex-col items-center justify-center z-10 shadow-[0_0_15px_rgba(250,204,21,0.4)] relative group cursor-pointer hover:scale-110 transition-transform">
              <span className="text-[7px] text-yellow-300 font-extrabold">Alpha</span>
              <span className="text-[5px] text-yellow-400/80 font-bold">LOCAL</span>
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-yellow-400 border-2 border-[#080c11] animate-pulse" />
            </div>

            <div className="absolute top-[20%] right-[26%] w-8 h-8 rounded-full bg-zinc-900 border-2 border-cyan-500/80 flex flex-col items-center justify-center z-10 relative shadow-[0_0_10px_rgba(6,182,212,0.3)] group cursor-pointer hover:scale-110 transition-transform">
              <span className="text-[7px] text-cyan-300 font-bold">refinery</span>
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-cyan-400 border-2 border-[#080c11]" />
            </div>

            <div className="absolute top-[32%] right-[8%] w-9 h-9 rounded-full bg-zinc-900 border-2 border-purple-500/80 flex flex-col items-center justify-center z-10 relative shadow-[0_0_10px_rgba(168,85,247,0.3)] group cursor-pointer hover:scale-110 transition-transform">
              <span className="text-[7px] text-purple-300 font-bold">GitHub</span>
              <span className="text-[5px] text-purple-400/80 font-bold">SYNC</span>
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-purple-400 border-2 border-[#080c11] animate-ping" />
            </div>
          </div>
          </div>
          </div> {/* Closing System Topology Section */}
        </div> {/* Closing Scroll Container */}

        <div className="mt-auto p-4 border-t border-[#1f2937]/50 bg-[#0d1117] shrink-0">
          <button
            onClick={() => {
              setActiveNav('settings');
              setIsSidebarOpen(false);
            }}
            className={`flex items-center gap-3 text-sm w-full transition-colors text-left ${
              activeNav === 'settings' ? 'text-yellow-400 font-semibold' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Settings className="w-4 h-4" /> Settings
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Header */}
        <header className="flex items-center justify-between px-2 sm:px-6 py-3 sm:py-4 border-b border-zinc-800/60 bg-[#0d1117]/80 backdrop-blur-md h-14 sm:h-16 shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-1 sm:gap-2 min-w-0">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-1.5 sm:p-2 -ml-1 text-zinc-400 hover:text-zinc-200 active:scale-95 transition-transform"
            >
              <Menu className="w-5 sm:w-6 h-5 sm:h-6" />
            </button>

            <h1 className="text-zinc-100 font-semibold text-[12px] sm:text-base flex items-center gap-1 sm:gap-2 truncate min-w-0">
              <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-sm border border-zinc-600 flex items-center justify-center bg-zinc-800 shrink-0">
                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-sm border border-zinc-400" />
              </div>
              <span className="hidden xs:inline sm:hidden truncate font-bold">Kudbee</span>
              <span className="hidden sm:inline truncate">Kudbee-fuel-gage</span>
              <span className="hidden md:flex items-center gap-1.5 text-xs font-normal text-zinc-400">
                <GitBranch className="w-3.5 h-3.5" />
                main
              </span>
            </h1>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <ThinkTokenMeter
              totalReasoningTokens={totalReasoningTokens}
              maxBudget={budgetLimit}
              activeModel={activeModel}
              onOpenTerminal={() => setIsGrokTerminalOpen(true)}
            />

            <button
              onClick={() => setIsGrokTerminalOpen(!isGrokTerminalOpen)}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all border ${
                isGrokTerminalOpen
                  ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50 shadow-[0_0_12px_rgba(234,179,8,0.2)]'
                  : 'bg-zinc-800/80 text-zinc-300 border-zinc-700/80 hover:bg-zinc-700/80 hover:text-yellow-400'
              }`}
              title="Toggle Kudbee AI Terminal"
            >
              <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
              <span className="hidden sm:inline">Kudbee AI</span>
            </button>

            <button
              onClick={() => setShowTerminalMobile(!showTerminalMobile)}
              className="xl:hidden p-1.5 text-zinc-400 hover:text-yellow-400 active:scale-95 transition-all bg-zinc-800/50 rounded-lg border border-zinc-700/50 shrink-0"
              title="Toggle Terminal Panel"
            >
              <TerminalIcon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </button>

            <button
              onClick={() => setIsNewBeadOpen(true)}
              className="flex items-center gap-1 bg-[#e5ff55] hover:bg-[#d4ed44] text-zinc-950 font-semibold px-2.5 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm transition-colors shadow-sm shrink-0"
            >
              <Plus className="w-4.5 h-4.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">New Bead</span>
            </button>
          </div>
        </header>

        {/* Interactive Breadcrumbs & Back/Forward Bar */}
        <div className="bg-[#111622] border-b border-zinc-800/80 px-4 sm:px-6 py-2 flex items-center justify-between text-xs font-mono select-none shrink-0 overflow-x-auto gap-3">
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Back Arrow Button */}
            <button
              onClick={handleGoBack}
              disabled={historyIndex === 0}
              className={`p-1.5 rounded-md border border-zinc-805 bg-[#0d1117] transition-all flex items-center justify-center ${
                historyIndex === 0
                  ? 'text-zinc-650 opacity-40 cursor-not-allowed border-zinc-800/40 bg-zinc-900/20'
                  : 'text-zinc-300 hover:text-yellow-400 hover:border-zinc-700 active:scale-95 cursor-pointer'
              }`}
              title="Navigate Back"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>

            {/* Forward Arrow Button */}
            <button
              onClick={handleGoForward}
              disabled={historyIndex === navHistory.length - 1}
              className={`p-1.5 rounded-md border border-zinc-805 bg-[#0d1117] transition-all flex items-center justify-center ${
                historyIndex === navHistory.length - 1
                  ? 'text-zinc-655 opacity-40 cursor-not-allowed border-zinc-800/40 bg-zinc-900/20'
                  : 'text-zinc-300 hover:text-yellow-400 hover:border-zinc-700 active:scale-95 cursor-pointer'
              }`}
              title="Navigate Forward"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            
            <span className="w-[1px] h-4 bg-zinc-800 hidden xs:inline" />

            {/* Breadcrumb Trail */}
            <div className="flex items-center gap-1 sm:gap-1.5 text-[11px] text-zinc-400">
              <button
                onClick={() => {
                  setActiveNav('overview');
                  setSelectedBead(null);
                  setSelectedAgent(null);
                  setSelectedConvoy(null);
                }}
                className="hover:text-yellow-400 font-bold transition-colors cursor-pointer"
              >
                Kudbee
              </button>
              
              <ChevronRight className="w-3 h-3 text-zinc-600 shrink-0" />

              <button
                onClick={() => {
                  setActiveNav(activeNav);
                  setSelectedBead(null);
                  setSelectedAgent(null);
                  setSelectedConvoy(null);
                }}
                className={`capitalize font-bold transition-colors cursor-pointer ${
                  !selectedBead && !selectedAgent && !selectedConvoy ? 'text-zinc-200' : 'hover:text-yellow-400'
                }`}
              >
                {activeNav.replace('-', ' ').replace('_', ' ')}
              </button>

              {/* Sub-breadcrumbs depending on selected elements */}
              {selectedBead && (
                <>
                  <ChevronRight className="w-3 h-3 text-zinc-600 shrink-0" />
                  <span className="text-blue-400 font-bold max-w-[120px] sm:max-w-[200px] truncate" title={selectedBead.title}>
                    Bead {selectedBead.id}
                  </span>
                </>
              )}

              {selectedAgent && (
                <>
                  <ChevronRight className="w-3 h-3 text-zinc-600 shrink-0" />
                  <span className="text-green-400 font-bold truncate">
                    Agent {selectedAgent.name}
                  </span>
                </>
              )}

              {selectedConvoy && (
                <>
                  <ChevronRight className="w-3 h-3 text-zinc-600 shrink-0" />
                  <span className="text-purple-400 font-bold max-w-[120px] sm:max-w-[200px] truncate" title={selectedConvoy.title}>
                    Convoy {selectedConvoy.title}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Right Section: History dropdown/steps tracker */}
          <div className="text-[10px] text-zinc-500 hidden md:flex items-center gap-1 bg-zinc-950/40 px-2 py-1 rounded border border-zinc-900 shrink-0">
            <span className="font-bold text-yellow-500/80">History Stack:</span>
            <span>{historyIndex + 1} of {navHistory.length} states</span>
          </div>
        </div>

        {/* View Switcher Output */}
        {activeNav === 'think-token-vault' ? (
          <div className="flex-1 overflow-y-auto overflow-x-hidden relative pb-[calc(6rem+env(safe-area-inset-bottom))] lg:pb-6" style={{ WebkitOverflowScrolling: 'touch' }}>
            <RackMountWrapper title="Think Token Vault">
              <ThinkTokenVault />
            </RackMountWrapper>
          </div>
        ) : activeNav === 'kilo-terminal' ? (
          <div className="flex-1 overflow-y-auto overflow-x-hidden relative pb-[calc(6rem+env(safe-area-inset-bottom))] lg:pb-6" style={{ WebkitOverflowScrolling: 'touch' }}>
            <RackMountWrapper title="Kudbee Console">
              <KiloTerminalView totalReasoningTokens={totalReasoningTokens} setTotalReasoningTokens={setTotalReasoningTokens} />
            </RackMountWrapper>
          </div>
        ) : activeNav === 'tracker' ? (
          <div className="flex-1 overflow-y-auto overflow-x-hidden relative pb-[calc(6rem+env(safe-area-inset-bottom))] lg:pb-6" style={{ WebkitOverflowScrolling: 'touch' }}>
            <RackMountWrapper title="System Tracker">
              <SystemTrackerView />
            </RackMountWrapper>
          </div>
        ) : activeNav === 'observability' ? (
          <div className="flex-1 overflow-y-auto overflow-x-hidden relative pb-[calc(6rem+env(safe-area-inset-bottom))] lg:pb-6" style={{ WebkitOverflowScrolling: 'touch' }}>
            <RackMountWrapper title="Observability">
              <ObservabilityView liveFeed={liveFeed} />
            </RackMountWrapper>
          </div>
        ) : activeNav === 'mcp' ? (
          <div className="flex-1 overflow-y-auto overflow-x-hidden relative pb-[calc(6rem+env(safe-area-inset-bottom))] lg:pb-6" style={{ WebkitOverflowScrolling: 'touch' }}>
            <RackMountWrapper title="MCP & Heroku Check">
              <McpView />
            </RackMountWrapper>
          </div>
        ) : activeNav === 'merge_queue' ? (
          <div className="flex-1 overflow-y-auto overflow-x-hidden relative pb-[calc(6rem+env(safe-area-inset-bottom))] lg:pb-6" style={{ WebkitOverflowScrolling: 'touch' }}>
            <RackMountWrapper title="Merge Queue">
              <MergeQueueView />
            </RackMountWrapper>
          </div>
        ) : activeNav === 'mail' ? (
          <div className="flex-1 overflow-y-auto overflow-x-hidden relative pb-[calc(6rem+env(safe-area-inset-bottom))] lg:pb-6" style={{ WebkitOverflowScrolling: 'touch' }}>
            <RackMountWrapper title="Mail">
              <MailView 
                mailItems={mailItems} 
                onMarkAsRead={handleMarkMailAsRead} 
                onMarkAllAsRead={handleMarkAllMailAsRead}
                onSimulateAlert={simulateIncomingAlert}
              />
            </RackMountWrapper>
          </div>
        ) : activeNav === 'settings' ? (
          <div className="flex-1 overflow-y-auto overflow-x-hidden relative pb-[calc(6rem+env(safe-area-inset-bottom))] lg:pb-6" style={{ WebkitOverflowScrolling: 'touch' }}>
            <RackMountWrapper title="Settings">
              <SettingsView />
            </RackMountWrapper>
          </div>
        ) : activeNav === 'agents' ? (
          <div className="flex-1 overflow-y-auto overflow-x-hidden relative pb-[calc(6rem+env(safe-area-inset-bottom))] lg:pb-6" style={{ WebkitOverflowScrolling: 'touch' }}>
            <RackMountWrapper title="Agents" showAgentStatus={true}>
              <AgentsView
                agents={agents}
                onSelectAgent={(agent) => setSelectedAgent(agent)}
                onToggleStatus={handleToggleAgentStatus}
              />
            </RackMountWrapper>
          </div>
        ) : activeNav === 'beads' ? (
          <div className="flex-1 overflow-y-auto overflow-x-hidden relative pb-[calc(6rem+env(safe-area-inset-bottom))] lg:pb-6" style={{ WebkitOverflowScrolling: 'touch' }}>
            <RackMountWrapper title="Beads">
              <BeadsView
                beads={beads}
                onSelectBead={(bead) => setSelectedBead(bead)}
                onOpenNewBeadModal={() => setIsNewBeadOpen(true)}
                onStatusChange={handleUpdateBeadStatus}
              />
            </RackMountWrapper>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto overflow-x-hidden relative pb-[calc(6rem+env(safe-area-inset-bottom))] lg:pb-6" style={{ WebkitOverflowScrolling: 'touch' }}>
            <RackMountWrapper title="Overview">
              <OverviewView
                agents={agents}
                convoys={convoys}
                liveFeed={liveFeed}
                onOpenSpinUpModal={() => setIsSpinUpModalOpen(true)}
                onOpenGrokTerminal={() => setIsGrokTerminalOpen(true)}
                onSelectAgent={(agent) => setSelectedAgent(agent)}
                onRunTestTask={handleRunTestTask}
              />
            </RackMountWrapper>
          </div>
        )}
      </div>

      {/* Right Terminal Panel */}
      <div
        className={`fixed xl:static inset-y-0 right-0 z-50 w-full sm:w-[400px] xl:w-[340px] bg-[#0d1117] border-l border-zinc-800/80 flex flex-col font-mono text-[11px] h-full shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] shadow-2xl xl:shadow-none ${
          showTerminalMobile ? 'translate-x-0' : 'translate-x-full xl:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between bg-[#0a0d12] border-b border-zinc-800/80 px-3 sm:px-4 py-3 sm:py-2 shrink-0">
          <div className="flex items-center gap-2 text-xs sm:text-xs font-semibold text-yellow-500">
            <SquareTerminal className="w-4 h-4 sm:w-4 sm:h-4 text-yellow-500" />
            <span>Kudbee Agent Dispatch Console</span>
          </div>
          <button
            onClick={() => setShowTerminalMobile(false)}
            className="xl:hidden p-2 -mr-2 text-zinc-500 hover:text-zinc-300 active:scale-95 transition-transform bg-zinc-900 rounded-lg border border-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Terminal Content Stream */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 text-zinc-300 leading-relaxed">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <div className="flex items-center gap-2 text-green-400 font-semibold text-[11px]">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span>Mayor Dispatch Operational</span>
            </div>
            <button
              onClick={handleCopyPrompt}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-[#161b22] hover:bg-zinc-800 border border-zinc-700/60 rounded text-[10px] text-yellow-400 font-semibold transition-colors"
            >
              {promptCopied ? (
                <>
                  <Check className="w-3 h-3 text-green-400" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" /> Copy Kudbee Prompt
                </>
              )}
            </button>
          </div>

          <div className="space-y-3 font-mono text-[10px] leading-relaxed">
            <p className="text-zinc-400">
              <strong className="text-emerald-400">System Status: Front-End Prototype Mode</strong>
              <br />
              Notice: The dashboard is currently running on local mock data for UI/UX rapid prototyping. It is not yet connected to the live Postgres/Redis backend.
            </p>

            <div className="bg-[#0a0d12] border border-zinc-700/60 rounded-md p-3 relative group">
              <div className="flex items-center justify-between text-[9px] text-zinc-500 font-sans uppercase font-bold mb-1.5">
                <span>Proposed 15-Commit Roadmap (5 New Upgrades)</span>
                <span className="text-yellow-500">Next Steps</span>
              </div>
              <ul className="text-zinc-300 font-mono text-[10px] leading-relaxed space-y-1 select-all list-none pl-0">
                <li><span className="text-blue-400">feat(api):</span> scaffold Express server with Vite middleware for full-stack architecture</li>
                <li><span className="text-blue-400">feat(telemetry):</span> implement WebSocket listener for real-time agent observability stream</li>
                <li><span className="text-blue-400">feat(db):</span> wire up single-container Postgres schema for ingestion server syncing</li>
                <li><span className="text-blue-400">feat(topology):</span> build interactive SVG node graph for System Topology visualization</li>
                <li><span className="text-blue-400">feat(ui):</span> implement real-time Activity Feed for agent lifecycle events</li>
                <li><span className="text-purple-400">refactor(state):</span> migrate mock data to React Context API to prepare for live backend</li>
                <li><span className="text-blue-400">feat(memory):</span> create Memory Vault UI to inspect semantic recall and vector embeddings</li>
                <li><span className="text-blue-400">feat(auth):</span> add secure environment variable masking and operator authentication</li>
                <li><span className="text-yellow-400">perf(terminal):</span> implement virtualized list for high-throughput log streaming</li>
                <li><span className="text-green-400">style(layout):</span> enhance responsive grid for fluid mobile-to-desktop scaling</li>
                {/* Advanced Upgrades */}
                <li className="pt-2 border-t border-zinc-800/50 mt-2"><span className="text-green-400">build(heroku):</span> <span className="text-zinc-200">complete Express+Vite production build pipeline (server.ts)</span></li>
                <li><span className="text-purple-400">feat(state):</span> <span className="text-zinc-200">implement robust `useLocalStorage` for resilient session caching</span></li>
                <li><span className="text-blue-400">feat(db):</span> <span className="text-zinc-200">provision single-container Drizzle/Postgres ORM setup</span></li>
                <li><span className="text-blue-400">feat(realtime):</span> <span className="text-zinc-200">add fallback HTTP long-polling for WebSocket telemetry</span></li>
                <li><span className="text-green-400">feat(mobile):</span> <span className="text-zinc-200">optimize mobile bottom nav safe-area constraints for PWA support</span></li>
              </ul>
            </div>

            <div className="bg-[#0a0d12] border border-zinc-700/60 rounded-md p-3 relative group mt-4">
              <div className="flex items-center justify-between text-[9px] text-zinc-500 font-sans uppercase font-bold mb-1.5">
                <span>Staged Convoy Mission Prompt</span>
                <span className="text-yellow-500">Phase 11 Sync</span>
              </div>
              <pre className="text-zinc-300 whitespace-pre-wrap font-mono text-[10px] leading-relaxed max-h-64 overflow-y-auto select-all">
                {KILO_PROMPT_TEXT}
              </pre>
            </div>
          </div>
        </div>

        {/* Console Input Footer */}
        <div className="p-3 bg-[#0a0d12] border-t border-zinc-800/80 shrink-0">
          <div className="flex items-center justify-between text-zinc-500 text-[10px] font-mono">
            <span>Model: DeepSeek V4 Pro</span>
            <span className="text-green-400 font-semibold">CI Green</span>
          </div>
        </div>
      </div>

      {/* Modals & Detail Drawers */}
      <NewBeadModal
        isOpen={isNewBeadOpen}
        onClose={() => setIsNewBeadOpen(false)}
        onAddBead={handleAddBead}
      />

      <NewRigModal
        isOpen={isNewRigOpen}
        onClose={() => setIsNewRigOpen(false)}
        onAddConvoy={handleAddConvoy}
      />

      <BeadDetailModal
        bead={selectedBead}
        onClose={() => setSelectedBead(null)}
        onUpdateStatus={handleUpdateBeadStatus}
        onUpdateAssignee={handleUpdateBeadAssignee}
        onDeleteBead={handleDeleteBead}
      />

      <AgentDetailModal
        agent={selectedAgent}
        onClose={() => setSelectedAgent(null)}
        onToggleStatus={handleToggleAgentStatus}
      />

      <ConvoyDetailModal
        convoy={selectedConvoy}
        onClose={() => setSelectedConvoy(null)}
        onSelectBead={(beadId) => {
          const found = beads.find((b) => b.id === beadId);
          if (found) {
            setSelectedConvoy(null);
            setSelectedBead(found);
          }
        }}
        beads={beads}
      />

      <SpinUpAgentModal
        isOpen={isSpinUpModalOpen}
        onClose={() => setIsSpinUpModalOpen(false)}
        onAgentCreated={handleAgentCreated}
        onRunTestTask={handleRunTestTask}
      />
      
      {/* Mobile Bottom Navigation - Compact, scroll-safe, and landscape-viewport optimized */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 h-14 xs:h-16 pb-[env(safe-area-inset-bottom)] bg-[#0d1117]/95 backdrop-blur-lg border-t border-zinc-800/80 z-40 flex items-center justify-between px-2 overflow-x-auto no-scrollbar select-none gap-1 max-w-xl mx-auto shadow-[0_-8px_24px_rgba(0,0,0,0.6)]">
        <button 
          onClick={() => { setActiveNav('overview'); setIsSidebarOpen(false); }} 
          className={`flex flex-col items-center justify-center flex-1 min-w-[50px] h-full gap-1 transition-all relative ${activeNav === 'overview' ? 'text-yellow-400 font-bold scale-105' : 'text-zinc-500 hover:text-zinc-400'}`}
        >
          {activeNav === 'overview' && <span className="absolute top-0 inset-x-2 h-0.5 bg-yellow-400 rounded-full animate-pulse" />}
          <LayoutGrid className="w-4 h-4 xs:w-5 xs:h-5" />
          <span className="text-[8px] xs:text-[9px] font-medium tracking-wide">Overview</span>
        </button>
        
        <button 
          onClick={() => { setActiveNav('beads'); setIsSidebarOpen(false); }} 
          className={`flex flex-col items-center justify-center flex-1 min-w-[50px] h-full gap-1 transition-all relative ${activeNav === 'beads' ? 'text-blue-400 font-bold scale-105' : 'text-zinc-500 hover:text-zinc-400'}`}
        >
          {activeNav === 'beads' && <span className="absolute top-0 inset-x-2 h-0.5 bg-blue-400 rounded-full animate-pulse" />}
          <div className="relative">
            <Hexagon className="w-4 h-4 xs:w-5 xs:h-5" />
            {openCount > 0 ? (
              <span className="absolute -top-1 -right-1 px-1 py-0.5 text-[7px] font-bold font-mono bg-red-500 text-white rounded-full leading-none scale-75">
                {openCount}
              </span>
            ) : (
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-blue-500 rounded-full" />
            )}
          </div>
          <span className="text-[8px] xs:text-[9px] font-medium tracking-wide">Beads</span>
        </button>

        <button 
          onClick={() => { setActiveNav('agents'); setIsSidebarOpen(false); }} 
          className={`flex flex-col items-center justify-center flex-1 min-w-[50px] h-full gap-1 transition-all relative ${activeNav === 'agents' ? 'text-green-400 font-bold scale-105' : 'text-zinc-500 hover:text-zinc-400'}`}
        >
          {activeNav === 'agents' && <span className="absolute top-0 inset-x-2 h-0.5 bg-green-400 rounded-full animate-pulse" />}
          <Bot className="w-4 h-4 xs:w-5 xs:h-5" />
          <span className="text-[8px] xs:text-[9px] font-medium tracking-wide">Agents</span>
        </button>

        <button 
          onClick={() => { setActiveNav('mail'); setIsSidebarOpen(false); }} 
          className={`flex flex-col items-center justify-center flex-1 min-w-[50px] h-full gap-1 transition-all relative ${activeNav === 'mail' ? 'text-amber-400 font-bold scale-105' : 'text-zinc-500 hover:text-zinc-400'}`}
        >
          {activeNav === 'mail' && <span className="absolute top-0 inset-x-2 h-0.5 bg-amber-400 rounded-full animate-pulse" />}
          <div className="relative">
            <Mail className="w-4 h-4 xs:w-5 xs:h-5" />
            {unreadMailCount > 0 && (
              <span className="absolute -top-1 -right-1.5 px-1 py-0.5 text-[7px] font-bold font-mono bg-amber-500 text-zinc-950 rounded-full animate-pulse leading-none scale-75 shadow-md">
                {unreadMailCount}
              </span>
            )}
          </div>
          <span className="text-[8px] xs:text-[9px] font-medium tracking-wide">Mail</span>
        </button>

        <button 
          onClick={() => { setActiveNav('kilo-terminal'); setIsSidebarOpen(false); }} 
          className={`flex flex-col items-center justify-center flex-1 min-w-[50px] h-full gap-1 transition-all relative ${activeNav === 'kilo-terminal' ? 'text-yellow-400 font-bold scale-105' : 'text-zinc-500 hover:text-zinc-400'}`}
        >
          {activeNav === 'kilo-terminal' && <span className="absolute top-0 inset-x-2 h-0.5 bg-yellow-400 rounded-full animate-pulse" />}
          <Brain className="w-4 h-4 xs:w-5 xs:h-5 text-yellow-400" />
          <span className="text-[8px] xs:text-[9px] font-medium tracking-wide">Console</span>
        </button>

        <button 
          onClick={() => { setActiveNav('tracker'); setIsSidebarOpen(false); }} 
          className={`flex flex-col items-center justify-center flex-1 min-w-[50px] h-full gap-1 transition-all relative ${activeNav === 'tracker' ? 'text-[#e5ff55]' : 'text-zinc-500 hover:text-zinc-400'}`}
        >
          {activeNav === 'tracker' && <span className="absolute top-0 inset-x-2 h-0.5 bg-[#e5ff55] rounded-full animate-pulse" />}
          <div className="relative">
            <CheckCircle2 className="w-4 h-4 xs:w-5 xs:h-5" />
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-[#e5ff55] rounded-full" />
          </div>
          <span className="text-[8px] xs:text-[9px] font-medium tracking-wide">Tracker</span>
        </button>
      </div>

      {/* Kudbee AI Slide-Up Terminal Drawer */}
      <KudbeeTerminal
        isOpen={isGrokTerminalOpen}
        onClose={() => setIsGrokTerminalOpen(false)}
        beads={beads}
        onUpdateBeadStatus={handleUpdateBeadStatus}
        onUpdateBeadAssignee={handleUpdateBeadAssignee}
        onAddBead={handleAddBead}
        agents={agents}
        convoys={convoys}
        activeModel={activeModel}
        setActiveModel={setActiveModel}
        onMintThinkTokens={handleMintThinkTokens}
      />
    </div>
  );
}
