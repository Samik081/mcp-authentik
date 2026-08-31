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

  // With remote authorization the token arrives per request, so there may be
  // no server-side client to validate at startup.
  if (config.token) {
    const client = new AuthentikClient(config.url, config.token);
    try {
      const version = await client.validateConnection();
      logger.info(`Connected to Authentik ${version}`);
    } catch (error: unknown) {
      logger.error(
        "Failed to connect to Authentik:",
        await sanitizeError(error, config),
      );
      process.exit(1);
    }
  } else {
    logger.info(
      `Remote authorization: each caller supplies its own Authentik token (${config.url})`,
    );
  }

  logger.info(`Access tier: ${config.accessTier}`);

  const serverFactory = (requestToken?: string) => {
    const token = config.remoteAuthorization
      ? (requestToken ?? config.token)
      : config.token;
    if (!token) {
      throw new Error("No Authentik token available for this session");
    }
    const s = createServer();
    registerAllTools(s, new AuthentikClient(config.url, token), config);
    return s;
  };
  // HTTP builds a server per session inside startServer, so only stdio needs
  // one up front — and only stdio is guaranteed to have a token here.
  const server = config.transport === "http" ? createServer() : serverFactory();
  await startServer(server, config, serverFactory);
}

main().catch((error: unknown) => {
  logger.error(
    "Fatal error:",
    error instanceof Error ? error.message : String(error),
  );
  process.exit(1);
});
