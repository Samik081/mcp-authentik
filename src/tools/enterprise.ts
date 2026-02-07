import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { AuthentikClient } from '../core/client.js';
import type { AppConfig } from '../types/index.js';
import { registerTool } from '../core/tools.js';

export function registerEnterpriseTools(
  server: McpServer,
  client: AuthentikClient,
  config: AppConfig,
): void {
  // 1. List enterprise licenses
  registerTool(server, config, {
    name: 'authentik_enterprise_license_list',
    description: 'List enterprise licenses with optional filters.',
    accessTier: 'read-only',
    category: 'enterprise',
    inputSchema: {
      name: z.string().optional().describe('Filter by license name'),
      search: z.string().optional().describe('Search across fields'),
      ordering: z.string().optional().describe('Field to order by'),
      page: z.number().optional().describe('Page number'),
      page_size: z.number().optional().describe('Number of results per page'),
    },
    handler: async (args) => {
      const result = await client.enterpriseApi.enterpriseLicenseList({
        name: args.name as string | undefined,
        search: args.search as string | undefined,
        ordering: args.ordering as string | undefined,
        page: args.page as number | undefined,
        pageSize: args.page_size as number | undefined,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 2. Get enterprise license
  registerTool(server, config, {
    name: 'authentik_enterprise_license_get',
    description: 'Get a single enterprise license by its UUID.',
    accessTier: 'read-only',
    category: 'enterprise',
    inputSchema: {
      license_uuid: z.string().describe('License UUID'),
    },
    handler: async (args) => {
      const result = await client.enterpriseApi.enterpriseLicenseRetrieve({
        licenseUuid: args.license_uuid as string,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 3. Create enterprise license
  registerTool(server, config, {
    name: 'authentik_enterprise_license_create',
    description: 'Install a new enterprise license key.',
    accessTier: 'full',
    category: 'enterprise',
    inputSchema: {
      key: z.string().describe('License key string (required)'),
    },
    handler: async (args) => {
      const result = await client.enterpriseApi.enterpriseLicenseCreate({
        licenseRequest: {
          key: args.key as string,
        },
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 4. Update enterprise license
  registerTool(server, config, {
    name: 'authentik_enterprise_license_update',
    description: 'Update an existing enterprise license. Only provided fields are modified (partial update).',
    accessTier: 'full',
    category: 'enterprise',
    inputSchema: {
      license_uuid: z.string().describe('License UUID (required)'),
      key: z.string().optional().describe('New license key string'),
    },
    handler: async (args) => {
      const result = await client.enterpriseApi.enterpriseLicensePartialUpdate({
        licenseUuid: args.license_uuid as string,
        patchedLicenseRequest: {
          key: args.key as string | undefined,
        },
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 5. Delete enterprise license
  registerTool(server, config, {
    name: 'authentik_enterprise_license_delete',
    description: 'Delete an enterprise license by its UUID. This action is irreversible.',
    accessTier: 'full',
    category: 'enterprise',
    tags: ['destructive'],
    inputSchema: {
      license_uuid: z.string().describe('License UUID to delete'),
    },
    handler: async (args) => {
      await client.enterpriseApi.enterpriseLicenseDestroy({
        licenseUuid: args.license_uuid as string,
      });
      return `Enterprise license "${args.license_uuid}" deleted successfully.`;
    },
  });

  // 6. Get license summary
  registerTool(server, config, {
    name: 'authentik_enterprise_license_summary',
    description: 'Get the total enterprise license status summary.',
    accessTier: 'read-only',
    category: 'enterprise',
    handler: async () => {
      const result = await client.enterpriseApi.enterpriseLicenseSummaryRetrieve();
      return JSON.stringify(result, null, 2);
    },
  });

  // 7. Get license forecast
  registerTool(server, config, {
    name: 'authentik_enterprise_license_forecast',
    description: 'Forecast how many users will be required in a year based on current growth.',
    accessTier: 'read-only',
    category: 'enterprise',
    handler: async () => {
      const result = await client.enterpriseApi.enterpriseLicenseForecastRetrieve();
      return JSON.stringify(result, null, 2);
    },
  });

  // 8. Get install ID
  registerTool(server, config, {
    name: 'authentik_enterprise_install_id',
    description: 'Get the authentik installation ID (used for license generation).',
    accessTier: 'read-only',
    category: 'enterprise',
    handler: async () => {
      const result = await client.enterpriseApi.enterpriseLicenseInstallIdRetrieve();
      return JSON.stringify(result, null, 2);
    },
  });
}
