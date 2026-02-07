import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ToolAnnotations } from '@modelcontextprotocol/sdk/types.js';
import type { ZodRawShape } from 'zod';
import { AccessTier, AppConfig } from '../types/index.js';
import { sanitizeError } from './errors.js';

export interface ToolRegistrationOptions {
  name: string;
  description: string;
  accessTier: AccessTier;
  category: string;
  annotations?: ToolAnnotations;
  tags?: string[];
  inputSchema?: ZodRawShape;
  handler: (args: Record<string, unknown>) => Promise<string>;
}

export function registerTool(
  server: McpServer,
  config: AppConfig,
  options: ToolRegistrationOptions,
): boolean {
  // Tier gate: read-only config prevents full-tier tools
  if (config.accessTier === 'read-only' && options.accessTier === 'full') {
    return false;
  }

  // Category filter: skip silently if category not in allowed list
  if (config.categories !== null && !config.categories.includes(options.category)) {
    return false;
  }

  // Build annotations
  const annotations: ToolAnnotations = {
    readOnlyHint: options.accessTier === 'read-only',
    destructiveHint: options.tags?.includes('destructive') ?? false,
    ...options.annotations,
  };

  // Build registration config
  const toolConfig: {
    description: string;
    inputSchema?: ZodRawShape;
    annotations: ToolAnnotations;
  } = {
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
