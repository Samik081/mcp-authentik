import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { AuthentikClient } from '../core/client.js';
import type { AppConfig } from '../types/index.js';
import { registerTool } from '../core/tools.js';

export function registerOauth2Tools(
  server: McpServer,
  client: AuthentikClient,
  config: AppConfig,
): void {
  // ── Access Tokens ──

  // 1. List OAuth2 access tokens
  registerTool(server, config, {
    name: 'authentik_oauth2_access_tokens_list',
    description: 'List OAuth2 access tokens with optional filters. Tokens are system-managed.',
    accessTier: 'read-only',
    category: 'oauth2',
    inputSchema: {
      user: z.number().optional().describe('Filter by user ID'),
      provider: z.number().optional().describe('Filter by provider ID'),
      search: z.string().optional().describe('Search across fields'),
      ordering: z.string().optional().describe('Field to order by'),
      page: z.number().optional().describe('Page number'),
      page_size: z.number().optional().describe('Number of results per page'),
    },
    handler: async (args) => {
      const result = await client.oauth2Api.oauth2AccessTokensList({
        user: args.user as number | undefined,
        provider: args.provider as number | undefined,
        search: args.search as string | undefined,
        ordering: args.ordering as string | undefined,
        page: args.page as number | undefined,
        pageSize: args.page_size as number | undefined,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 2. Get OAuth2 access token
  registerTool(server, config, {
    name: 'authentik_oauth2_access_tokens_get',
    description: 'Get a single OAuth2 access token by its numeric ID.',
    accessTier: 'read-only',
    category: 'oauth2',
    inputSchema: {
      id: z.number().describe('Access token ID'),
    },
    handler: async (args) => {
      const result = await client.oauth2Api.oauth2AccessTokensRetrieve({
        id: args.id as number,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 3. Delete OAuth2 access token
  registerTool(server, config, {
    name: 'authentik_oauth2_access_tokens_delete',
    description: 'Delete (revoke) an OAuth2 access token by its ID. This action is irreversible.',
    accessTier: 'full',
    category: 'oauth2',
    tags: ['destructive'],
    inputSchema: {
      id: z.number().describe('Access token ID to delete'),
    },
    handler: async (args) => {
      await client.oauth2Api.oauth2AccessTokensDestroy({
        id: args.id as number,
      });
      return `OAuth2 access token ${args.id} deleted successfully.`;
    },
  });

  // ── Authorization Codes ──

  // 4. List OAuth2 authorization codes
  registerTool(server, config, {
    name: 'authentik_oauth2_auth_codes_list',
    description: 'List OAuth2 authorization codes with optional filters. Codes are system-managed.',
    accessTier: 'read-only',
    category: 'oauth2',
    inputSchema: {
      user: z.number().optional().describe('Filter by user ID'),
      provider: z.number().optional().describe('Filter by provider ID'),
      search: z.string().optional().describe('Search across fields'),
      ordering: z.string().optional().describe('Field to order by'),
      page: z.number().optional().describe('Page number'),
      page_size: z.number().optional().describe('Number of results per page'),
    },
    handler: async (args) => {
      const result = await client.oauth2Api.oauth2AuthorizationCodesList({
        user: args.user as number | undefined,
        provider: args.provider as number | undefined,
        search: args.search as string | undefined,
        ordering: args.ordering as string | undefined,
        page: args.page as number | undefined,
        pageSize: args.page_size as number | undefined,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 5. Get OAuth2 authorization code
  registerTool(server, config, {
    name: 'authentik_oauth2_auth_codes_get',
    description: 'Get a single OAuth2 authorization code by its numeric ID.',
    accessTier: 'read-only',
    category: 'oauth2',
    inputSchema: {
      id: z.number().describe('Authorization code ID'),
    },
    handler: async (args) => {
      const result = await client.oauth2Api.oauth2AuthorizationCodesRetrieve({
        id: args.id as number,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 6. Delete OAuth2 authorization code
  registerTool(server, config, {
    name: 'authentik_oauth2_auth_codes_delete',
    description: 'Delete an OAuth2 authorization code by its ID. This action is irreversible.',
    accessTier: 'full',
    category: 'oauth2',
    tags: ['destructive'],
    inputSchema: {
      id: z.number().describe('Authorization code ID to delete'),
    },
    handler: async (args) => {
      await client.oauth2Api.oauth2AuthorizationCodesDestroy({
        id: args.id as number,
      });
      return `OAuth2 authorization code ${args.id} deleted successfully.`;
    },
  });

  // ── Refresh Tokens ──

  // 7. List OAuth2 refresh tokens
  registerTool(server, config, {
    name: 'authentik_oauth2_refresh_tokens_list',
    description: 'List OAuth2 refresh tokens with optional filters. Tokens are system-managed.',
    accessTier: 'read-only',
    category: 'oauth2',
    inputSchema: {
      user: z.number().optional().describe('Filter by user ID'),
      provider: z.number().optional().describe('Filter by provider ID'),
      search: z.string().optional().describe('Search across fields'),
      ordering: z.string().optional().describe('Field to order by'),
      page: z.number().optional().describe('Page number'),
      page_size: z.number().optional().describe('Number of results per page'),
    },
    handler: async (args) => {
      const result = await client.oauth2Api.oauth2RefreshTokensList({
        user: args.user as number | undefined,
        provider: args.provider as number | undefined,
        search: args.search as string | undefined,
        ordering: args.ordering as string | undefined,
        page: args.page as number | undefined,
        pageSize: args.page_size as number | undefined,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 8. Get OAuth2 refresh token
  registerTool(server, config, {
    name: 'authentik_oauth2_refresh_tokens_get',
    description: 'Get a single OAuth2 refresh token by its numeric ID.',
    accessTier: 'read-only',
    category: 'oauth2',
    inputSchema: {
      id: z.number().describe('Refresh token ID'),
    },
    handler: async (args) => {
      const result = await client.oauth2Api.oauth2RefreshTokensRetrieve({
        id: args.id as number,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 9. Delete OAuth2 refresh token
  registerTool(server, config, {
    name: 'authentik_oauth2_refresh_tokens_delete',
    description: 'Delete (revoke) an OAuth2 refresh token by its ID. This action is irreversible.',
    accessTier: 'full',
    category: 'oauth2',
    tags: ['destructive'],
    inputSchema: {
      id: z.number().describe('Refresh token ID to delete'),
    },
    handler: async (args) => {
      await client.oauth2Api.oauth2RefreshTokensDestroy({
        id: args.id as number,
      });
      return `OAuth2 refresh token ${args.id} deleted successfully.`;
    },
  });
}
