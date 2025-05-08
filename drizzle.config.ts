
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  driver: 'better-sqlite3',
  dbCredentials: {
    url: 'sqlite.db'
  },
});
