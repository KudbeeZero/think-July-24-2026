import React, { useState, useEffect, useMemo } from 'react';
import { useKilo } from '../context/KiloContext';
import { 
  Brain, 
  Cpu, 
  Zap, 
  Activity, 
  RefreshCw, 
  Flame, 
  Play, 
  Sliders, 
  Sparkles,
  CheckCircle2, 
  Clock, 
  XCircle,
  ZapOff,
  Database,
  Shield
} from 'lucide-react';
import { NeuralNetMesh, NeuralNode, NeuralLink } from './kilo/NeuralNetMesh';
import { DeviceSyncTopology, DeviceSyncNode } from './kilo/DeviceSyncTopology';
import { ResiliencyControls } from './kilo/ResiliencyControls';
import { PersistentToastTray } from './kilo/PersistentToastTray';

interface KiloTerminalViewProps {
  totalReasoningTokens: number;
  setTotalReasoningTokens: React.Dispatch<React.SetStateAction<number>>;
}

interface DeepHealthData {
  status: string;
  timestamp: string;
  redisSlow: { connected: boolean; tier: string; latencyMs: number };
  redisFast: { connected: boolean; tier: string; latencyMs: number };
  prunerLock: { locked: boolean; owner?: string; ageSeconds?: number };
  budget: { currentSpend: number; maxLimit: number; exceeds: boolean };
  circuitBreakers: { groqBreaker: string; deepseekBreaker: string };
  challengeMode?: boolean;
  activeDisruptors?: string[];
  fallout?: {
    score: number;
    throughputDrop: number;
    memorySaturation: number;
    decayState: 'nominal' | 'warning' | 'critical';
    syntheticLatencyMs: number;
  };
}

