import React from 'react';
import { Agent, Convoy, TelemetryLog } from '../types';
import { DawExecutiveRack } from './kilo/DawExecutiveRack';

interface OverviewViewProps {
  agents: Agent[];
  convoys: Convoy[];
  liveFeed: TelemetryLog[];
  onOpenSpinUpModal: () => void;
  onOpenGrokTerminal: () => void;
  onSelectAgent: (agent: Agent) => void;
  onRunTestTask: (agentName: string, prompt: string, model: string) => Promise<any>;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  agents,
  convoys,
  liveFeed,
  onOpenSpinUpModal,
  onOpenGrokTerminal,
  onSelectAgent,
  onRunTestTask
}) => {
  return (
    <div className="p-4 sm:p-6 max-w-[1600px] mx-auto pb-28 lg:pb-8">
      <DawExecutiveRack
        agents={agents}
        convoys={convoys}
        liveFeed={liveFeed}
        onOpenSpinUpModal={onOpenSpinUpModal}
        onOpenGrokTerminal={onOpenGrokTerminal}
        onSelectAgent={onSelectAgent}
        onRunTestTask={onRunTestTask}
      />
    </div>
  );
};
