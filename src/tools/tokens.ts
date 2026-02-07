import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { AuthentikClient } from '../core/client.js';
import type { AppConfig } from '../types/index.js';
import { registerTool } from '../core/tools.js';

export function registerTokenTools(
  server: McpServer,
  client: AuthentikClient,
  config: AppConfig,
): void {
  // 1. List tokens
  registerTool(server, config, {
    name: 'authentik_tokens_list',
    description: 'List tokens with optional filters for identifier, intent, managed status, and search.',
    accessTier: 'read-only',
    category: 'core',
    inputSchema: {
      identifier: z.string().optional().describe('Filter by exact token identifier'),
      intent: z.enum(['api', 'app_password', 'recovery', 'verification']).optional().describe('Filter by token intent'),
      managed: z.string().optional().describe('Filter by managed status'),
      description: z.string().optional().describe('Filter by description'),
      search: z.string().optional().describe('Search across token fields'),
      ordering: z.string().optional().describe('Field to order by (prefix with - for descending)'),
      page: z.number().optional().describe('Page number'),
      page_size: z.number().optional().describe('Number of results per page'),
    },
    handler: async (args) => {
      const result = await client.coreApi.coreTokensList({
        identifier: args.identifier as string | undefined,
        intent: args.intent as 'api' | 'app_password' | 'recovery' | 'verification' | undefined,
        managed: args.managed as string | undefined,
        description: args.description as string | undefined,
        search: args.search as string | undefined,
        ordering: args.ordering as string | undefined,
        page: args.page as number | undefined,
        pageSize: args.page_size as number | undefined,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 2. Get token
  registerTool(server, config, {
    name: 'authentik_tokens_get',
    description: 'Get a single token by its identifier.',
    accessTier: 'read-only',
    category: 'core',
    inputSchema: {
      identifier: z.string().describe('Token identifier'),
    },
    handler: async (args) => {
      const result = await client.coreApi.coreTokensRetrieve({
        identifier: args.identifier as string,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 3. Create token
  registerTool(server, config, {
    name: 'authentik_tokens_create',
    description: 'Create a new token with an identifier, optional intent, description, and expiration settings.',
    accessTier: 'full',
    category: 'core',
    inputSchema: {
      identifier: z.string().describe('Unique token identifier (required)'),
      intent: z.enum(['api', 'app_password', 'recovery', 'verification']).optional().describe('Token intent/purpose'),
      description: z.string().optional().describe('Token description'),
      expiring: z.boolean().optional().describe('Whether the token expires'),
      expires: z.string().optional().describe('Expiration date (ISO 8601)'),
      user: z.number().optional().describe('User ID to associate the token with'),
    },
    handler: async (args) => {
      const result = await client.coreApi.coreTokensCreate({
        tokenRequest: {
          identifier: args.identifier as string,
          intent: args.intent as 'api' | 'app_password' | 'recovery' | 'verification' | undefined,
          description: args.description as string | undefined,
          expiring: args.expiring as boolean | undefined,
          expires: args.expires ? new Date(args.expires as string) : undefined,
          user: args.user as number | undefined,
        },
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 4. Update token
  registerTool(server, config, {
    name: 'authentik_tokens_update',
    description: 'Update an existing token. Only provided fields are modified (partial update).',
    accessTier: 'full',
    category: 'core',
    inputSchema: {
      identifier: z.string().describe('Token identifier (required)'),
      description: z.string().optional().describe('New description'),
      expiring: z.boolean().optional().describe('Whether the token expires'),
      expires: z.string().optional().describe('New expiration date (ISO 8601)'),
      user: z.number().optional().describe('User ID to associate'),
      intent: z.enum(['api', 'app_password', 'recovery', 'verification']).optional().describe('Token intent/purpose'),
    },
    handler: async (args) => {
      const result = await client.coreApi.coreTokensPartialUpdate({
        identifier: args.identifier as string,
        patchedTokenRequest: {
          description: args.description as string | undefined,
          expiring: args.expiring as boolean | undefined,
          expires: args.expires ? new Date(args.expires as string) : undefined,
          user: args.user as number | undefined,
          intent: args.intent as 'api' | 'app_password' | 'recovery' | 'verification' | undefined,
        },
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 5. Delete token
  registerTool(server, config, {
    name: 'authentik_tokens_delete',
    description: 'Delete a token by its identifier. This action is irreversible.',
    accessTier: 'full',
    category: 'core',
    tags: ['destructive'],
    inputSchema: {
      identifier: z.string().describe('Token identifier to delete'),
    },
    handler: async (args) => {
      await client.coreApi.coreTokensDestroy({
        identifier: args.identifier as string,
      });
      return `Token "${args.identifier}" deleted successfully.`;
    },
  });

  // 6. View token key
  registerTool(server, config, {
    name: 'authentik_tokens_view_key',
    description: 'View the raw key value of a token. This is a privileged operation that is logged.',
    accessTier: 'full',
    category: 'core',
    inputSchema: {
      identifier: z.string().describe('Token identifier'),
    },
    handler: async (args) => {
      const result = await client.coreApi.coreTokensViewKeyRetrieve({
        identifier: args.identifier as string,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 7. Set token key
  registerTool(server, config, {
    name: 'authentik_tokens_set_key',
    description: 'Set a custom key value for a token. Requires authentik_core.set_token_key permission.',
    accessTier: 'full',
    category: 'core',
    inputSchema: {
      identifier: z.string().describe('Token identifier'),
      key: z.string().describe('New key value to set'),
    },
    handler: async (args) => {
      await client.coreApi.coreTokensSetKeyCreate({
        identifier: args.identifier as string,
        tokenSetKeyRequest: {
          key: args.key as string,
        },
      });
      return `Key set successfully for token "${args.identifier}".`;
    },
  });
}