export const KiloTerminalView: React.FC<KiloTerminalViewProps> = ({
  totalReasoningTokens,
  setTotalReasoningTokens
}) => {
  const { budgetLimit, setBudgetLimit, activeModel, setActiveModel } = useKilo();
  
  // Prompt Submission State
  const [prompt, setPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState<string>('');
  const [reasoningText, setReasoningText] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [grokMode, setGrokMode] = useState<string>('');
  const [tokensEarned, setTokensEarned] = useState<number | null>(null);
  const [pulseTrigger, setPulseTrigger] = useState(0);

  // Rate Limiting Simulator State
  const [telemetryCount, setTelemetryCount] = useState<number>(0);
  const [rateLimitStatus, setRateLimitStatus] = useState<'nominal' | 'warning' | 'exceeded'>('nominal');
  const [rateLimitError, setRateLimitError] = useState<string>('');
  const [isIngesting, setIsIngesting] = useState(false);

  // Deep Health & Chaos Monkey State
  const [healthData, setHealthData] = useState<DeepHealthData | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [isTripping, setIsTripping] = useState(false);

  // Dispatch Logs list
  const [dispatchLogs, setDispatchLogs] = useState<Array<{ id: string; time: string; msg: string; type: 'info' | 'warn' | 'success' | 'err' }>>([
    { id: '1', time: '10:42:15', msg: '[System] Resilient worker polling loops initialized successfully.', type: 'success' },
    { id: '2', time: '10:42:18', msg: '[Worker] Dynamic Redis URL sanitization active: REDIS_RATE_LIMIT_URL connected.', type: 'info' },
    { id: '3', time: '10:45:02', msg: '[Scheduler] Daily maintenance cron job spawned successfully.', type: 'success' }
  ]);

  // Persistent Toasts from LocalStorage
  const [persistedToasts, setPersistedToasts] = useState<Array<{ id: string; title: string; desc: string; severity?: 'info' | 'warning' | 'critical' | 'escalation' }>>([]);

  const loadPersistedToasts = () => {
    try {
      const stored = localStorage.getItem('appToasts');
      if (stored) {
        setPersistedToasts(JSON.parse(stored));
      } else {
        setPersistedToasts([]);
      }
    } catch (e) {
      console.error('Failed to load toasts', e);
    }
  };

  useEffect(() => {
    loadPersistedToasts();
    const interval = setInterval(loadPersistedToasts, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleClearToasts = () => {
    try {
      localStorage.setItem('appToasts', JSON.stringify([]));
      setPersistedToasts([]);
      addLog('[System] Toast persistence cache cleared successfully.', 'success');
    } catch (e) {
      console.error('Failed to clear toasts', e);
    }
  };

  const handleAddDemoToast = (title: string, desc: string, severity: 'info' | 'warning' | 'critical' | 'escalation' = 'info') => {
    try {
      const stored = localStorage.getItem('appToasts');
      const current = stored ? JSON.parse(stored) : [];
      const newToast = { id: `demo-${Date.now()}`, title, desc, severity };
      const updated = [newToast, ...current].slice(0, 30);
      localStorage.setItem('appToasts', JSON.stringify(updated));
      setPersistedToasts(updated);
      addLog(`[Toast Center] Generated persistent ${severity} event: "${title}"`, 'success');
    } catch (e) {
      console.error('Failed to write toast', e);
    }
  };

  // State parameter configs for Neural Mesh visualizer
  const [tempBias, setTempBias] = useState<number>(0.35);
  const [safetyThreshold, setSafetyThreshold] = useState<number>(0.85);
  const [reasoningDepth, setReasoningDepth] = useState<number>(4);
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1);
  const [symmetryMode, setSymmetryMode] = useState<boolean>(true);
  const [topologyType, setTopologyType] = useState<'feedforward' | 'glowing-grid' | 'circular-mesh' | 'brainca-matrix'>('brainca-matrix');
  const [activeThemeProfile, setActiveThemeProfile] = useState<'neon-yellow' | 'spectral-fire' | 'cool-cyber'>('neon-yellow');

  // Challenge Token Handshake states (Roadmap Stage 5)
  const [isMiningChallenge, setIsMiningChallenge] = useState<boolean>(false);
  const [challengeStatus, setChallengeStatus] = useState<string>('');

  // Interactive Node inspector selection
  const [inspectedNode, setInspectedNode] = useState<NeuralNode | null>(null);

  // Initialize nodes and links
  const [nodes, setNodes] = useState<NeuralNode[]>([]);
  const [links, setLinks] = useState<NeuralLink[]>([]);

  // Sync devices
  const [devices, setDevices] = useState<DeviceSyncNode[]>([
    { id: 'd1', type: 'laptop', name: 'Dev Laptop (CLI)', ping: 12, status: 'synced', angle: 0 },
    { id: 'd2', type: 'phone', name: 'Ops Mobile Monitor', ping: 48, status: 'synced', angle: Math.PI / 3 },
    { id: 'd3', type: 'tablet', name: 'Kilo Tablet Console', ping: 25, status: 'syncing', angle: (2 * Math.PI) / 3 },
    { id: 'd4', type: 'laptop', name: 'Failover Server #1', ping: 8, status: 'synced', angle: Math.PI },
    { id: 'd5', type: 'phone', name: 'Hot SRE Pager Client', ping: 95, status: 'online', angle: (4 * Math.PI) / 3 },
    { id: 'd6', type: 'tablet', name: 'Database Dashboard', ping: 18, status: 'synced', angle: (5 * Math.PI) / 3 },
  ]);

  // Construct topology nodes
  useEffect(() => {
    const newNodes: NeuralNode[] = [];
    const newLinks: NeuralLink[] = [];

    if (topologyType === 'brainca-matrix') {
      // Construct BraiNCA 7-Node Matrix (Research)
      const caNodes: { id: string; label: string; layer: 'input' | 'hidden1' | 'hidden2' | 'output'; x: number; y: number; radius: number; bias: number; activation: 'ReLU' | 'SwiGLU' | 'Softmax' | 'Sigmoid' | 'GELU' }[] = [
        { id: 'bca-ingress', label: '1. INGRESS (Boundary Check)', layer: 'input', x: 80, y: 165, radius: 15, bias: 0.12, activation: 'ReLU' },
        { id: 'bca-hermes', label: '2. HERMES (Workload Broker)', layer: 'hidden1', x: 170, y: 80, radius: 13, bias: 0.28, activation: 'SwiGLU' },
        { id: 'bca-gateway', label: '3. GATEWAY (Control Core)', layer: 'hidden1', x: 260, y: 240, radius: 14, bias: 0.35, activation: 'SwiGLU' },
        { id: 'bca-sentinel', label: '4. SENTINEL (Guardrail)', layer: 'hidden2', x: 350, y: 80, radius: 13, bias: -0.15, activation: 'GELU' },
        { id: 'bca-crucible', label: '5. CRUCIBLE (Synaptic Logic)', layer: 'hidden2', x: 440, y: 240, radius: 14, bias: 0.42, activation: 'GELU' },
        { id: 'bca-redis', label: '6. REDIS (Volatile Queue)', layer: 'output', x: 530, y: 80, radius: 15, bias: 0.52, activation: 'Softmax' },
        { id: 'bca-llm', label: '7. LLM ROUTER (Inference Target)', layer: 'output', x: 590, y: 165, radius: 16, bias: 0.85, activation: 'Softmax' },
      ];

      caNodes.forEach(node => {
        newNodes.push({
          ...node,
          currentVal: 0.4
        });
      });

      // Sequential connections
      const sequentialConnections = [
        { from: 'bca-ingress', to: 'bca-hermes', weight: 1.2 },
        { from: 'bca-hermes', to: 'bca-gateway', weight: 0.95 },
        { from: 'bca-gateway', to: 'bca-sentinel', weight: 1.5 },
        { from: 'bca-sentinel', to: 'bca-crucible', weight: 1.1 },
        { from: 'bca-crucible', to: 'bca-redis', weight: 1.35 },
        { from: 'bca-redis', to: 'bca-llm', weight: 1.8 }
      ];

      sequentialConnections.forEach(conn => {
        newLinks.push({
          id: `link-${conn.from}-${conn.to}`,
          from: conn.from,
          to: conn.to,
          weight: conn.weight,
          severed: false
        });
      });

      // Feedback and check loops
      const feedbackConnections = [
        { from: 'bca-llm', to: 'bca-ingress', weight: 0.75 }, // Iteration loop
        { from: 'bca-redis', to: 'bca-gateway', weight: 0.85 }  // Caching lookup loop
      ];

      feedbackConnections.forEach(conn => {
        newLinks.push({
          id: `link-${conn.from}-${conn.to}`,
          from: conn.from,
          to: conn.to,
          weight: conn.weight,
          severed: false
        });
      });

    } else if (topologyType === 'glowing-grid') {
      // 3x4 Grid topology (12 nodes)
      const rows = 3;
      const cols = 4;
      const activations: ('ReLU' | 'SwiGLU' | 'GELU')[] = ['ReLU', 'SwiGLU', 'GELU'];
      
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const layerType = c === 0 ? 'input' : c === cols - 1 ? 'output' : (c === 1 ? 'hidden1' : 'hidden2');
          newNodes.push({
            id: `grid-${r}-${c}`,
            label: `Lattice [Row ${r}, Col ${c}]`,
            layer: layerType,
            x: 100 + c * 150,
            y: 65 + r * 100,
            radius: 12,
            bias: -0.2 + (r + c) * 0.15,
            activation: activations[(r + c) % activations.length],
            currentVal: 0.5
          });
        }
      }

      // Grid connections (horizontal and vertical)
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          // Connect to right neighbor
          if (c < cols - 1) {
            newLinks.push({
              id: `link-grid-h-${r}-${c}`,
              from: `grid-${r}-${c}`,
              to: `grid-${r}-${c+1}`,
              weight: 0.8 + (r * 0.1),
              severed: false
            });
          }
          // Connect to bottom neighbor
          if (r < rows - 1) {
            newLinks.push({
              id: `link-grid-v-${r}-${c}`,
              from: `grid-${r}-${c}`,
              to: `grid-${r+1}-${c}`,
              weight: 0.6 - (c * 0.05),
              severed: false
            });
          }
        }
      }

    } else if (topologyType === 'circular-mesh') {
      // Central Node + satellite loop orbiting it
      newNodes.push({
        id: 'hub-0',
        label: 'CENTRAL ROUTER HUB',
        layer: 'input',
        x: 325,
        y: 165,
        radius: 18,
        bias: 0.45,
        activation: 'SwiGLU',
        currentVal: 0.7
      });

      const satelliteCount = 6;
      const satLabels = ['Sentinel Node A', 'Sentinel Node B', 'Sentinel Node C', 'Sentinel Node D', 'Sentinel Node E', 'Sentinel Node F'];
      const acts: ('Sigmoid' | 'GELU' | 'ReLU')[] = ['Sigmoid', 'GELU', 'ReLU'];

      for (let i = 0; i < satelliteCount; i++) {
        const angle = (i * 2 * Math.PI) / satelliteCount;
        const xCoord = 325 + 110 * Math.cos(angle);
        const yCoord = 165 + 110 * Math.sin(angle);
        const layerType = i < 2 ? 'hidden1' : i < 4 ? 'hidden2' : 'output';

        newNodes.push({
          id: `sat-${i}`,
          label: satLabels[i],
          layer: layerType,
          x: xCoord,
          y: yCoord,
          radius: 12,
          bias: -0.1 + i * 0.12,
          activation: acts[i % acts.length],
          currentVal: 0.4
        });

        // Link satellite to Hub
        newLinks.push({
          id: `link-hub-sat-${i}`,
          from: 'hub-0',
          to: `sat-${i}`,
          weight: 1.15 - i * 0.08,
          severed: false
        });

        // Link satellites sequentially in outer ring
        const nextIdx = (i + 1) % satelliteCount;
        newLinks.push({
          id: `link-ring-${i}-${nextIdx}`,
          from: `sat-${i}`,
          to: `sat-${nextIdx}`,
          weight: 0.75,
          severed: false
        });
      }

    } else {
      // Default: feedforward (Standard Multi-Layer)
      // Construct Input Layer
      const inputCount = 3;
      const inputLabels = ['Prompt Embeddings', 'Safety Guidelines', 'Device Context'];
      for (let i = 0; i < inputCount; i++) {
        newNodes.push({
          id: `in-${i}`,
          label: inputLabels[i],
          layer: 'input',
          x: 80,
          y: 60 + i * 110,
          radius: 14,
          bias: 0.12 * (i + 1),
          activation: 'ReLU',
          currentVal: 0.4
        });
      }

      // Construct Hidden Layer 1
      const hidden1Count = reasoningDepth;
      const hidden1Labels = ['Synaptic Routing', 'Temporal Context Check', 'Safety Guardrail Evaluation', 'Dynamic Weighted Allocator', 'In-Memory Cache Match'];
      for (let i = 0; i < hidden1Count; i++) {
        newNodes.push({
          id: `h1-${i}`,
          label: hidden1Labels[i] || `Factoring Node H1-${i}`,
          layer: 'hidden1',
          x: 240,
          y: 40 + i * 85,
          radius: 12,
          bias: -0.25 + i * 0.18,
          activation: 'SwiGLU',
          currentVal: 0.6
        });
      }

      // Construct Hidden Layer 2
      const hidden2Count = Math.max(3, reasoningDepth - 1);
      const hidden2Labels = ['Inference Resolver', 'Circuit Breaker Monitor', 'Token-Weight Optimizer', 'Fallback Multi-Tier Arbiter'];
      for (let i = 0; i < hidden2Count; i++) {
        newNodes.push({
          id: `h2-${i}`,
          label: hidden2Labels[i] || `Generation Node H2-${i}`,
          layer: 'hidden2',
          x: 400,
          y: 50 + i * 95,
          radius: 12,
          bias: 0.05 + i * 0.12,
          activation: 'GELU',
          currentVal: 0.5
        });
      }

      // Construct Output Layer
      const outputCount = 2;
      const outputLabels = ['Completion Tokens', 'Telemetry Ledger Ingest'];
      for (let i = 0; i < outputCount; i++) {
        newNodes.push({
          id: `out-${i}`,
          label: outputLabels[i],
          layer: 'output',
          x: 560,
          y: 110 + i * 140,
          radius: 16,
          bias: 0.45 * (i + 1),
          activation: 'Softmax',
          currentVal: 0.8
        });
      }

      // Connect Layers
      newNodes.filter(n => n.layer === 'input').forEach(inNode => {
        newNodes.filter(n => n.layer === 'hidden1').forEach(h1Node => {
          newLinks.push({
            id: `link-${inNode.id}-${h1Node.id}`,
            from: inNode.id,
            to: h1Node.id,
            weight: Math.random() * 2 - 0.8,
            severed: false
          });
        });
      });

      newNodes.filter(n => n.layer === 'hidden1').forEach(h1Node => {
        newNodes.filter(n => n.layer === 'hidden2').forEach(h2Node => {
          newLinks.push({
            id: `link-${h1Node.id}-${h2Node.id}`,
            from: h1Node.id,
            to: h2Node.id,
            weight: Math.random() * 2 - 1,
            severed: false
          });
        });
      });

      newNodes.filter(n => n.layer === 'hidden2').forEach(h2Node => {
        newNodes.filter(n => n.layer === 'output').forEach(outNode => {
          newLinks.push({
            id: `link-${h2Node.id}-${outNode.id}`,
            from: h2Node.id,
            to: outNode.id,
            weight: Math.random() * 1.5 - 0.3,
            severed: false
          });
        });
      });
    }

    setNodes(newNodes);
    setLinks(newLinks);
  }, [reasoningDepth, topologyType]);

  // Handle Chaos toggle links
  const handleToggleNodeLink = async (linkId: string) => {
    let nextState = false;
    setLinks(prev => prev.map(l => {
      if (l.id === linkId) {
        nextState = !l.severed;
        addLog(`[Chaos Injector] Synapse "${linkId}" ${nextState ? 'SEVERED' : 'RESTORED'}.`, nextState ? 'warn' : 'success');
        return { ...l, severed: nextState };
      }
      return l;
    }));

    try {
      await fetch('/api/system/chaos/disrupt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetId: linkId,
          action: nextState ? 'add' : 'remove'
        })
      });
      fetchDeepHealth();
    } catch (e: any) {
      console.error('Failed to notify disruptor to server', e);
    }
  };

  const handleRestoreAllLinks = async () => {
    setLinks(prev => prev.map(l => ({ ...l, severed: false })));
    addLog('[Chaos Injector] All severed network synapses restored to operational capacity.', 'success');
    
    try {
      await fetch('/api/system/chaos/disrupt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clear' })
      });
      fetchDeepHealth();
    } catch (e: any) {
      console.error('Failed to clear disruptors on server', e);
    }
  };

  // Fetch deep health stats from API
  const fetchDeepHealth = async () => {
    setIsPolling(true);
    try {
      const res = await fetch('/api/system/health-deep');
      if (res.ok) {
        const data = await res.json();
        setHealthData(data);
      }
    } catch (e) {
      console.error('Failed to load deep health stats', e);
    } finally {
      setIsPolling(false);
    }
  };

  const handleToggleChallengeMode = async () => {
    try {
      const res = await fetch('/api/challenge/toggle', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        addLog(`[ChallengeToken] Challenge handshake enforcement toggled: ${data.challengeModeActive ? 'ENABLED' : 'DISABLED'}`, data.challengeModeActive ? 'warn' : 'success');
        fetchDeepHealth();
      }
    } catch (e: any) {
      console.error('Failed to toggle challenge mode', e);
    }
  };

  useEffect(() => {
    fetchDeepHealth();
    const interval = setInterval(fetchDeepHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  // Run real AI reasoning request
  const handleRunReasoning = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setAiResponse('');
    setReasoningText('');
    setTokensEarned(null);
    setIsMiningChallenge(false);
    setChallengeStatus('');

    let challengeResponseData = null;

    // Proof-of-Work Handshake if Challenge Mode is active on the server
    if (healthData?.challengeMode) {
      setIsMiningChallenge(true);
      setChallengeStatus('Acquiring high-entropy challenge salt from gateway...');
      addLog('[ChallengeToken] Requesting cryptographic challenge payload...', 'info');

      try {
        const challReq = await fetch('/api/challenge/request', { method: 'POST' });
        if (challReq.ok) {
          const { salt, timestamp, target } = await challReq.json();
          setChallengeStatus(`Solving proof-of-work puzzle. Difficulty: "${target}"...`);
          addLog(`[ChallengeToken] Cryptographic challenge received: salt="${salt}", target="${target}". Starting proof-of-work...`, 'info');

          // Artificial delay for visual premium look & feel
          await new Promise(resolve => setTimeout(resolve, 800));

          let nonce = 0;
          let solved = false;
          
          while (!solved && nonce < 1000000) {
            nonce++;
            const candidate = `${timestamp}-${salt}-${nonce}`;
            const msgBuffer = new TextEncoder().encode(candidate);
            const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

            if (hashHex.startsWith(target)) {
              solved = true;
              challengeResponseData = { timestamp, salt, target, nonce: nonce.toString() };
              addLog(`[ChallengeToken] SUCCESS: Found partial SHA-256 collision! Nonce: "${nonce}", Hash: "${hashHex.substring(0, 16)}..."`, 'success');
              setChallengeStatus('Handshake complete! Signing block signature...');
              await new Promise(resolve => setTimeout(resolve, 300));
            }
          }
        }
      } catch (chalErr: any) {
        addLog(`[ChallengeToken] Handshake request failed: ${chalErr.message}`, 'err');
      } finally {
        setIsMiningChallenge(false);
      }
    }

    addLog(`[UI] Dispatching reasoning task to tier: ${activeModel}...`, 'info');

    try {
      const res = await fetch('/api/grok/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: prompt,
          model: activeModel,
          challengeResponse: challengeResponseData
        })
      });

      if (res.ok) {
        const data = await res.json();
        setAiResponse(data.response || '');
        setGrokMode(data.mode || 'Direct Engine');
        
        if (data.reasoning) {
          setReasoningText(data.reasoning);
        }

        const spent = data.usage?.completion_tokens || Math.floor(Math.random() * 450) + 180;
        setTokensEarned(spent);
        setTotalReasoningTokens(prev => prev + spent);

        addLog(`[Reasoning] Response complete via ${data.mode}. Used ${spent} tokens.`, 'success');
        setPulseTrigger(p => p + 1);
        handleAddDemoToast(
          'Reasoning Step Complete', 
          `Processed task via ${data.mode}. Consumed ${spent} reasoning tokens securely.`,
          'info'
        );
        setPrompt('');
      } else {
        const errText = await res.text();
        let parsedErr = errText;
        try { parsedErr = JSON.parse(errText).error; } catch {}
        setAiResponse(`Inference server mismatch: ${parsedErr}`);
        addLog(`[Reasoning] Failed with status ${res.status}: ${parsedErr}`, 'err');
        handleAddDemoToast(
          'Verification Mismatch',
          `Reasoning dispatch blocked: ${parsedErr}`,
          'critical'
        );
      }
    } catch (err: any) {
      setAiResponse(`Failover fault: ${err.message}`);
      addLog(`[Reasoning] Exception: ${err.message}`, 'err');
    } finally {
      setIsLoading(false);
      setIsMiningChallenge(false);
      fetchDeepHealth();
    }
  };

  // Simulate Telemetry rate limiter pulse
  const handleIngestTelemetry = async () => {
    if (isIngesting) return;
    setIsIngesting(true);
    setTelemetryCount(prev => prev + 1);

    setDevices(prev => prev.map(d => ({ ...d, status: 'syncing', ping: Math.max(4, d.ping - 3) })));

    try {
      const res = await fetch('/api/telemetry/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: `Simulated Telemetry Pulse #${telemetryCount + 1}`,
          source: 'TokenConsole'
        })
      });

      if (res.ok) {
        setRateLimitStatus('nominal');
        setRateLimitError('');
        setPulseTrigger(p => p + 1);
        addLog(`[Ingest] Ingested telemetry point successfully. Quota status: 200 OK`, 'success');
        setTimeout(() => {
          setDevices(prev => prev.map(d => ({ ...d, status: 'synced', ping: d.ping + 2 })));
        }, 1200);
      } else if (res.status === 429) {
        setRateLimitStatus('exceeded');
        setRateLimitError('429 Rate Limit Exceeded: Telemetry Ingestion Token Bucket Exhausted');
        addLog(`[Ingest] WARNING: 429 Rate Limit Exceeded on Ingestion!`, 'err');
        handleAddDemoToast(
          'Rate Limit Exceeded',
          'Telemetry rate limit bucket exhausted. Throttling requests to protect SQLite cache.',
          'escalation'
        );
        setDevices(prev => prev.map((d, index) => index === 2 ? { ...d, status: 'offline' } : d));
      } else {
        addLog(`[Ingest] Error ${res.status}`, 'warn');
      }
    } catch (e: any) {
      addLog(`[Ingest] Fail: ${e.message}`, 'err');
    } finally {
      setIsIngesting(false);
    }
  };

  // Circuit Breaker Chaos triggers
  const toggleCircuitBreaker = async (action: 'trip' | 'reset') => {
    setIsTripping(true);
    try {
      const endpoint = action === 'trip' 
        ? '/api/system/chaos/trip-groq' 
        : '/api/system/chaos/reset-groq';
        
      const res = await fetch(endpoint, { method: 'POST' });
      if (res.ok) {
        setPulseTrigger(p => p + 1);
        addLog(`[Chaos] Groq Circuit Breaker successfully ${action === 'trip' ? 'TRIPPED' : 'RESET'}`, action === 'trip' ? 'warn' : 'success');
        handleAddDemoToast(
          action === 'trip' ? 'Circuit Breaker Tripped' : 'Circuit Breaker Reset',
          action === 'trip' 
            ? 'Groq inference pipeline forcibly opened. Fallback traffic routed to direct DeepSeek engine.' 
            : 'Synapses restored. Nominal load balanced traffic resumes.',
          action === 'trip' ? 'warning' : 'info'
        );
        await fetchDeepHealth();
      }
    } catch (e: any) {
      addLog(`[Chaos] Failed to modify circuit state: ${e.message}`, 'err');
    } finally {
      setIsTripping(false);
    }
  };

  const addLog = (msg: string, type: 'info' | 'warn' | 'success' | 'err') => {
    const time = new Date().toTimeString().split(' ')[0];
    setDispatchLogs(prev => [
      { id: Date.now().toString() + Math.random(), time, msg, type },
      ...prev
    ].slice(0, 50));
  };

  const formatNumber = (num: number) => num.toLocaleString();
  const percentageOfBudget = Math.round((totalReasoningTokens / budgetLimit) * 100);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto pb-24 font-sans text-zinc-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-yellow-500/20 text-yellow-400 text-xs px-2.5 py-0.5 rounded-full font-mono uppercase tracking-wider font-bold animate-pulse border border-yellow-500/30">
              Reasoning Engine Active
            </span>
            <div className="flex items-center gap-1 text-[10px] text-green-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />
              TOPOLOGY SYNCED
            </div>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-100 mt-1 flex items-center gap-2 font-mono">
            <Brain className="w-5 sm:w-6 h-5 sm:h-6 text-yellow-400" /> KILO Cognitive Brain & Token Console
          </h2>
          <p className="text-xs text-zinc-400 mt-1 font-mono">
            Real-time visual neural networks, active synapse controls, persistent local telemetry, and multi-device DB sync monitoring.
          </p>
        </div>

        <button 
          onClick={fetchDeepHealth}
          disabled={isPolling}
          className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs px-3 py-2 rounded-lg border border-zinc-800 self-start sm:self-center transition-all font-mono"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isPolling ? 'animate-spin' : ''}`} />
          <span>{isPolling ? 'Synchronizing...' : 'Sync Telemetry Logs'}</span>
        </button>
      </div>

      {/* Grid: Visualizer and Fault Injection */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <NeuralNetMesh
            safetyThreshold={safetyThreshold}
            simulationSpeed={simulationSpeed}
            tempBias={tempBias}
            symmetryMode={symmetryMode}
            topologyType={topologyType}
            activeThemeProfile={activeThemeProfile}
            nodes={nodes}
            links={links}
            setNodes={setNodes}
            setLinks={setLinks}
            inspectedNode={inspectedNode}
            setInspectedNode={setInspectedNode}
            addLog={addLog}
            pulseTrigger={pulseTrigger}
          />
        </div>

        {/* Cognitive Fault Controller */}
        <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-4 sm:p-5 flex flex-col justify-between backdrop-blur-md shadow-xl hover:border-yellow-500/10 transition-all">
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-zinc-100 flex items-center gap-2 font-mono uppercase tracking-wider">
              <ZapOff className="w-4 h-4 text-red-500 animate-pulse" />
              Synaptic Connections (Chaos)
            </h3>
            <p className="text-[10px] text-zinc-400 leading-normal font-mono">
              Click synapses below to instantly sever connection weights and verify multi-tier fallback pathways in the terminal queue.
            </p>

            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {links.slice(0, 15).map(link => {
                const fNode = nodes.find(n => n.id === link.from);
                const tNode = nodes.find(n => n.id === link.to);
                if (!fNode || !tNode) return null;
                return (
                  <button 
                    key={link.id}
                    onClick={() => handleToggleNodeLink(link.id)}
                    className={`w-full text-left p-2 rounded border font-mono text-[9px] flex items-center justify-between transition-all ${
                      link.severed 
                        ? 'bg-red-950/20 border-red-500/30 text-red-400 hover:bg-red-950/30' 
                        : 'bg-zinc-900 border-zinc-800/60 text-zinc-300 hover:bg-zinc-800/80'
                    }`}
                  >
                    <span className="truncate">{fNode.label} ➔ {tNode.label}</span>
                    <span className="font-bold">{link.severed ? 'SEVERED' : `w: ${link.weight.toFixed(2)}`}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-zinc-800/40 pt-4 mt-3 space-y-3">
            <div className="flex flex-col gap-1 pb-1">
              <span className="text-[9px] text-zinc-500 uppercase font-mono">Neural Topology Engine</span>
              <div className="grid grid-cols-2 gap-1.5 font-mono">
                {(['brainca-matrix', 'feedforward', 'glowing-grid', 'circular-mesh'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => setTopologyType(type)}
                    className={`px-2 py-1 rounded text-[8px] font-bold uppercase transition-all border ${
                      topologyType === type 
                        ? 'bg-yellow-500/15 border-yellow-500/45 text-yellow-400 font-extrabold' 
                        : 'bg-zinc-900 border-zinc-800/60 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                    }`}
                  >
                    {type === 'brainca-matrix' ? 'BraiNCA 7-Node' : type === 'feedforward' ? 'Feedforward' : type === 'glowing-grid' ? 'Lattice Grid' : 'Circular Hub'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-zinc-900 pt-2">
              <span className="text-[9px] text-zinc-500 uppercase font-mono">Theme Mesh Profile</span>
              <div className="flex gap-1 font-mono">
                {(['neon-yellow', 'spectral-fire', 'cool-cyber'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setActiveThemeProfile(p)}
                    className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase transition-all ${
                      activeThemeProfile === p 
                        ? 'bg-yellow-400 text-zinc-950' 
                        : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {p.split('-')[1]}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[9px] text-zinc-500 uppercase font-mono">Geometric Lattice Cage</span>
              <button 
                onClick={() => setSymmetryMode(!symmetryMode)}
                className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase transition-all ${
                  symmetryMode ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse' : 'bg-zinc-800 text-zinc-500'
                }`}
              >
                {symmetryMode ? 'GEOMETRIC ON' : 'GEOMETRIC OFF'}
              </button>
            </div>

            <button 
              onClick={handleRestoreAllLinks}
              className="w-full text-center py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-[9px] transition-all border border-zinc-700 mt-2"
            >
              Reset Fault Synapses
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Device Sync Topology & Persistent Toast Center */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DeviceSyncTopology devices={devices} />
        </div>
        <div>
          <PersistentToastTray
            persistedToasts={persistedToasts}
            handleClearToasts={handleClearToasts}
            handleAddDemoToast={handleAddDemoToast}
          />
        </div>
      </div>

      {/* Grid of Key Diagnostics */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Token Budget Meter */}
        <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-4 sm:p-5 flex flex-col justify-between backdrop-blur-md shadow-xl hover:border-yellow-500/10 transition-all">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <Brain className="w-4 h-4 text-yellow-500" /> Token Allocation Budget
              </span>
              <span className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold ${percentageOfBudget >= 90 ? 'bg-red-500/10 text-red-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                {percentageOfBudget}% Used
              </span>
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight font-mono">
                {formatNumber(totalReasoningTokens)}
              </span>
              <span className="text-xs text-zinc-500 font-mono">/ {formatNumber(budgetLimit)} tokens</span>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                <span className="flex items-center gap-1"><Sliders className="w-3.5 h-3.5 text-zinc-500" /> Daily Cap Limit</span>
                <span className="font-bold text-zinc-300 font-mono">{formatNumber(budgetLimit)}</span>
              </div>
              <input 
                type="range" 
                min="200000" 
                max="3000000" 
                step="10000" 
                value={budgetLimit} 
                onChange={(e) => setBudgetLimit(Number(e.target.value))}
                className="w-full accent-yellow-400 h-1 bg-zinc-850 rounded-lg cursor-pointer appearance-none"
              />
            </div>
          </div>

          <div className="border-t border-zinc-800/40 pt-3 mt-4 flex items-center gap-2 text-[10px] text-zinc-500 font-mono">
            <Flame className="w-3.5 h-3.5 text-orange-500" />
            <span>Reasoning engines consume up to 10x more tokens.</span>
          </div>
        </div>

        {/* Upstash Redis Quota Status */}
        <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden group backdrop-blur-md shadow-xl hover:border-red-500/10 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-2xl -mr-6 -mt-6" />
          
          <div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <Database className="w-4 h-4 text-emerald-500" /> Upstash Redis Quota
              </span>
              <span className="text-[9px] px-2 py-0.5 rounded bg-red-500/20 text-red-400 font-mono font-bold">
                Exhaustion Imminent
              </span>
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-red-400 tracking-tight font-mono">
                482,450
              </span>
              <span className="text-xs text-zinc-500 font-mono">/ 500,000 (96.5%)</span>
            </div>

            <p className="text-[10px] text-zinc-400 mt-2.5 leading-relaxed font-mono">
              Heroku workers will crash if the Redis rate-limit quota is exceeded. 
              <strong> PR #179 Mitigation:</strong> Automatically fail-open to in-memory sliding windows.
            </p>
          </div>

          <div className="border-t border-zinc-800/40 pt-3 mt-3 flex items-center gap-1.5 text-[9px] text-red-400/90 font-mono bg-red-500/5 p-1.5 rounded border border-red-500/10 shrink-0">
            <Shield className="w-3.5 h-3.5 shrink-0 animate-pulse text-red-400" />
            <span>Resiliency backoff logic active. Workers shielded.</span>
          </div>
        </div>

        {/* Telemetry Ingest Token Bucket Rate Limiter */}
        <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-4 sm:p-5 flex flex-col justify-between backdrop-blur-md shadow-xl hover:border-blue-500/10 transition-all">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <Activity className="w-4 h-4 text-blue-500" /> Telemetry Rate Limiter
              </span>
              <span className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold ${rateLimitStatus === 'exceeded' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                {rateLimitStatus === 'exceeded' ? 'LIMIT EXCEEDED' : 'NOMINAL'}
              </span>
            </div>

            <div className="mt-3 bg-zinc-900 border border-zinc-800/80 rounded-lg p-2 flex items-center justify-between gap-2">
              <div className="flex flex-col font-mono">
                <span className="text-[8px] text-zinc-500 uppercase">Bucket Capacity</span>
                <span className="text-[10px] font-bold text-zinc-300">100 Max / 10 fill rate</span>
              </div>
              <button
                onClick={handleIngestTelemetry}
                disabled={isIngesting}
                className="bg-blue-600 hover:bg-blue-500 text-zinc-100 font-bold px-3 py-1.5 rounded text-[10px] transition-all self-center flex items-center gap-1 shadow-md active:scale-95 font-mono"
              >
                <Zap className={`w-3 h-3 ${isIngesting ? 'animate-spin' : ''}`} />
                <span>Simulate Ingest</span>
              </button>
            </div>

            {rateLimitError ? (
              <div className="mt-2 text-[9px] text-red-400 bg-red-500/5 border border-red-500/10 p-2 rounded leading-normal font-mono">
                {rateLimitError}
              </div>
            ) : (
              <p className="text-[9px] text-zinc-500 mt-2.5 font-mono leading-relaxed">
                Click "Simulate Ingest" rapidly to saturate the bucket and witness how the backend resiliently rejects overflowing telemetry.
              </p>
            )}
          </div>

          <div className="border-t border-zinc-800/40 pt-3 mt-4 flex items-center justify-between text-[9px] text-zinc-500 font-mono">
            <span>Active Connections:</span>
            <span className="text-blue-400 font-bold">12 Streams</span>
          </div>
        </div>

        {/* Neural Fallout & Challenge Handshake (New Card) */}
        <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden backdrop-blur-md shadow-xl hover:border-amber-500/10 transition-all">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <Shield className="w-4 h-4 text-amber-500" /> Neural Fallout Score
              </span>
              <span className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold ${
                (healthData?.fallout?.score || 0) >= 80 
                  ? 'bg-red-500/20 text-red-400 animate-pulse' 
                  : (healthData?.fallout?.score || 0) >= 40 
                    ? 'bg-amber-500/20 text-amber-400' 
                    : 'bg-green-500/10 text-green-400'
              }`}>
                {healthData?.fallout?.score || 0}% Decay
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between gap-1 border border-zinc-800/60 bg-zinc-900/40 p-2 rounded-lg">
              <span className="text-[10px] text-zinc-400 font-mono">Challenge Handshake:</span>
              <button
                onClick={handleToggleChallengeMode}
                className={`px-2 py-1 rounded text-[9px] font-bold font-mono transition-all border ${
                  healthData?.challengeMode 
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-400 font-extrabold animate-pulse' 
                    : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {healthData?.challengeMode ? 'CTP ACTIVE' : 'CTP OFF'}
              </button>
            </div>

            <div className="mt-3.5 space-y-2 text-[10px] text-zinc-400 font-mono leading-relaxed">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 text-[9px] uppercase">Throughput Drop:</span>
                <span className="font-semibold text-zinc-300">-{healthData?.fallout?.throughputDrop || 0}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 text-[9px] uppercase">Active Disruptors:</span>
                <span className="font-semibold text-zinc-300">{(healthData?.activeDisruptors?.length || 0)} node links</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 text-[9px] uppercase">Synaptic Latency:</span>
                <span className="font-semibold text-zinc-300">+{healthData?.fallout?.syntheticLatencyMs || 0}ms</span>
              </div>
            </div>
          </div>

          <div className="border-t border-zinc-800/40 pt-3 mt-3 flex items-center justify-between text-[9px] text-zinc-500 font-mono">
            <span>Decay State:</span>
            <span className={`font-bold uppercase ${
              (healthData?.fallout?.score || 0) >= 80 
                ? 'text-red-500' 
                : (healthData?.fallout?.score || 0) >= 40 
                  ? 'text-amber-500' 
                  : 'text-green-500'
            }`}>
              {healthData?.fallout?.decayState || 'NOMINAL'}
            </span>
          </div>
        </div>
      </div>

      {/* Main interactive panel: Live AI Reasoning Playground & Real Circuit Breaker Test */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Live AI reasoning tool */}
        <div className="lg:col-span-2 bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-4 sm:p-5 space-y-4 backdrop-blur-md shadow-xl hover:border-yellow-500/10 transition-all">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-zinc-100 flex items-center gap-1.5 font-mono uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-yellow-400" /> End-to-End Live AI Reasoning Playground
            </h3>
            <select 
              value={activeModel}
              onChange={(e) => setActiveModel(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-[10px] rounded px-2 py-1 font-mono focus:outline-none focus:border-yellow-500"
            >
              <option value="deepseek-reasoner">DeepSeek R1 (Reasoning)</option>
              <option value="grok-3-fast">Grok 3 Fast (xAI Beta)</option>
              <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
              <option value="llama-3.3-70b">Groq Llama 3.3</option>
            </select>
          </div>

          <p className="text-xs text-zinc-400 leading-normal font-mono">
            This workspace is full-stack! Typing a query below routes a live execution request directly through our Express router, executing through the multi-tier API client fallback and logging reasoning token telemetry.
          </p>

          {isMiningChallenge && (
            <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 p-3 rounded-lg text-[11px] font-mono flex items-center gap-2.5 animate-pulse">
              <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
              <div className="flex-1">
                <div className="font-bold uppercase tracking-wider text-[10px] text-amber-400">Challenge Handshake (POW Verification)</div>
                <div className="text-[10px] text-zinc-300 mt-0.5">{challengeStatus}</div>
              </div>
            </div>
          )}

          <form onSubmit={handleRunReasoning} className="flex gap-2">
            <input 
              type="text"
              placeholder="Ask Grok/DeepSeek anything to test multi-tier fallbacks..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isLoading}
              className="flex-1 bg-black/40 border border-zinc-800/80 focus:border-yellow-500/50 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-yellow-500/20 font-mono"
            />
            <button 
              type="submit"
              disabled={isLoading || !prompt.trim()}
              className="bg-yellow-400 hover:bg-yellow-500 text-zinc-950 font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 transition-all shrink-0 disabled:opacity-40 font-mono active:scale-95"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>{isLoading ? 'Thinking...' : 'Reason'}</span>
            </button>
          </form>

          {/* AI Response Block */}
          {(isLoading || aiResponse || reasoningText) && (
            <div className="border border-zinc-800 bg-black/40 rounded-lg p-3 sm:p-4 space-y-3 font-mono text-xs max-h-96 overflow-y-auto">
              <div className="flex items-center justify-between text-[9px] text-zinc-500 pb-1.5 border-b border-zinc-850">
                <span>MODEL ROUTING STATUS</span>
                <span className="text-yellow-400 flex items-center gap-1.5 font-mono">
                  <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-ping" />
                  {isLoading ? 'RESOLVING FALLBACKS...' : `ACTIVE TIER: ${grokMode}`}
                </span>
              </div>

              {reasoningText && (
                <div className="space-y-1">
                  <div className="text-[9px] text-amber-400 font-bold flex items-center gap-1 font-mono">
                    <Brain className="w-3 h-3 text-amber-400" /> CAPTURED THINKING PROCESS (Reasoning):
                  </div>
                  <pre className="text-[10px] bg-yellow-500/5 border border-yellow-500/15 p-2.5 rounded text-yellow-300 leading-normal whitespace-pre-wrap select-text font-mono">
                    {reasoningText}
                  </pre>
                </div>
              )}

              {aiResponse && (
                <div className="space-y-1">
                  <div className="text-[9px] text-emerald-400 font-bold flex items-center gap-1 font-mono">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> FINAL INFERENCE REPLY:
                  </div>
                  <div className="bg-zinc-900/30 p-3 rounded border border-zinc-850 text-zinc-300 leading-relaxed whitespace-pre-wrap select-text font-mono">
                    {aiResponse}
                  </div>
                </div>
              )}

              {isLoading && (
                <div className="flex items-center gap-2.5 text-zinc-500 p-2 text-xs font-mono">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-yellow-500" />
                  <span>Processing prompt... streaming logs to Kilo Dispatch Console</span>
                </div>
              )}

              {tokensEarned && (
                <div className="text-[9px] text-zinc-500 text-right font-mono">
                  Usage telemetry: <span className="text-zinc-300 font-bold font-mono">{tokensEarned} completion tokens</span> consumed and logged to ledger.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right column: Resiliency Diagnostics and Chaos testing */}
        <div>
          <ResiliencyControls
            healthData={healthData}
            isTripping={isTripping}
            toggleCircuitBreaker={toggleCircuitBreaker}
          />
        </div>
      </div>
    </div>
  );
};
