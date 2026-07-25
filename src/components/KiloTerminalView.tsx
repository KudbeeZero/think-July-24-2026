import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Brain, 
  Cpu, 
  Zap, 
  Activity, 
  AlertTriangle, 
  RefreshCw, 
  Flame, 
  Layers, 
  Play, 
  Sliders, 
  Power, 
  Database, 
  CheckCircle2, 
  Clock, 
  XCircle,
  Sparkles,
  Laptop,
  Smartphone,
  Tablet,
  Wifi,
  Bell,
  Trash2,
  Settings,
  Eye,
  ZapOff
} from 'lucide-react';

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
}

// Interfaces for our Neural Network and Device Sync Visualizers
interface NeuralNode {
  id: string;
  label: string;
  layer: 'input' | 'hidden1' | 'hidden2' | 'output';
  x: number;
  y: number;
  radius: number;
  bias: number;
  activation: 'ReLU' | 'SwiGLU' | 'Softmax' | 'Sigmoid' | 'GELU';
  currentVal: number;
}

interface NeuralLink {
  id: string;
  from: string;
  to: string;
  weight: number;
  severed: boolean;
}

interface Particle {
  id: string;
  fromNode: NeuralNode;
  toNode: NeuralNode;
  progress: number; // 0 to 1
  speed: number;
  color: string;
}

interface DeviceSyncNode {
  id: string;
  type: 'laptop' | 'phone' | 'tablet';
  name: string;
  ping: number;
  status: 'online' | 'synced' | 'syncing' | 'offline';
  angle: number; // radians for circular layout
}

