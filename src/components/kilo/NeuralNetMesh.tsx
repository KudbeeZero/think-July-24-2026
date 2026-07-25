import React, { useEffect, useRef } from 'react';
import { Sliders, Layers, Power } from 'lucide-react';

export interface NeuralNode {
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

export interface NeuralLink {
  id: string;
  from: string;
  to: string;
  weight: number;
  severed: boolean;
}

export interface Particle {
  id: string;
  fromNode: NeuralNode;
  toNode: NeuralNode;
  progress: number;
  speed: number;
  color: string;
}

interface NeuralNetMeshProps {
  safetyThreshold: number;
  simulationSpeed: number;
  tempBias: number;
  symmetryMode: boolean;
  topologyType: 'feedforward' | 'glowing-grid' | 'circular-mesh' | 'brainca-matrix';
  activeThemeProfile: 'neon-yellow' | 'spectral-fire' | 'cool-cyber';
  nodes: NeuralNode[];
  links: NeuralLink[];
  setNodes: React.Dispatch<React.SetStateAction<NeuralNode[]>>;
  setLinks: React.Dispatch<React.SetStateAction<NeuralLink[]>>;
  inspectedNode: NeuralNode | null;
  setInspectedNode: (node: NeuralNode | null) => void;
  addLog: (msg: string, type: 'info' | 'warn' | 'success' | 'err') => void;
  pulseTrigger?: number;
  onToggleLink?: (linkId: string) => void;
}

export const NeuralNetMesh: React.FC<NeuralNetMeshProps> = ({
  safetyThreshold,
  simulationSpeed,
  tempBias,
  symmetryMode,
  topologyType,
  activeThemeProfile,
  nodes,
  links,
  setNodes,
  setLinks,
  inspectedNode,
  setInspectedNode,
  addLog,
  pulseTrigger = 0,
  onToggleLink,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);

  // React on pulseTrigger change
  useEffect(() => {
    if (pulseTrigger > 0) {
      triggerPulsePropagation();
    }
  }, [pulseTrigger]);

  // Animation and drawing effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrameId: number;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw background design grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
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

      // Draw Connection wires (links)
      links.forEach(link => {
        const fromNode = nodes.find(n => n.id === link.from);
        const toNode = nodes.find(n => n.id === link.to);
        if (!fromNode || !toNode) return;

        ctx.beginPath();
        ctx.moveTo(fromNode.x, fromNode.y);
        ctx.lineTo(toNode.x, toNode.y);

        if (link.severed) {
          ctx.setLineDash([4, 6]);
          ctx.lineWidth = 1;
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.3)'; // Red dash for cut line
        } else {
          ctx.setLineDash([]);
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

      // Draw particles propagating signal pulses along synapses
      particlesRef.current = particlesRef.current.filter(p => {
        p.progress += p.speed;
        if (p.progress >= 1) {
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

          p.toNode.currentVal = 1.0;
          return false;
        }

        const currentX = p.fromNode.x + (p.toNode.x - p.fromNode.x) * p.progress;
        const currentY = p.fromNode.y + (p.toNode.y - p.fromNode.y) * p.progress;

        ctx.beginPath();
        ctx.arc(currentX, currentY, 3.5, 0, 2 * Math.PI);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;

        return true;
      });

      // Draw Nodes
      nodes.forEach(node => {
        if (node.currentVal > 0.4) {
          node.currentVal -= 0.015;
        }

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

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, 2 * Math.PI);
        ctx.strokeStyle = inspectedNode?.id === node.id ? '#ffffff' : 'rgba(161, 161, 170, 0.4)';
        ctx.lineWidth = inspectedNode?.id === node.id ? 2.5 : 1.5;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius - 2.5, 0, 2 * Math.PI);
        
        let colorStr = '#3f3f46';
        if (node.layer === 'input') {
          colorStr = 'rgba(59, 130, 246, 0.8)';
        } else if (node.layer === 'hidden1' || node.layer === 'hidden2') {
          if (activeThemeProfile === 'neon-yellow') {
            colorStr = `rgba(229, 255, 85, ${node.currentVal})`;
          } else if (activeThemeProfile === 'spectral-fire') {
            colorStr = `rgba(239, 68, 68, ${node.currentVal})`;
          } else {
            colorStr = `rgba(6, 182, 212, ${node.currentVal})`;
          }
        } else {
          colorStr = 'rgba(16, 185, 129, 0.85)';
        }

        ctx.fillStyle = colorStr;
        ctx.fill();

        ctx.fillStyle = inspectedNode?.id === node.id ? '#ffffff' : 'rgba(212, 212, 216, 0.6)';
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'center';
        
        const trimmedLabel = node.label.length > 12 ? node.label.substring(0, 10) + '..' : node.label;
        ctx.fillText(trimmedLabel, node.x, node.y - node.radius - 6);
      });

      // Human Brain Geometric Cage Overlay
      if (symmetryMode) {
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.1)';
        ctx.lineWidth = 1;
        ctx.beginPath();
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

  const distanceToSegment = (x: number, y: number, x1: number, y1: number, x2: number, y2: number) => {
    const A = x - x1;
    const B = y - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;
    if (lenSq !== 0) param = dot / lenSq;

    let xx, yy;
    if (param < 0) {
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }

    const dx = x - xx;
    const dy = y - yy;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const found = nodes.find(node => {
      const dist = Math.sqrt((node.x - clickX) ** 2 + (node.y - clickY) ** 2);
      return dist <= node.radius + 8;
    });

    if (found) {
      setInspectedNode(found);
      addLog(`[Node Inspector] Inspected node "${found.label}" (Layer: ${found.layer.toUpperCase()}) | Activation: ${found.activation}`, 'info');
    } else {
      setInspectedNode(null);

      // Link selection with custom distance calculation
      let closestLink: any = null;
      let minDistance = Infinity;

      links.forEach(link => {
        const fromNode = nodes.find(n => n.id === link.from);
        const toNode = nodes.find(n => n.id === link.to);
        if (!fromNode || !toNode) return;

        const dist = distanceToSegment(clickX, clickY, fromNode.x, fromNode.y, toNode.x, toNode.y);
        if (dist < minDistance) {
          minDistance = dist;
          closestLink = link;
        }
      });

      if (closestLink && minDistance <= 8.0) {
        if (onToggleLink) {
          onToggleLink(closestLink.id);
        }
      }
    }
  };

  const triggerPulsePropagation = () => {
    const inputNodes = nodes.filter(n => n.layer === 'input');
    inputNodes.forEach(input => {
      const outgoingLinks = links.filter(l => l.from === input.id && !l.severed);
      outgoingLinks.forEach(link => {
        const target = nodes.find(n => n.id === link.to);
        if (target) {
          let pColor = 'rgba(229, 255, 85, 0.95)';
          if (activeThemeProfile === 'spectral-fire') pColor = 'rgba(239, 68, 68, 0.95)';
          if (activeThemeProfile === 'cool-cyber') pColor = 'rgba(6, 182, 212, 0.95)';

          particlesRef.current.push({
            id: `p-${Date.now()}-${Math.random()}`,
            fromNode: input,
            toNode: target,
            progress: 0,
            speed: (0.015 + Math.random() * 0.015) * simulationSpeed,
            color: pColor
          });
        }
      });
      input.currentVal = 1.0;
    });
    addLog(`[Signal Propagator] Injected synaptic signal pulse sequence across ${topologyType} topologies`, 'success');
  };

  return (
    <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-4 flex flex-col h-[460px] relative overflow-hidden backdrop-blur-md shadow-xl hover:border-yellow-500/10 transition-all">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 animate-pulse" />
          <span className="text-xs font-bold font-mono tracking-wider text-zinc-300 uppercase">
            NEURAL NET MESH ENGINE
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={triggerPulsePropagation}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-yellow-500/10 border border-yellow-500/20 hover:bg-yellow-500/20 text-yellow-400 font-mono text-[10px] font-bold transition-all"
          >
            <Power className="w-3 h-3 text-yellow-400" />
            INJECT PULSE
          </button>
        </div>
      </div>

      <div className="relative flex-1 bg-black/40 rounded-lg overflow-hidden border border-zinc-800/40">
        <canvas
          ref={canvasRef}
          width={650}
          height={330}
          onClick={handleCanvasClick}
          className="w-full h-full cursor-pointer"
        />

        {/* Hover info overlay */}
        {inspectedNode && (
          <div className="absolute top-2 left-2 bg-zinc-900/90 border border-zinc-800 p-2.5 rounded-lg text-[10px] font-mono text-zinc-300 max-w-[200px] shadow-lg backdrop-blur-md z-10 animate-fade-in">
            <div className="font-bold text-yellow-400 border-b border-zinc-800 pb-1 mb-1">
              NODE INSPECTOR
            </div>
            <div>Label: {inspectedNode.label}</div>
            <div>Layer: {inspectedNode.layer.toUpperCase()}</div>
            <div>Bias Weight: {inspectedNode.bias.toFixed(3)}</div>
            <div>Activation: {inspectedNode.activation}</div>
            <div className="text-emerald-400">Current Val: {inspectedNode.currentVal.toFixed(3)}</div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 mt-3 text-[10px] text-zinc-400 font-mono border-t border-zinc-800/40 pt-2 shrink-0 overflow-x-auto whitespace-nowrap">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded bg-blue-500" /> Input Nodes
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded bg-yellow-500" /> Hidden Wires
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded bg-emerald-500" /> Output Synapses
        </div>
        <div className="ml-auto text-zinc-500">
          Click nodes to inspect biases & activations
        </div>
      </div>
    </div>
  );
};
