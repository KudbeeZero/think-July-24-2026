import { Router } from "express";
import { securityClearanceRegistry, ClearanceLevel } from "../clearanceEngine.ts";

export const securityRouter = Router();

// GET all registered agents & their military clearance levels
securityRouter.get("/agents/clearance", (req, res) => {
  res.json({
    success: true,
    agents: securityClearanceRegistry.getAllAgentsWithClearance()
  });
});

// POST verify agent clearance for a specific resource operation
securityRouter.post("/agents/verify", (req, res) => {
  const { agentId, requiredLevel = ClearanceLevel.LEVEL_1_CONFIDENTIAL } = req.body;
  const result = securityClearanceRegistry.verifyAccess(agentId, Number(requiredLevel));
  res.json(result);
});

// POST register or upgrade an agent's clearance level
securityRouter.post("/agents/clearance/update", (req, res) => {
  const { agentId, agentName, clearanceLevel, assignedNodeId } = req.body;
  if (!agentId || clearanceLevel === undefined) {
    return res.status(400).json({ error: "Missing agentId or clearanceLevel" });
  }
  const token = securityClearanceRegistry.registerAgent(
    agentId,
    agentName || agentId,
    Number(clearanceLevel),
    assignedNodeId || "default_node"
  );
  res.json({ success: true, token });
});