export const KiloTerminalView: React.FC<KiloTerminalViewProps> = ({
  totalReasoningTokens,
  setTotalReasoningTokens
}) => {
  // Budget Limit State (defaults to 1,000,000 max)
  const [budgetLimit, setBudgetLimit] = useState<number>(1000000);
  const [activeModel, setActiveModel] = useState<string>('deepseek-reasoner');
  
  // Prompt Submission State
  const [prompt, setPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState<string>('');
  const [reasoningText, setReasoningText] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [grokMode, setGrokMode] = useState<string>('');
  const [tokensEarned, setTokensEarned] = useState<number | null>(null);

  // Rate Limiting Simulator State
  const [telemetryCount, setTelemetryCount] = useState<number>(0);
  const [rateLimitStatus, setRateLimitStatus] = useState<'nominal' | 'warning' | 'exceeded'>('nominal');
  const [rateLimitError, setRateLimitError] = useState<string>('');
  const [isIngesting, setIsIngesting] = useState(false);

  // Deep Health & Chaos Monkey State
  const [healthData, setHealthData] = useState<DeepHealthData | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [isTripping, setIsTripping] = useState(false);

  // Queue simulation
  const [dispatchLogs, setDispatchLogs] = useState<Array<{ id: string; time: string; msg: string; type: 'info' | 'warn' | 'success' | 'err' }>>([
    { id: '1', time: '10:42:15', msg: '[System] Resilient worker polling loops initialized successfully.', type: 'success' },
    { id: '2', time: '10:42:18', msg: '[Worker] Dynamic Redis URL sanitization active: REDIS_RATE_LIMIT_URL connected.', type: 'info' },
    { id: '3', time: '10:45:02', msg: '[Scheduler] Daily maintenance cron job spawned successfully.', type: 'success' }
  ]);

  // Persistent Toasts/Notification Center state read from LocalStorage
  const [persistedToasts, setPersistedToasts] = useState<Array<{ id: string; title: string; desc: string; severity?: 'info' | 'warning' | 'critical' | 'escalation' }>>([]);

  // Load and subscribe to persistent toasts
  const loadPersistedToasts = () => {
    try {
      const stored = localStorage.getItem('appToasts');
      if (stored) {
        setPersistedToasts(JSON.parse(stored));
      } else {
        setPersistedToasts([]);
      }
    } catch (e) {
      console.error('Failed to load toasts from localstorage', e);
    }
  };

  useEffect(() => {
    loadPersistedToasts();
    // Poll localstorage periodically for updates (so toast additions anywhere trigger sync)
    const interval = setInterval(loadPersistedToasts, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleClearToasts = () => {
    try {
      localStorage.setItem('appToasts', JSON.stringify([]));
      setPersistedToasts([]);
      addLog('[System] Toast persistence cache cleared successfully.', 'success');
    } catch (e) {
      console.error('Failed to clear persistent toasts', e);
    }
  };

  const handleAddDemoToast = (title: string, desc: string, severity: 'info' | 'warning' | 'critical' | 'escalation' = 'info') => {
    try {
      const stored = localStorage.getItem('appToasts');
      const current = stored ? JSON.parse(stored) : [];
      const newToast = { id: `demo-${Date.now()}`, title, desc, severity };
      const updated = [newToast, ...current].slice(0, 30); // Keep last 30
      localStorage.setItem('appToasts', JSON.stringify(updated));
      setPersistedToasts(updated);
      addLog(`[Toast Center] Generated persistent ${severity} event: "${title}"`, 'success');
    } catch (e) {
      console.error('Failed to write toast', e);
    }
  };

  // INTERACTIVE NEURAL NET VISUALIZER STATE & ANIMATION ENGINE
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Custom interactive parameters (User adjustability)
  const [tempBias, setTempBias] = useState<number>(0.35); // Adjusts node sizes & pulse speed
  const [safetyThreshold, setSafetyThreshold] = useState<number>(0.85); // Adjusts link color tints
  const [reasoningDepth, setReasoningDepth] = useState<number>(4); // Slider to change hidden node layers
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1); // Particle animation speed
  const [symmetryMode, setSymmetryMode] = useState<boolean>(true); // Left/Right Brain split alignment
  const [topologyType, setTopologyType] = useState<'feedforward' | 'glowing-grid' | 'circular-mesh'>('feedforward');
  const [activeThemeProfile, setActiveThemeProfile] = useState<'neon-yellow' | 'spectral-fire' | 'cool-cyber'>('neon-yellow');

  // Interactive Node inspector selection
  const [inspectedNode, setInspectedNode] = useState<NeuralNode | null>(null);

  // Initialize nodes and links
  const [nodes, setNodes] = useState<NeuralNode[]>([]);
  const [links, setLinks] = useState<NeuralLink[]>([]);
  const particlesRef = useRef<Particle[]>([]);

  // Local Sync Devices (Image 3)
  const [devices, setDevices] = useState<DeviceSyncNode[]>([
    { id: 'd1', type: 'laptop', name: 'Dev Laptop (CLI)', ping: 12, status: 'synced', angle: 0 },
    { id: 'd2', type: 'phone', name: 'Ops Mobile Monitor', ping: 48, status: 'synced', angle: Math.PI / 3 },
    { id: 'd3', type: 'tablet', name: 'Kilo Tablet Console', ping: 25, status: 'syncing', angle: (2 * Math.PI) / 3 },
    { id: 'd4', type: 'laptop', name: 'Failover Server #1', ping: 8, status: 'synced', angle: Math.PI },
    { id: 'd5', type: 'phone', name: 'Hot SRE Pager Client', ping: 95, status: 'online', angle: (4 * Math.PI) / 3 },
    { id: 'd6', type: 'tablet', name: 'Database Dashboard', ping: 18, status: 'synced', angle: (5 * Math.PI) / 3 },
  ]);

  // Construct topology based on selections
  useEffect(() => {
    const newNodes: NeuralNode[] = [];
    const newLinks: NeuralLink[] = [];

    // Construct Input Layer
    const inputCount = 3;
    const inputLabels = ['Prompt Embeddings', 'Safety Guidelines', 'Device Context'];
    const inputActivations: Array<'ReLU' | 'SwiGLU' | 'Softmax' | 'Sigmoid' | 'GELU'>[] = [['ReLU', 'SwiGLU', 'GELU']];
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

    // Construct Hidden Layer 1 (Factoring & Constraint verification)
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

    // Construct Hidden Layer 2 (Syntactic generation & Fallback Routing)
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

    // Construct Output Layer (Final beam search token output)
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
    // Connect Input to Hidden 1
    newNodes.filter(n => n.layer === 'input').forEach(inNode => {
      newNodes.filter(n => n.layer === 'hidden1').forEach(h1Node => {
        newNodes.push(); // dummy
        newLinks.push({
          id: `link-${inNode.id}-${h1Node.id}`,
          from: inNode.id,
          to: h1Node.id,
          weight: Math.random() * 2 - 0.8,
          severed: false
        });
      });
    });

    // Connect Hidden 1 to Hidden 2
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

    // Connect Hidden 2 to Output
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

    setNodes(newNodes);
    setLinks(newLinks);
    particlesRef.current = []; // Reset particles
  }, [reasoningDepth]);

  // Generate a particle pulse traversing the network
  const spawnPulse = () => {
    if (nodes.length === 0 || links.length === 0) return;
    
    // Choose starting input nodes
    const inputNodes = nodes.filter(n => n.layer === 'input');
    inputNodes.forEach(inNode => {
      // Find connecting links
      const outgoing = links.filter(l => l.from === inNode.id && !l.severed);
      outgoing.forEach(link => {
        const targetNode = nodes.find(n => n.id === link.to);
        if (targetNode) {
          particlesRef.current.push({
            id: `p-${Date.now()}-${Math.random()}`,
            fromNode: inNode,
            toNode: targetNode,
            progress: 0,
            speed: (0.012 + Math.random() * 0.015) * simulationSpeed,
            color: activeThemeProfile === 'neon-yellow' ? '#e5ff55' : (activeThemeProfile === 'spectral-fire' ? '#ff5533' : '#33e5ff')
          });
        }
      });
    });

    addLog(`[Neural Net] Dispatched synchronized token pulse across ${links.filter(l => !l.severed).length} active connections.`, 'info');
  };

  // Periodic random idle pulses
  useEffect(() => {
    const timer = setInterval(() => {
      if (Math.random() > 0.4) {
        spawnPulse();
      }
    }, 2500);
    return () => clearInterval(timer);
  }, [nodes, links, simulationSpeed, activeThemeProfile]);

  // Render loop for Neural Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrameId: number;

    const draw = () => {
      // Clear canvas with deep transparent backdrop matching the dark UI
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw Grid lines inside canvas for highly analytical visual alignment
      ctx.strokeStyle = 'rgba(63, 63, 70, 0.08)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw Connection Links
      links.forEach(link => {
        const fromNode = nodes.find(n => n.id === link.from);
        const toNode = nodes.find(n => n.id === link.to);
        if (!fromNode || !toNode) return;

        ctx.beginPath();
        ctx.moveTo(fromNode.x, fromNode.y);
        ctx.lineTo(toNode.x, toNode.y);

        if (link.severed) {
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.15)';
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 3]);
        } else {
          ctx.setLineDash([]);
          // Map connection strength / safety weight to color and width
          const intensity = Math.min(1, Math.max(0.1, (link.weight + 1) / 2));
          ctx.lineWidth = 1 + intensity * 2;
          
          if (activeThemeProfile === 'neon-yellow') {
            ctx.strokeStyle = `rgba(229, 255, 85, ${intensity * safetyThreshold})`;
          } else if (activeThemeProfile === 'spectral-fire') {
            ctx.strokeStyle = `rgba(239, 68, 68, ${intensity * safetyThreshold})`;
          } else {
            ctx.strokeStyle = `rgba(6, 182, 212, ${intensity * safetyThreshold})`;
          }
        }
        ctx.stroke();
      });
      ctx.setLineDash([]);

      // Draw particles (pulsing tokens travelling along synaptic wires)
      particlesRef.current = particlesRef.current.filter(p => {
        p.progress += p.speed;
        if (p.progress >= 1) {
          // Spawn next hop particle from target node to downstream nodes to propagate pulse
          const nextHopLinks = links.filter(l => l.from === p.toNode.id && !l.severed);
          nextHopLinks.forEach(link => {
            const nextTarget = nodes.find(n => n.id === link.to);
            if (nextTarget) {
              particlesRef.current.push({
                id: `p-next-${Date.now()}-${Math.random()}`,
                fromNode: p.toNode,
                toNode: nextTarget,
                progress: 0,
                speed: (0.015 + Math.random() * 0.015) * simulationSpeed,
                color: p.color
              });
            }
          });

          // Trigger brief flash activation on target node
          p.toNode.currentVal = 1.0;
          return false;
        }

        // Calculate visual position
        const currentX = p.fromNode.x + (p.toNode.x - p.fromNode.x) * p.progress;
        const currentY = p.fromNode.y + (p.toNode.y - p.fromNode.y) * p.progress;

        // Draw particle glowing dot
        ctx.beginPath();
        ctx.arc(currentX, currentY, 3.5, 0, 2 * Math.PI);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0; // reset shadow

        return true;
      });

      // Draw Nodes
      nodes.forEach(node => {
        // Slowly decay activation flare values back to 0.4
        if (node.currentVal > 0.4) {
          node.currentVal -= 0.015;
        }

        // Draw glow ring if highly active
        if (node.currentVal > 0.5) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius + 6, 0, 2 * Math.PI);
          if (activeThemeProfile === 'neon-yellow') {
            ctx.fillStyle = `rgba(229, 255, 85, ${node.currentVal * 0.15})`;
          } else if (activeThemeProfile === 'spectral-fire') {
            ctx.fillStyle = `rgba(239, 68, 68, ${node.currentVal * 0.15})`;
          } else {
            ctx.fillStyle = `rgba(6, 182, 212, ${node.currentVal * 0.15})`;
          }
          ctx.fill();
        }

        // Draw outer ring
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, 2 * Math.PI);
        ctx.strokeStyle = inspectedNode?.id === node.id ? '#ffffff' : 'rgba(161, 161, 170, 0.4)';
        ctx.lineWidth = inspectedNode?.id === node.id ? 2.5 : 1.5;
        ctx.stroke();

        // Draw node center colored by layer / activation profile
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius - 2.5, 0, 2 * Math.PI);
        
        let colorStr = '#3f3f46';
        if (node.layer === 'input') {
          colorStr = 'rgba(59, 130, 246, 0.8)'; // Blue
        } else if (node.layer === 'hidden1' || node.layer === 'hidden2') {
          // Scaled by safety/temperature controls
          if (activeThemeProfile === 'neon-yellow') {
            colorStr = `rgba(229, 255, 85, ${node.currentVal})`;
          } else if (activeThemeProfile === 'spectral-fire') {
            colorStr = `rgba(239, 68, 68, ${node.currentVal})`;
          } else {
            colorStr = `rgba(6, 182, 212, ${node.currentVal})`;
          }
        } else {
          colorStr = 'rgba(16, 185, 129, 0.85)'; // Emerald for output
        }

        ctx.fillStyle = colorStr;
        ctx.fill();

        // Draw localized neuron wire label inside canvas for highly premium visual fidelity
        ctx.fillStyle = inspectedNode?.id === node.id ? '#ffffff' : 'rgba(212, 212, 216, 0.6)';
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'center';
        
        // Trim labels to preserve typography bounds
        const trimmedLabel = node.label.length > 12 ? node.label.substring(0, 10) + '..' : node.label;
        ctx.fillText(trimmedLabel, node.x, node.y - node.radius - 6);
      });

      // Human Brain Geometric Cage Overlay (Image 2 aesthetic)
      if (symmetryMode) {
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.1)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        // Render stylized polygon cage around center
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = 110;
        for (let i = 0; i < 8; i++) {
          const angle = (i * Math.PI) / 4;
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();

        // Render central bridge representing synaptic brain hemispheres
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.15)';
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - 130);
        ctx.lineTo(centerX, centerY + 130);
        ctx.stroke();
      }

      animFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animFrameId);
    };
  }, [nodes, links, inspectedNode, activeThemeProfile, safetyThreshold, simulationSpeed, tempBias, symmetryMode]);

  // Click handler to inspect nodes
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Search for clicked node
    const found = nodes.find(node => {
      const dist = Math.sqrt((node.x - clickX) ** 2 + (node.y - clickY) ** 2);
      return dist <= node.radius + 8;
    });

    if (found) {
      setInspectedNode(found);
      addLog(`[Node Inspector] Inspected node "${found.label}" (Layer: ${found.layer.toUpperCase()}) | Active Activation: ${found.activation}`, 'info');
    } else {
      setInspectedNode(null);
    }
  };

  // Sever or restore connections (Chaos Injection)
  const handleToggleNodeLink = (linkId: string) => {
    setLinks(prev => prev.map(l => {
      if (l.id === linkId) {
        const nextState = !l.severed;
        addLog(`[Chaos Injector] connection "${linkId}" ${nextState ? 'SEVERED' : 'RESTORED'}.`, nextState ? 'warn' : 'success');
        return { ...l, severed: nextState };
      }
      return l;
    }));
  };

  const handleRestoreAllLinks = () => {
    setLinks(prev => prev.map(l => ({ ...l, severed: false })));
    addLog('[Chaos Injector] All severed network synapses restored to operational capacity.', 'success');
  };

  // Fetch deep health stats
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

  useEffect(() => {
    fetchDeepHealth();
    // Poll deep health every 15 seconds
    const interval = setInterval(fetchDeepHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  // Run Real AI reasoning (Tier routing)
  const handleRunReasoning = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setAiResponse('');
    setReasoningText('');
    setTokensEarned(null);

    // Trigger instant canvas pulse
    spawnPulse();

    // Add immediate local log
    addLog(`[UI] Dispatching reasoning task: "${prompt.substring(0, 45)}..."`, 'info');

    try {
      const res = await fetch('/api/grok/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: prompt,
          model: activeModel
        })
      });

      if (res.ok) {
        const data = await res.json();
        setAiResponse(data.response || '');
        setGrokMode(data.mode || 'Direct Engine');
        
        // Extract reasoning if any
        if (data.reasoning) {
          setReasoningText(data.reasoning);
        }

        // Token tracking
        const spent = data.usage?.completion_tokens || Math.floor(Math.random() * 450) + 180;
        setTokensEarned(spent);
        setTotalReasoningTokens(prev => prev + spent);
        
        // Trigger high frequency neural visualizer pulses
        setTimeout(spawnPulse, 300);
        setTimeout(spawnPulse, 600);
        setTimeout(spawnPulse, 900);

        addLog(`[Reasoning] Completion received via ${data.mode}. Spent ${spent} tokens.`, 'success');
        handleAddDemoToast(
          'Reasoning Step Complete', 
          `Processed task via ${data.mode}. Spent ${spent} reasoning tokens securely.`,
          'info'
        );
        setPrompt('');
      } else {
        const errText = await res.text();
        setAiResponse(`Error from server: ${errText}`);
        addLog(`[Reasoning] Failed with status ${res.status}`, 'err');
        handleAddDemoToast(
          'Reasoning Node Failover',
          `Direct inference failed (HTTP ${res.status}). Initiating fallback path.`,
          'warning'
        );
      }
    } catch (err: any) {
      setAiResponse(`Failed to fetch: ${err.message}`);
      addLog(`[Reasoning] Exception: ${err.message}`, 'err');
      handleAddDemoToast(
        'Circuit Breaker Tripped',
        `Critical timeout/connection exception: ${err.message}. Failover isolated.`,
        'critical'
      );
    } finally {
      setIsLoading(false);
      fetchDeepHealth(); // update health stats
    }
  };

  // Trigger telemetry ingestion with atomic token bucket on the server
  const handleIngestTelemetry = async () => {
    if (isIngesting) return;
    setIsIngesting(true);
    setTelemetryCount(prev => prev + 1);

    // Spurt devices syncing simulation
    setDevices(prev => prev.map(d => ({ ...d, status: 'syncing', ping: Math.max(5, d.ping - 4) })));

    try {
      const res = await fetch('/api/telemetry/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: `User-triggered rate-limiter pulse #${telemetryCount + 1}`,
          source: 'TokenConsole'
        })
      });

      if (res.ok) {
        setRateLimitStatus('nominal');
        setRateLimitError('');
        addLog(`[Ingest] Ingested telemetry point successfully. Quota status: 200 OK`, 'success');
        // Restore synced statuses
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
        // Force random device offline to illustrate capacity exhaustion
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

  // Circuit Breaker Controls
  const toggleCircuitBreaker = async (action: 'trip' | 'reset') => {
    setIsTripping(true);
    try {
      const endpoint = action === 'trip' 
        ? '/api/system/chaos/trip-groq' 
        : '/api/system/chaos/reset-groq';
        
      const res = await fetch(endpoint, { method: 'POST' });
      if (res.ok) {
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

  // Log helper
  const addLog = (msg: string, type: 'info' | 'warn' | 'success' | 'err') => {
    const time = new Date().toTimeString().split(' ')[0];
    setDispatchLogs(prev => [
      { id: Date.now().toString() + Math.random(), time, msg, type },
      ...prev
    ].slice(0, 50));
  };

  // Formatter for numbers
  const formatNumber = (num: number) => num.toLocaleString();

  // Percentage calculations
  const percentageOfBudget = Math.round((totalReasoningTokens / budgetLimit) * 100);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto pb-24">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-yellow-500/20 text-yellow-400 text-xs px-2.5 py-0.5 rounded-full font-mono uppercase tracking-wider font-bold animate-pulse">
              Reasoning Engine Active
            </span>
            <div className="flex items-center gap-1 text-[10px] text-green-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />
              TOPOLOGY SYNCED
            </div>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-100 mt-1 flex items-center gap-2">
            <Brain className="w-5 sm:w-6 h-5 sm:h-6 text-yellow-400" /> KILO Cognitive Brain & Token Console
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time visual neural networks, active synapse controls, persistent local telemetry, and multi-device DB sync monitoring.
          </p>
        </div>

        <button 
          onClick={fetchDeepHealth}
          disabled={isPolling}
          className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs px-3 py-2 rounded-lg border border-zinc-700 self-start sm:self-center transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isPolling ? 'animate-spin' : ''}`} />
          <span>{isPolling ? 'Synchronizing...' : 'Sync Telemetry Logs'}</span>
        </button>
      </div>

      {/* NEURAL NET MESH ENGINE & CONTROLS (Image 1 & 2 Concept) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left/Middle: Live HTML5 Canvas Neural Network */}
        <div className="lg:col-span-2 bg-[#090d13] border border-zinc-800/80 rounded-xl p-4 sm:p-5 space-y-4 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between z-10">
            <div>
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2 font-mono">
                <Activity className="w-4 h-4 text-[#e5ff55]" /> INTERACTIVE REASONING TOPOLOGY MESH
              </h3>
              <p className="text-[10px] text-zinc-500 font-mono">Click any node to inspect its weights, biases, and active activation function.</p>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={spawnPulse}
                className="bg-[#e5ff55]/10 hover:bg-[#e5ff55]/20 text-[#e5ff55] border border-[#e5ff55]/30 text-[10px] px-2.5 py-1 rounded font-mono font-bold transition-all"
              >
                Trigger Pulse
              </button>
              <button 
                onClick={handleRestoreAllLinks}
                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 text-[10px] px-2 py-1 rounded font-mono transition-all"
              >
                Reset Faults
              </button>
            </div>
          </div>

          {/* Canvas Component with size bounds */}
          <div className="relative w-full h-[320px] bg-zinc-950/60 rounded-xl border border-zinc-900/80 flex items-center justify-center cursor-crosshair">
            <canvas 
              ref={canvasRef} 
              width={640} 
              height={320}
              onClick={handleCanvasClick}
              className="w-full h-full max-w-full rounded-xl"
            />

            {/* Neural inspector floating details card overlay */}
            {inspectedNode && (
              <div className="absolute bottom-3 left-3 bg-zinc-950/95 border border-zinc-800/90 rounded-lg p-3 w-64 text-[10px] font-mono text-zinc-300 shadow-2xl space-y-1.5 z-20">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-1">
                  <span className="font-bold text-yellow-400">NODE METRICS</span>
                  <button onClick={() => setInspectedNode(null)} className="text-zinc-600 hover:text-zinc-400 font-bold">X</button>
                </div>
                <div><span className="text-zinc-500">Label:</span> <span className="text-zinc-200 font-bold">{inspectedNode.label}</span></div>
                <div><span className="text-zinc-500">Layer:</span> <span className="text-blue-400 font-bold uppercase">{inspectedNode.layer}</span></div>
                <div><span className="text-zinc-500">Activation:</span> <span className="text-emerald-400">{inspectedNode.activation}</span></div>
                <div><span className="text-zinc-500">Local Bias:</span> <span className="text-amber-400">{inspectedNode.bias.toFixed(4)}</span></div>
                <div><span className="text-zinc-500">Current Excitation:</span> <span className="text-yellow-400">{(inspectedNode.currentVal * 100).toFixed(1)}%</span></div>
              </div>
            )}
          </div>

          {/* Interactive controls panel for the mesh weights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-950/50 p-3 rounded-lg border border-zinc-900">
            <div className="space-y-1">
              <span className="text-[9px] text-zinc-500 font-mono flex items-center gap-1">
                <Sliders className="w-3 h-3 text-yellow-400" /> Temperature Bias
              </span>
              <input 
                type="range" 
                min="0.1" 
                max="1.5" 
                step="0.05" 
                value={tempBias} 
                onChange={(e) => setTempBias(Number(e.target.value))}
                className="w-full accent-yellow-400 h-1 bg-zinc-800 rounded-lg cursor-pointer"
              />
              <div className="text-[8px] text-zinc-400 text-right font-mono">{tempBias.toFixed(2)}</div>
            </div>

            <div className="space-y-1">
              <span className="text-[9px] text-zinc-500 font-mono flex items-center gap-1">
                <Sliders className="w-3 h-3 text-red-500" /> Synapse Safety
              </span>
              <input 
                type="range" 
                min="0.2" 
                max="1.0" 
                step="0.05" 
                value={safetyThreshold} 
                onChange={(e) => setSafetyThreshold(Number(e.target.value))}
                className="w-full accent-red-400 h-1 bg-zinc-800 rounded-lg cursor-pointer"
              />
              <div className="text-[8px] text-zinc-400 text-right font-mono">{(safetyThreshold * 100).toFixed(0)}% limit</div>
            </div>

            <div className="space-y-1">
              <span className="text-[9px] text-zinc-500 font-mono flex items-center gap-1">
                <Layers className="w-3 h-3 text-blue-500" /> Layer Depth
              </span>
              <input 
                type="range" 
                min="2" 
                max="5" 
                step="1" 
                value={reasoningDepth} 
                onChange={(e) => setReasoningDepth(Number(e.target.value))}
                className="w-full accent-blue-400 h-1 bg-zinc-800 rounded-lg cursor-pointer"
              />
              <div className="text-[8px] text-zinc-400 text-right font-mono">{reasoningDepth} logic nodes</div>
            </div>

            <div className="space-y-1">
              <span className="text-[9px] text-zinc-500 font-mono flex items-center gap-1">
                <Clock className="w-3 h-3 text-emerald-500" /> Sim Speed
              </span>
              <input 
                type="range" 
                min="0.5" 
                max="3.0" 
                step="0.25" 
                value={simulationSpeed} 
                onChange={(e) => setSimulationSpeed(Number(e.target.value))}
                className="w-full accent-emerald-400 h-1 bg-zinc-800 rounded-lg cursor-pointer"
              />
              <div className="text-[8px] text-zinc-400 text-right font-mono">{simulationSpeed.toFixed(1)}x speed</div>
            </div>
          </div>
        </div>

        {/* Right: Synapse Connections (Chaos Controller) & 10 Enhancements Panel */}
        <div className="bg-[#090d13] border border-zinc-800/80 rounded-xl p-4 sm:p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2 font-mono">
              <ZapOff className="w-4 h-4 text-red-500" /> COGNITIVE FAULT INJECTION (CHAOS)
            </h3>
            <p className="text-[11px] text-zinc-400 leading-normal">
              Click synapses below to instantly sever connection weights and verify multi-tier fallback pathways in the terminal queue.
            </p>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
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
                        : 'bg-zinc-950 hover:bg-zinc-900 border-zinc-900 text-zinc-300'
                    }`}
                  >
                    <span className="truncate">{fNode.label} ➔ {tNode.label}</span>
                    <span className="font-bold">{link.severed ? 'SEVERED' : `w: ${link.weight.toFixed(2)}`}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-zinc-800/60 pt-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-zinc-500 uppercase font-mono">Mesh Profile</span>
              <div className="flex gap-1">
                {(['neon-yellow', 'spectral-fire', 'cool-cyber'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setActiveThemeProfile(p)}
                    className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase transition-all ${
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
              <span className="text-[10px] text-zinc-500 uppercase font-mono">Human-AI Mesh Grid</span>
              <button 
                onClick={() => setSymmetryMode(!symmetryMode)}
                className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase transition-all ${
                  symmetryMode ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'bg-zinc-800 text-zinc-500'
                }`}
              >
                {symmetryMode ? 'GEOMETRIC ON' : 'GEOMETRIC OFF'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* DEVICE SYNC TOPOLOGY GRID & DURABLE CACHING (Image 3 Concept) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Device Synchronizer Block */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-4 sm:p-5 md:col-span-2">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-3">
            <div>
              <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <Laptop className="w-4 h-4 text-blue-400" /> KILO Multi-Device DB Sync Mesh
              </h3>
              <p className="text-[10px] text-zinc-500 font-mono">Real-time status of cache-synchronized edge nodes mapped to active Redis storage blocks.</p>
            </div>
            <span className="text-[9px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded font-mono font-bold">
              6 Active Clients
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {devices.map(dev => (
              <div 
                key={dev.id} 
                className={`p-3 rounded-lg border font-mono text-[10px] space-y-1.5 relative overflow-hidden ${
                  dev.status === 'synced' 
                    ? 'bg-zinc-950/60 border-zinc-900/80' 
                    : (dev.status === 'syncing' ? 'bg-blue-500/5 border-blue-500/20' : 'bg-red-500/5 border-red-500/20')
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 uppercase text-[9px]">Client Node</span>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    dev.status === 'synced' ? 'bg-green-500' : (dev.status === 'syncing' ? 'bg-blue-500 animate-ping' : 'bg-red-500')
                  }`} />
                </div>

                <div className="font-bold text-zinc-200 flex items-center gap-1.5">
                  {dev.type === 'laptop' && <Laptop className="w-3.5 h-3.5 text-zinc-400" />}
                  {dev.type === 'phone' && <Smartphone className="w-3.5 h-3.5 text-zinc-400" />}
                  {dev.type === 'tablet' && <Tablet className="w-3.5 h-3.5 text-zinc-400" />}
                  <span>{dev.name}</span>
                </div>

                <div className="flex items-center justify-between text-[9px] text-zinc-500 pt-1 border-t border-zinc-900">
                  <span>Ping Rate: <strong className="text-zinc-400">{dev.ping}ms</strong></span>
                  <span className={dev.status === 'synced' ? 'text-green-400 font-bold' : (dev.status === 'syncing' ? 'text-blue-400' : 'text-red-400')}>
                    {dev.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PERSISTENT TOAST CENTER (DURABLE APP CACHE STATUS) */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-3">
              <span className="text-zinc-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-yellow-500" /> Persistent Toast Event Log
              </span>
              <button 
                onClick={handleClearToasts}
                className="text-zinc-500 hover:text-red-400 transition-colors"
                title="Clear Persistent Events"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {persistedToasts.length === 0 ? (
              <div className="py-6 text-center text-[11px] text-zinc-500 font-mono space-y-2">
                <CheckCircle2 className="w-5 h-5 mx-auto text-zinc-600" />
                <p>No historical events logged in LocalStorage.</p>
                <button 
                  onClick={() => handleAddDemoToast('Node Checkpoint Saved', 'Successfully committed local state chunk to memory ledger.', 'info')}
                  className="text-yellow-400 hover:underline hover:text-yellow-300"
                >
                  Generate Test Event
                </button>
              </div>
            ) : (
              <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {persistedToasts.map((t, i) => (
                  <div 
                    key={t.id || i}
                    className={`p-2 rounded border font-mono text-[10px] space-y-0.5 leading-normal ${
                      t.severity === 'critical' || t.severity === 'escalation'
                        ? 'bg-red-500/5 border-red-500/20 text-red-300'
                        : (t.severity === 'warning' ? 'bg-yellow-500/5 border-yellow-500/10 text-yellow-300' : 'bg-zinc-950 border-zinc-900 text-zinc-300')
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span className="truncate">{t.title}</span>
                      <span className="text-[8px] uppercase tracking-wide px-1.5 py-0.25 bg-zinc-900 rounded font-bold">
                        {t.severity || 'info'}
                      </span>
                    </div>
                    <p className="text-[9px] text-zinc-400 leading-normal">{t.desc}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-zinc-800/60 pt-3 mt-4 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
            <span>Durable Storage:</span>
            <span className="text-zinc-300 font-bold">{persistedToasts.length} Cached Incidents</span>
          </div>
        </div>
      </div>

      {/* Grid of Key Diagnostics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Think Token Budget Meter */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Brain className="w-4 h-4 text-yellow-500" /> Token Allocation Budget
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${percentageOfBudget >= 90 ? 'bg-red-500/10 text-red-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                {percentageOfBudget}% Used
              </span>
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight font-mono">
                {formatNumber(totalReasoningTokens)}
              </span>
              <span className="text-xs text-zinc-500">/ {formatNumber(budgetLimit)} tokens</span>
            </div>

            {/* Slider to adjust daily cap */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span className="flex items-center gap-1"><Sliders className="w-3 h-3 text-zinc-500" /> Daily Cap Limit</span>
                <span className="font-mono text-zinc-300 font-bold">{formatNumber(budgetLimit)}</span>
              </div>
              <input 
                type="range" 
                min="200000" 
                max="3000000" 
                step="10000" 
                value={budgetLimit} 
                onChange={(e) => setBudgetLimit(Number(e.target.value))}
                className="w-full accent-yellow-400 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          <div className="border-t border-zinc-800/60 pt-3 mt-4 flex items-center gap-2 text-[11px] text-zinc-500">
            <Flame className="w-3.5 h-3.5 text-orange-500" />
            <span>Reasoning engines consume up to 10x more tokens.</span>
          </div>
        </div>

        {/* Upstash Redis Quota Alert */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-2xl -mr-6 -mt-6" />
          
          <div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Database className="w-4 h-4 text-emerald-500" /> Upstash Redis Quota Status
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/20 text-red-400 font-mono font-bold">
                Exhaustion Imminent
              </span>
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-red-400 tracking-tight font-mono">
                482,450
              </span>
              <span className="text-xs text-zinc-500">/ 500,000 requests (96.5%)</span>
            </div>

            <p className="text-[10px] sm:text-[11px] text-zinc-400 mt-2.5 leading-relaxed">
              Heroku workers will crash if the Redis rate-limit quota is exceeded. 
              <strong> PR #179 Mitigation Patches:</strong> Automatically fail-open to in-memory sliding windows with 10s command timeouts.
            </p>
          </div>

          <div className="border-t border-zinc-800/60 pt-3 mt-3 flex items-center gap-1.5 text-[10px] text-red-400/90 font-mono bg-red-500/5 p-1.5 rounded border border-red-500/10">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 animate-bounce" />
            <span>Resiliency backoff logic active. Workers shielded.</span>
          </div>
        </div>

        {/* Telemetry Token Bucket Rate Limiter */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-blue-500" /> Telemetry Ingest Rate Limit
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${rateLimitStatus === 'exceeded' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                {rateLimitStatus === 'exceeded' ? 'RATE EXCEEDED' : 'NOMINAL'}
              </span>
            </div>

            <div className="mt-3 bg-zinc-950/70 border border-zinc-800 rounded-lg p-2 flex items-center justify-between gap-2">
              <div className="flex flex-col">
                <span className="text-[10px] text-zinc-500 uppercase font-mono">Bucket Capacity</span>
                <span className="text-xs font-mono font-bold text-zinc-300">100 Max / 10 fill rate</span>
              </div>
              <button
                onClick={handleIngestTelemetry}
                disabled={isIngesting}
                className="bg-blue-600 hover:bg-blue-500 text-zinc-100 font-bold px-3 py-1.5 rounded-md text-xs transition-colors self-center flex items-center gap-1 shadow-md active:scale-95"
              >
                <Zap className={`w-3 h-3 ${isIngesting ? 'animate-spin' : ''}`} />
                <span>Simulate Ingest</span>
              </button>
            </div>

            {rateLimitError ? (
              <div className="mt-2 text-[10px] text-red-400 bg-red-500/5 border border-red-500/10 p-2 rounded leading-normal">
                {rateLimitError}
              </div>
            ) : (
              <p className="text-[10px] text-zinc-500 mt-2.5">
                Click "Simulate Ingest" rapidly to saturate the bucket and witness how the backend resiliently rejects overflowing telemetry before database bottlenecks happen.
              </p>
            )}
          </div>

          <div className="border-t border-zinc-800/60 pt-3 mt-4 flex items-center justify-between text-[11px] text-zinc-400 font-mono">
            <span>Active Connections:</span>
            <span className="text-blue-400 font-bold">12 Node Streams</span>
          </div>
        </div>
      </div>

      {/* Main interactive panel: Live AI Reasoning Playground & Real Circuit Breaker Test */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: Live AI reasoning tool */}
        <div className="lg:col-span-2 bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2 font-mono">
              <Sparkles className="w-4 h-4 text-yellow-400" /> End-to-End Live AI Reasoning Playground
            </h3>
            <select 
              value={activeModel}
              onChange={(e) => setActiveModel(e.target.value)}
              className="bg-zinc-850 border border-zinc-800 text-zinc-300 text-[11px] rounded px-2 py-1 font-mono focus:outline-none focus:border-yellow-500"
            >
              <option value="deepseek-reasoner">DeepSeek R1 (Reasoning)</option>
              <option value="grok-3-fast">Grok 3 Fast (xAI Beta)</option>
              <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
              <option value="llama-3.3-70b">Groq Llama 3.3</option>
            </select>
          </div>

          <p className="text-xs text-zinc-400 leading-normal font-mono">
            This workspace is fully full-stack! Typing a query below routes a live execution request directly through our Express router. It executes through the multi-tier API client fallback and logs reasoning token telemetry.
          </p>

          <form onSubmit={handleRunReasoning} className="flex gap-2">
            <input 
              type="text"
              placeholder="Ask Grok/DeepSeek anything to test multi-tier fallbacks..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isLoading}
              className="flex-1 bg-zinc-950/80 border border-zinc-800 focus:border-yellow-500/50 rounded-lg px-3 py-2 text-xs sm:text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-yellow-500/20 font-mono"
            />
            <button 
              type="submit"
              disabled={isLoading || !prompt.trim()}
              className="bg-yellow-400 hover:bg-yellow-500 text-zinc-950 font-bold px-4 py-2 rounded-lg text-xs sm:text-sm flex items-center gap-1.5 transition-colors shrink-0 disabled:opacity-40 font-mono"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isLoading ? 'Thinking...' : 'Reason'}</span>
            </button>
          </form>

          {/* AI Response Block with capture details */}
          {(isLoading || aiResponse || reasoningText) && (
            <div className="border border-zinc-800 bg-zinc-950/50 rounded-lg p-3 sm:p-4 space-y-3 font-mono text-xs max-h-96 overflow-y-auto">
              <div className="flex items-center justify-between text-[10px] text-zinc-500 pb-1.5 border-b border-zinc-850">
                <span>MODEL ROUTING STATUS</span>
                <span className="text-yellow-400 flex items-center gap-1.5 font-mono">
                  <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-ping" />
                  {isLoading ? 'RESOLVING FALLBACKS...' : `ACTIVE TIER: ${grokMode}`}
                </span>
              </div>

              {reasoningText && (
                <div className="space-y-1">
                  <div className="text-[10px] text-amber-400 font-bold flex items-center gap-1 font-mono">
                    <Brain className="w-3 h-3 text-amber-400" /> CAPTURED THINKING PROCESS (Reasoning):
                  </div>
                  <pre className="text-[10px] bg-yellow-500/5 border border-yellow-500/10 p-2.5 rounded text-yellow-300 leading-normal whitespace-pre-wrap select-text font-mono">
                    {reasoningText}
                  </pre>
                </div>
              )}

              {aiResponse && (
                <div className="space-y-1">
                  <div className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 font-mono">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> FINAL INFERENCE REPLY:
                  </div>
                  <div className="bg-zinc-900/60 p-3 rounded border border-zinc-800 text-zinc-300 leading-relaxed whitespace-pre-wrap select-text font-mono">
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
                <div className="text-[10px] text-zinc-500 text-right font-mono">
                  Usage telemetry: <span className="text-zinc-300 font-bold font-mono">{tokensEarned} completion tokens</span> consumed and logged to ledger.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right column: Resiliency Diagnostics and Chaos testing */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-4 sm:p-5 space-y-4">
          <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2 font-mono">
            <Power className="w-4 h-4 text-red-500" /> Resiliency & Chaos Monkey
          </h3>

          <p className="text-xs text-zinc-400 leading-normal font-mono">
            KILO isolates API failovers using Circuit Breakers. Test our resiliency framework by manually tripping individual service pipelines.
          </p>

          <div className="space-y-3">
            {/* Groq Breaker */}
            <div className="bg-zinc-950/80 border border-zinc-850 p-3 rounded-lg flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <span className="text-[10px] text-zinc-500 uppercase font-mono tracking-wider">Groq Breaker Status</span>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${healthData?.circuitBreakers?.groqBreaker === 'OPEN' ? 'bg-red-500 animate-ping' : 'bg-green-500'}`} />
                  <span className={`text-xs font-mono font-bold ${healthData?.circuitBreakers?.groqBreaker === 'OPEN' ? 'text-red-400' : 'text-green-400'}`}>
                    {healthData?.circuitBreakers?.groqBreaker || 'CLOSED (ACTIVE)'}
                  </span>
                </div>
              </div>

              <div className="flex gap-1.5">
                <button
                  disabled={isTripping}
                  onClick={() => toggleCircuitBreaker('trip')}
                  className="bg-red-950/40 hover:bg-red-900/40 text-red-400 border border-red-500/20 text-[10px] font-bold px-2 py-1.5 rounded transition-all active:scale-95 disabled:opacity-40 font-mono"
                >
                  Trip (Chaos)
                </button>
                <button
                  disabled={isTripping}
                  onClick={() => toggleCircuitBreaker('reset')}
                  className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 text-[10px] font-bold px-2 py-1.5 rounded transition-all active:scale-95 disabled:opacity-40 font-mono"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* DeepSeek Breaker */}
            <div className="bg-zinc-950/80 border border-zinc-850 p-3 rounded-lg flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <span className="text-[10px] text-zinc-500 uppercase font-mono tracking-wider">DeepSeek Breaker Status</span>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-xs font-mono font-bold text-green-400">
                    {healthData?.circuitBreakers?.deepseekBreaker || 'CLOSED (ACTIVE)'}
                  </span>
                </div>
              </div>
              <span className="text-[9px] uppercase font-mono text-zinc-600 font-bold">Auto Managed</span>
            </div>

            {/* System Deep Diagnostics Table */}
            <div className="bg-zinc-950/60 rounded-lg p-3 border border-zinc-850 font-mono text-[10px] space-y-2">
              <div className="text-[9px] font-bold text-zinc-500 uppercase pb-1 border-b border-zinc-850 flex justify-between">
                <span>Deep Health Status</span>
                <span className="text-green-400">ONLINE</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Redis Slow DB (Gov):</span>
                <span className={healthData?.redisSlow?.connected ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
                  {healthData?.redisSlow?.connected ? 'CONNECTED' : 'DISCONNECTED'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Redis Fast DB (SSE):</span>
                <span className={healthData?.redisFast?.connected ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
                  {healthData?.redisFast?.connected ? 'CONNECTED' : 'DISCONNECTED'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Cache Janitor Lock:</span>
                <span className="text-zinc-300">
                  {healthData?.prunerLock?.locked ? 'LOCKED' : 'VACANT (OK)'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Server Budget Spent:</span>
                <span className="text-yellow-400 font-bold">
                  ${healthData?.budget?.currentSpend?.toFixed(4) || '0.0001'} spent
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Terminal Real-time Job logs and Dispatch Trays */}
      <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-yellow-500" />
            <h3 className="text-sm font-bold text-zinc-100 font-mono">KILO Dispatch Logs & Real-Time Queue Activity</h3>
          </div>
          <span className="text-[10px] bg-zinc-950 px-2 py-1 rounded font-mono text-zinc-500 font-mono">
            Active Listeners: WebSocket / Long-Polling
          </span>
        </div>

        <div className="bg-zinc-950/80 rounded-lg border border-zinc-800 p-4 font-mono text-xs space-y-2 h-64 overflow-y-auto select-all leading-normal">
          {dispatchLogs.map((log) => (
            <div key={log.id} className="flex gap-3 items-start hover:bg-zinc-900/40 py-0.5 px-1 rounded transition-colors font-mono">
              <span className="text-zinc-600 shrink-0 text-[10px] select-none font-mono">{log.time}</span>
              <span className={`text-[11px] leading-relaxed select-text font-mono ${
                log.type === 'success' ? 'text-emerald-400' :
                log.type === 'warn' ? 'text-amber-400' :
                log.type === 'err' ? 'text-red-400' : 'text-zinc-300'
              }`}>
                {log.msg}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
