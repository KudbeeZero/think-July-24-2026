/**
 * Kudbee Security Clearance & Military-Grade Access Control Engine
 * 
 * Provides Clearance-Level Gating for Heroku Dynos, Worker Agents, and Node Clusters.
 * Clearance Levels:
 * - LEVEL_0 (UNCLASSIFIED / PUBLIC): General prompt processing, standard public API access.
 * - LEVEL_1 (CONFIDENTIAL): Isolated task execution, local memory reads.
 * - LEVEL_2 (SECRET): Cross-node telemetry, Heroku worker orchestration, ECP cache read/write.
 * - LEVEL_3 (TOP_SECRET / HIVE_MIND): Global neural memory sync, master state mutations, MCP tool execution.
 */

export enum ClearanceLevel {
  LEVEL_0_UNCLASSIFIED = 0,
  LEVEL_1_CONFIDENTIAL = 1,
  LEVEL_2_SECRET = 2,
  LEVEL_3_TOP_SECRET = 3,
}

export interface AgentClearanceToken {
  agentId: string;
  agentName: string;
  clearanceLevel: ClearanceLevel;
  assignedNodeId: string;
  issuedAt: string;
  signature: string;
}

class SecurityClearanceRegistry {
  private agentTokens = new Map<string, AgentClearanceToken>();

  constructor() {
    // Register Default System Agents with Military Clearance Levels
    this.registerAgent("agent_refinery", "Refinery", ClearanceLevel.LEVEL_3_TOP_SECRET, "heroku_dyno_master");
    this.registerAgent("agent_toast", "Toast", ClearanceLevel.LEVEL_2_SECRET, "heroku_dyno_worker_1");
    this.registerAgent("agent_maple", "Maple", ClearanceLevel.LEVEL_1_CONFIDENTIAL, "heroku_dyno_worker_2");
    this.registerAgent("agent_alpha", "Sub-Agent-Alpha", ClearanceLevel.LEVEL_1_CONFIDENTIAL, "local_think_node_1");
    this.registerAgent("agent_github_daemon", "GitHub-Sync-Daemon", ClearanceLevel.LEVEL_2_SECRET, "edge_sync_node");
  }

  public registerAgent(
    agentId: string,
    agentName: string,
    clearanceLevel: ClearanceLevel,
    assignedNodeId: string
  ): AgentClearanceToken {
    const token: AgentClearanceToken = {
      agentId,
      agentName,
      clearanceLevel,
      assignedNodeId,
      issuedAt: new Date().toISOString(),
      signature: `SIG_KUD_${Math.random().toString(36).substring(2, 10).toUpperCase()}`
    };
    this.agentTokens.set(agentId, token);
    return token;
  }

  public getAgentToken(agentId: string): AgentClearanceToken | undefined {
    return this.agentTokens.get(agentId);
  }

  public verifyAccess(
    agentId: string,
    requiredLevel: ClearanceLevel
  ): { granted: boolean; currentLevel: ClearanceLevel; message: string } {
    const token = this.agentTokens.get(agentId);
    if (!token) {
      return {
        granted: false,
        currentLevel: ClearanceLevel.LEVEL_0_UNCLASSIFIED,
        message: `DENIED: Agent '${agentId}' has no valid clearance credentials. Access restricted to Level 0.`
      };
    }

    if (token.clearanceLevel >= requiredLevel) {
      return {
        granted: true,
        currentLevel: token.clearanceLevel,
        message: `GRANTED: Clearance Level ${ClearanceLevel[token.clearanceLevel]} satisfies requirement (${ClearanceLevel[requiredLevel]}).`
      };
    }

    return {
      granted: false,
      currentLevel: token.clearanceLevel,
      message: `DENIED: Insufficient clearance. Agent possesses Level ${ClearanceLevel[token.clearanceLevel]} but action requires Level ${ClearanceLevel[requiredLevel]}.`
    };
  }

  public getAllAgentsWithClearance() {
    return Array.from(this.agentTokens.values()).map(token => ({
      ...token,
      clearanceName: ClearanceLevel[token.clearanceLevel]
    }));
  }
}

export const securityClearanceRegistry = new SecurityClearanceRegistry();
