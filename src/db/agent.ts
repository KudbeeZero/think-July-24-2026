import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.AGENT_DATABASE_URL || 'postgres://localhost:5432/agent';
const pool = new Pool({ connectionString });
export const agentDb = drizzle(pool, { schema });
