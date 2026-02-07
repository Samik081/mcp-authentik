import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { AuthentikClient } from '../core/client.js';
import type { AppConfig } from '../types/index.js';
import { registerTool } from '../core/tools.js';

export function registerRacTools(
  server: McpServer,
  client: AuthentikClient,
  config: AppConfig,
): void {
  // ── RAC Endpoints ──

  // 1. List RAC endpoints
  registerTool(server, config, {
    name: 'authentik_rac_endpoints_list',
    description: 'List RAC (Remote Access Control) endpoints with optional filters.',
    accessTier: 'read-only',
    category: 'rac',
    inputSchema: {
      name: z.string().optional().describe('Filter by endpoint name'),
      provider: z.number().optional().describe('Filter by provider ID'),
      search: z.string().optional().describe('Search across fields'),
      ordering: z.string().optional().describe('Field to order by'),
      page: z.number().optional().describe('Page number'),
      page_size: z.number().optional().describe('Number of results per page'),
    },
    handler: async (args) => {
      const result = await client.racApi.racEndpointsList({
        name: args.name as string | undefined,
        provider: args.provider as number | undefined,
        search: args.search as string | undefined,
        ordering: args.ordering as string | undefined,
        page: args.page as number | undefined,
        pageSize: args.page_size as number | undefined,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 2. Get RAC endpoint
  registerTool(server, config, {
    name: 'authentik_rac_endpoints_get',
    description: 'Get a single RAC endpoint by its UUID.',
    accessTier: 'read-only',
    category: 'rac',
    inputSchema: {
      pbm_uuid: z.string().describe('RAC endpoint UUID'),
    },
    handler: async (args) => {
      const result = await client.racApi.racEndpointsRetrieve({
        pbmUuid: args.pbm_uuid as string,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 3. Create RAC endpoint
  registerTool(server, config, {
    name: 'authentik_rac_endpoints_create',
    description: 'Create a new RAC endpoint for remote access.',
    accessTier: 'full',
    category: 'rac',
    inputSchema: {
      name: z.string().describe('Endpoint name (required)'),
      provider: z.number().describe('RAC provider ID (required)'),
      protocol: z.enum(['rdp', 'vnc', 'ssh']).describe('Connection protocol (required)'),
      host: z.string().describe('Target host address (required)'),
      auth_mode: z.enum(['static', 'prompt']).describe('Authentication mode (required)'),
      settings: z.record(z.unknown()).optional().describe('Additional endpoint settings'),
      property_mappings: z.array(z.string()).optional().describe('List of property mapping UUIDs'),
      maximum_connections: z.number().optional().describe('Maximum concurrent connections'),
    },
    handler: async (args) => {
      const result = await client.racApi.racEndpointsCreate({
        endpointRequest: {
          name: args.name as string,
          provider: args.provider as number,
          protocol: args.protocol as any,
          host: args.host as string,
          authMode: args.auth_mode as any,
          settings: args.settings as Record<string, any> | undefined,
          propertyMappings: args.property_mappings as string[] | undefined,
          maximumConnections: args.maximum_connections as number | undefined,
        },
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 4. Update RAC endpoint
  registerTool(server, config, {
    name: 'authentik_rac_endpoints_update',
    description: 'Update an existing RAC endpoint. Only provided fields are modified (partial update).',
    accessTier: 'full',
    category: 'rac',
    inputSchema: {
      pbm_uuid: z.string().describe('RAC endpoint UUID (required)'),
      name: z.string().optional().describe('New endpoint name'),
      provider: z.number().optional().describe('New RAC provider ID'),
      protocol: z.enum(['rdp', 'vnc', 'ssh']).optional().describe('New connection protocol'),
      host: z.string().optional().describe('New target host address'),
      auth_mode: z.enum(['static', 'prompt']).optional().describe('New authentication mode'),
      settings: z.record(z.unknown()).optional().describe('New endpoint settings'),
      property_mappings: z.array(z.string()).optional().describe('New list of property mapping UUIDs'),
      maximum_connections: z.number().optional().describe('New maximum concurrent connections'),
    },
    handler: async (args) => {
      const result = await client.racApi.racEndpointsPartialUpdate({
        pbmUuid: args.pbm_uuid as string,
        patchedEndpointRequest: {
          name: args.name as string | undefined,
          provider: args.provider as number | undefined,
          protocol: args.protocol as any,
          host: args.host as string | undefined,
          authMode: args.auth_mode as any,
          settings: args.settings as Record<string, any> | undefined,
          propertyMappings: args.property_mappings as string[] | undefined,
          maximumConnections: args.maximum_connections as number | undefined,
        },
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 5. Delete RAC endpoint
  registerTool(server, config, {
    name: 'authentik_rac_endpoints_delete',
    description: 'Delete a RAC endpoint by its UUID. This action is irreversible.',
    accessTier: 'full',
    category: 'rac',
    tags: ['destructive'],
    inputSchema: {
      pbm_uuid: z.string().describe('RAC endpoint UUID to delete'),
    },
    handler: async (args) => {
      await client.racApi.racEndpointsDestroy({
        pbmUuid: args.pbm_uuid as string,
      });
      return `RAC endpoint "${args.pbm_uuid}" deleted successfully.`;
    },
  });

  // ── RAC Connection Tokens (no create — Pitfall 8) ──

  // 6. List RAC connection tokens
  registerTool(server, config, {
    name: 'authentik_rac_connection_tokens_list',
    description: 'List RAC connection tokens with optional filters. Tokens are system-managed (no create).',
    accessTier: 'read-only',
    category: 'rac',
    inputSchema: {
      endpoint: z.string().optional().describe('Filter by endpoint UUID'),
      provider: z.number().optional().describe('Filter by provider ID'),
      search: z.string().optional().describe('Search across fields'),
      ordering: z.string().optional().describe('Field to order by'),
      page: z.number().optional().describe('Page number'),
      page_size: z.number().optional().describe('Number of results per page'),
    },
    handler: async (args) => {
      const result = await client.racApi.racConnectionTokensList({
        endpoint: args.endpoint as string | undefined,
        provider: args.provider as number | undefined,
        search: args.search as string | undefined,
        ordering: args.ordering as string | undefined,
        page: args.page as number | undefined,
        pageSize: args.page_size as number | undefined,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 7. Get RAC connection token
  registerTool(server, config, {
    name: 'authentik_rac_connection_tokens_get',
    description: 'Get a single RAC connection token by its UUID.',
    accessTier: 'read-only',
    category: 'rac',
    inputSchema: {
      connection_token_uuid: z.string().describe('Connection token UUID'),
    },
    handler: async (args) => {
      const result = await client.racApi.racConnectionTokensRetrieve({
        connectionTokenUuid: args.connection_token_uuid as string,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 8. Delete RAC connection token
  registerTool(server, config, {
    name: 'authentik_rac_connection_tokens_delete',
    description: 'Delete a RAC connection token by its UUID. This action is irreversible.',
    accessTier: 'full',
    category: 'rac',
    tags: ['destructive'],
    inputSchema: {
      connection_token_uuid: z.string().describe('Connection token UUID to delete'),
    },
    handler: async (args) => {
      await client.racApi.racConnectionTokensDestroy({
        connectionTokenUuid: args.connection_token_uuid as string,
      });
      return `RAC connection token "${args.connection_token_uuid}" deleted successfully.`;
    },
  });
}
