import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ToolAnnotations } from '@modelcontextprotocol/sdk/types.js';
import type { ZodRawShape } from 'zod';
import { AccessTier, AppConfig } from '../types/index.js';
import { sanitizeError } from './errors.js';
import { logger } from './logger.js';

export interface ToolRegistrationOptions {
  name: string;
  title: string;
  description: string;
  accessTier: AccessTier;
  category: string;
  annotations?: ToolAnnotations;
  inputSchema?: ZodRawShape;
  handler: (args: Record<string, unknown>) => Promise<string>;
}

/** Tracks all tool names seen during registration for post-registration validation. */
const seenToolNames = new Set<string>();

/**
 * Register a tool with the MCP server, respecting blacklist/whitelist,
 * access tier, and category filters.
 *
 * Filter precedence:
 * 1. Blacklist always wins (even over whitelist — logs warning if both)
 * 2. Whitelist bypasses access tier and category filters
 * 3. Access tier gate
 * 4. Category gate
 */
export function registerTool(
  server: McpServer,
  config: AppConfig,
  options: ToolRegistrationOptions,
): boolean {
  seenToolNames.add(options.name);

  const isBlacklisted =
    config.toolBlacklist !== null && config.toolBlacklist.includes(options.name);
  const isWhitelisted =
    config.toolWhitelist !== null && config.toolWhitelist.includes(options.name);

  // Blacklist always wins
  if (isBlacklisted) {
    if (isWhitelisted) {
      logger.warn(
        `Tool "${options.name}" is both blacklisted and whitelisted — blacklist takes precedence, skipping`,
      );
    } else {
      logger.debug(`Skipping tool "${options.name}" (blacklisted)`);
    }
    return false;
  }

  // Whitelist bypasses tier and category filters
  if (!isWhitelisted) {
    // Tier gate: read-only config prevents full-tier tools
    if (config.accessTier === 'read-only' && options.accessTier === 'full') {
      return false;
    }

    // Category filter: skip silently if category not in allowed list
    if (config.categories !== null && !config.categories.includes(options.category)) {
      return false;
    }
  }

  // Build annotations
  const annotations: ToolAnnotations = {
    readOnlyHint: options.accessTier === 'read-only',
    destructiveHint: false,
    ...options.annotations,
  };

  // Build registration config
  const toolConfig: {
    title?: string;
    description: string;
    inputSchema?: ZodRawShape;
    annotations: ToolAnnotations;
  } = {
    ...(!config.excludeToolTitles && { title: options.title }),
    description: options.description,
    annotations,
  };

  if (options.inputSchema) {
    toolConfig.inputSchema = options.inputSchema;
  }

  // Register with error-wrapping handler
  server.registerTool(options.name, toolConfig, async (args: Record<string, unknown>) => {
    try {
      const result = await options.handler(args);
      return {
        content: [{ type: 'text' as const, text: result }],
      };
    } catch (error: unknown) {
      return {
        content: [{ type: 'text' as const, text: 'Error: ' + await sanitizeError(error, config) }],
        isError: true,
      };
    }
  });

  return true;
}

/**
 * Validate that all tool names in blacklist/whitelist actually exist.
 * Call after registerAllTools() to warn about typos or stale entries.
 */
export function validateToolLists(config: AppConfig): void {
  for (const name of config.toolBlacklist ?? []) {
    if (!seenToolNames.has(name)) {
      logger.warn(`Blacklisted tool "${name}" does not match any known tool`);
    }
  }
  for (const name of config.toolWhitelist ?? []) {
    if (!seenToolNames.has(name)) {
      logger.warn(`Whitelisted tool "${name}" does not match any known tool`);
    }
  }
}
