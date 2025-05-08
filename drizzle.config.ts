
import { defineConfig } from "drizzle-kit";
import { config } from "@shared/config";

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  driver: 'pg',
  dbCredentials: {
    connectionString: config.databaseUrl
  },
});
