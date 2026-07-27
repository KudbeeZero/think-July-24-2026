import { pgTable, text, integer, serial, timestamp } from 'drizzle-orm/pg-core';

/**
 * Kudbee Monorepo Drizzle ORM Database Schema
 * Production-grade PostgreSQL / Cloud SQL TypeScript schema definitions.
 */

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const agents = pgTable('agents', {
  id: text('id').primaryKey().$defaultFn(() => `ag_${Date.now()}`),
  name: text('name').notNull(),
  role: text('role'),
  status: text('status').notNull().default('IDLE'),
  hooked: text('hooked'),
  clearanceLevel: integer('clearance_level').notNull().default(1),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const beads = pgTable('beads', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  status: text('status').notNull().default('OPEN'),
  priority: text('priority').notNull().default('MEDIUM'),
  assignee: text('assignee'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const telemetry_logs = pgTable('telemetry_logs', {
  id: serial('id').primaryKey(),
  nodeId: text('node_id').default('node_0'),
  source: text('source').notNull(),
  event: text('event'),
  eventMsg: text('event_msg'),
  proofOfComputeHash: text('proof_of_compute_hash'),
  timestamp: text('timestamp').default('just now'),
});

export const think_token_tx = pgTable('think_token_tx', {
  id: text('id').primaryKey(),
  agentId: text('agent_id'),
  amount: integer('amount').notNull(),
  reason: text('reason').notNull(),
  timestamp: text('timestamp').notNull(),
});

// Aliases for camelCase compatibility
export const agentsTable = agents;
export const beadsTable = beads;
export const telemetryLogsTable = telemetry_logs;
export const usersTable = users;
