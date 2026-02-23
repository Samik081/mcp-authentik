#!/usr/bin/env node

/**
 * MCP Authentik - Entry point.
 * Reads env vars, validates Authentik connection, starts MCP server.
 */

import { loadConfig } from './core/config.js';
import { AuthentikClient } from './core/client.js';
import { createServer, startServer } from './core/server.js';
import { registerAllTools } from './tools/index.js';
import { sanitizeError } from './core/errors.js';
import { logger } from './core/logger.js';

// Process lifecycle handlers
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection:', reason);
  process.exit(1);
});

async function main(): Promise<void> {
  let config;
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
    logger.error('Failed to connect to Authentik:', sanitizeError(error, config));
    process.exit(1);
  }

  logger.info(`Access tier: ${config.accessTier}`);

  const server = createServer();
  registerAllTools(server, client, config);
  await startServer(server, config);
}

main().catch((error: unknown) => {
  logger.error('Fatal error:', error instanceof Error ? error.message : String(error));
  process.exit(1);
});
