#!/usr/bin/env node

/**
 * MCP Authentik - Entry point.
 * Reads env vars, validates Authentik connection, starts MCP server.
 */

import { AuthentikClient } from "./core/client.js";
import { loadConfig } from "./core/config.js";
import { sanitizeError } from "./core/errors.js";
import { logger } from "./core/logger.js";
import { createServer, startServer } from "./core/server.js";
import { registerAllTools } from "./tools/index.js";
import type { AppConfig } from "./types/index.js";

// Process lifecycle handlers
process.on("uncaughtException", (error) => {
  logger.error("Uncaught exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled rejection:", reason);
  process.exit(1);
});

async function main(): Promise<void> {
  let config: AppConfig;
  try {
    config = loadConfig();
  } catch (err) {
    logger.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  }

  const client = new AuthentikClient(config.url, config.token);

  try {
    const version = await client.validateConnection();
    logger.info(`Connected to Authentik ${version}`);
  } catch (error: unknown) {
    logger.error(
      "Failed to connect to Authentik:",
      sanitizeError(error, config),
    );
    process.exit(1);
  }

  logger.info(`Access tier: ${config.accessTier}`);

  const serverFactory = () => {
    const s = createServer();
    registerAllTools(s, client, config);
    return s;
  };
  const server = serverFactory();
  await startServer(server, config, serverFactory);
}

main().catch((error: unknown) => {
  logger.error(
    "Fatal error:",
    error instanceof Error ? error.message : String(error),
  );
  process.exit(1);
});
