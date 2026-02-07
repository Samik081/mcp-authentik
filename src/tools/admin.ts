import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { AuthentikClient } from '../core/client.js';
import type { AppConfig } from '../types/index.js';
import { registerTool } from '../core/tools.js';

export function registerAdminTools(
  server: McpServer,
  client: AuthentikClient,
  config: AppConfig,
): void {
  // 1. Get system info
  registerTool(server, config, {
    name: 'authentik_admin_system_info',
    description:
      'Get system information including HTTP host, runtime environment, server time, and embedded outpost status.',
    accessTier: 'read-only',
    category: 'admin',
    handler: async () => {
      const result = await client.adminApi.adminSystemRetrieve();
      return JSON.stringify(result, null, 2);
    },
  });

  // 2. Get version
  registerTool(server, config, {
    name: 'authentik_admin_version',
    description:
      'Get Authentik version information including current version and build hash.',
    accessTier: 'read-only',
    category: 'admin',
    handler: async () => {
      const result = await client.adminApi.adminVersionRetrieve();
      return JSON.stringify(result, null, 2);
    },
  });

  // 3. Get settings
  registerTool(server, config, {
    name: 'authentik_admin_settings_get',
    description: 'Get current system settings.',
    accessTier: 'read-only',
    category: 'admin',
    handler: async () => {
      const result = await client.adminApi.adminSettingsRetrieve();
      return JSON.stringify(result, null, 2);
    },
  });

  // 4. Update settings (partial)
  registerTool(server, config, {
    name: 'authentik_admin_settings_update',
    description: 'Update system settings (partial update).',
    accessTier: 'full',
    category: 'admin',
    inputSchema: {
      avatars: z.string().optional().describe('Configure how authentik should show avatars for users'),
      default_user_change_name: z.boolean().optional().describe('Enable the ability for users to change their name'),
      default_user_change_email: z.boolean().optional().describe('Enable the ability for users to change their email address'),
      default_user_change_username: z.boolean().optional().describe('Enable the ability for users to change their username'),
      event_retention: z.string().optional().describe('Events will be deleted after this duration (format: weeks=3;days=2;hours=3,seconds=2)'),
      footer_links: z.any().optional().describe('Footer links configuration (JSON)'),
      gdpr_compliance: z.boolean().optional().describe('When enabled, all events caused by a user will be deleted upon the user deletion'),
      impersonation: z.boolean().optional().describe('Globally enable/disable impersonation'),
      default_token_duration: z.string().optional().describe('Default token duration'),
      default_token_length: z.number().optional().describe('Default token length'),
    },
    handler: async (args) => {
      const result = await client.adminApi.adminSettingsPartialUpdate({
        patchedSettingsRequest: {
          avatars: args.avatars as string | undefined,
          defaultUserChangeName: args.default_user_change_name as boolean | undefined,
          defaultUserChangeEmail: args.default_user_change_email as boolean | undefined,
          defaultUserChangeUsername: args.default_user_change_username as boolean | undefined,
          eventRetention: args.event_retention as string | undefined,
          footerLinks: args.footer_links,
          gdprCompliance: args.gdpr_compliance as boolean | undefined,
          impersonation: args.impersonation as boolean | undefined,
          defaultTokenDuration: args.default_token_duration as string | undefined,
          defaultTokenLength: args.default_token_length as number | undefined,
        },
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 5. List installed apps
  registerTool(server, config, {
    name: 'authentik_admin_apps',
    description: 'List installed Django applications in the Authentik instance.',
    accessTier: 'read-only',
    category: 'admin',
    handler: async () => {
      const result = await client.adminApi.adminAppsList();
      return JSON.stringify(result, null, 2);
    },
  });

  // 6. List models
  registerTool(server, config, {
    name: 'authentik_admin_models',
    description: 'List all data models available in the Authentik instance.',
    accessTier: 'read-only',
    category: 'admin',
    handler: async () => {
      const result = await client.adminApi.adminModelsList();
      return JSON.stringify(result, null, 2);
    },
  });

  // 7. Version history
  registerTool(server, config, {
    name: 'authentik_admin_version_history',
    description: 'List Authentik version history entries.',
    accessTier: 'read-only',
    category: 'admin',
    inputSchema: {
      ordering: z.string().optional().describe('Field to order by (prefix with - for descending)'),
      search: z.string().optional().describe('Search across version history fields'),
      build: z.string().optional().describe('Filter by build hash'),
      version: z.string().optional().describe('Filter by version string'),
    },
    handler: async (args) => {
      const result = await client.adminApi.adminVersionHistoryList({
        ordering: args.ordering as string | undefined,
        search: args.search as string | undefined,
        build: args.build as string | undefined,
        version: args.version as string | undefined,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 8. Trigger system tasks
  registerTool(server, config, {
    name: 'authentik_admin_system_task_trigger',
    description:
      'Trigger all system tasks (e.g., cleanup, cache clear). Returns updated system info.',
    accessTier: 'full',
    category: 'admin',
    handler: async () => {
      const result = await client.adminApi.adminSystemCreate();
      return JSON.stringify(result, null, 2);
    },
  });
}
