import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { AuthentikClient } from '../core/client.js';
import type { AppConfig } from '../types/index.js';
import { registerTool } from '../core/tools.js';

export function registerSsfTools(
  server: McpServer,
  client: AuthentikClient,
  config: AppConfig,
): void {
  // SSF API is read-only (Pitfall 7) — only list and retrieve

  // 1. List SSF event streams
  registerTool(server, config, {
    name: 'authentik_ssf_streams_list',
    description: 'List Shared Signals Framework (SSF) event streams with optional filters. Read-only.',
    accessTier: 'read-only',
    category: 'ssf',
    inputSchema: {
      endpoint_url: z.string().optional().describe('Filter by endpoint URL'),
      provider: z.number().optional().describe('Filter by provider ID'),
      search: z.string().optional().describe('Search across fields'),
      ordering: z.string().optional().describe('Field to order by'),
      page: z.number().optional().describe('Page number'),
      page_size: z.number().optional().describe('Number of results per page'),
    },
    handler: async (args) => {
      const result = await client.ssfApi.ssfStreamsList({
        endpointUrl: args.endpoint_url as string | undefined,
        provider: args.provider as number | undefined,
        search: args.search as string | undefined,
        ordering: args.ordering as string | undefined,
        page: args.page as number | undefined,
        pageSize: args.page_size as number | undefined,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 2. Get SSF event stream
  registerTool(server, config, {
    name: 'authentik_ssf_streams_get',
    description: 'Get a single SSF event stream by its UUID. Read-only.',
    accessTier: 'read-only',
    category: 'ssf',
    inputSchema: {
      uuid: z.string().describe('SSF stream UUID'),
    },
    handler: async (args) => {
      const result = await client.ssfApi.ssfStreamsRetrieve({
        uuid: args.uuid as string,
      });
      return JSON.stringify(result, null, 2);
    },
  });
}
