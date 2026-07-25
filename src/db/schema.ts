import { pgTable, serial, text, timestamp, varchar, boolean } from "drizzle-orm/pg-core";

// === Advanced Upgrade 3: Single-Container Postgres Schema for Ingestion Server ===
export const agents = pgTable("agents", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).notNull(),
  status: varchar("status", { length: 50 }).default("offline"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const beads = pgTable("beads", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  status: varchar("status", { length: 50 }).default("open"),
  priority: varchar("priority", { length: 50 }).default("medium"),
  assigneeId: serial("assignee_id").references(() => agents.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const telemetry_logs = pgTable("telemetry_logs", {
  id: serial("id").primaryKey(),
  source: varchar("source", { length: 255 }).notNull(),
  event: text("event").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});
