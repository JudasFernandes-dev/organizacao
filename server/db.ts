
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from '@vercel/postgres';
import * as schema from "@shared/schema";

const client = postgres.createClient();
export const db = drizzle(client, { schema });
