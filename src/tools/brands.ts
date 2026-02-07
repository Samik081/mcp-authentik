import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { AuthentikClient } from '../core/client.js';
import type { AppConfig } from '../types/index.js';
import { registerTool } from '../core/tools.js';

export function registerBrandTools(
  server: McpServer,
  client: AuthentikClient,
  config: AppConfig,
): void {
  // 1. List brands
  registerTool(server, config, {
    name: 'authentik_brands_list',
    description: 'List brands with optional filters for UUID, domain, and search.',
    accessTier: 'read-only',
    category: 'core',
    inputSchema: {
      brand_uuid: z.string().optional().describe('Filter by brand UUID'),
      domain: z.string().optional().describe('Filter by domain'),
      search: z.string().optional().describe('Search across brand fields'),
      ordering: z.string().optional().describe('Field to order by (prefix with - for descending)'),
      page: z.number().optional().describe('Page number'),
      page_size: z.number().optional().describe('Number of results per page'),
    },
    handler: async (args) => {
      const result = await client.coreApi.coreBrandsList({
        brandUuid: args.brand_uuid as string | undefined,
        domain: args.domain as string | undefined,
        search: args.search as string | undefined,
        ordering: args.ordering as string | undefined,
        page: args.page as number | undefined,
        pageSize: args.page_size as number | undefined,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 2. Get brand
  registerTool(server, config, {
    name: 'authentik_brands_get',
    description: 'Get a single brand by its UUID.',
    accessTier: 'read-only',
    category: 'core',
    inputSchema: {
      brand_uuid: z.string().describe('Brand UUID'),
    },
    handler: async (args) => {
      const result = await client.coreApi.coreBrandsRetrieve({
        brandUuid: args.brand_uuid as string,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 3. Create brand
  registerTool(server, config, {
    name: 'authentik_brands_create',
    description: 'Create a new brand with domain, branding settings, flow assignments, and optional attributes.',
    accessTier: 'full',
    category: 'core',
    inputSchema: {
      domain: z.string().describe('Domain that activates this brand (required). Can be a superset, e.g. "a.b" matches "aa.b" and "ba.b".'),
      is_default: z.boolean().optional().describe('Whether this is the default brand'),
      branding_title: z.string().optional().describe('Branding title displayed in the UI'),
      branding_logo: z.string().optional().describe('URL or path to the branding logo'),
      branding_favicon: z.string().optional().describe('URL or path to the favicon'),
      flow_authentication: z.string().optional().describe('Flow UUID for authentication'),
      flow_invalidation: z.string().optional().describe('Flow UUID for session invalidation'),
      flow_recovery: z.string().optional().describe('Flow UUID for account recovery'),
      flow_unenrollment: z.string().optional().describe('Flow UUID for unenrollment'),
      flow_user_settings: z.string().optional().describe('Flow UUID for user settings'),
      flow_device_code: z.string().optional().describe('Flow UUID for device code authentication'),
      default_application: z.string().optional().describe('Application slug to redirect external users to after authentication'),
      web_certificate: z.string().optional().describe('Web certificate UUID for the authentik core webserver'),
      attributes: z.record(z.unknown()).optional().describe('Custom attributes key-value pairs'),
    },
    handler: async (args) => {
      const result = await client.coreApi.coreBrandsCreate({
        brandRequest: {
          domain: args.domain as string,
          _default: args.is_default as boolean | undefined,
          brandingTitle: args.branding_title as string | undefined,
          brandingLogo: args.branding_logo as string | undefined,
          brandingFavicon: args.branding_favicon as string | undefined,
          flowAuthentication: args.flow_authentication as string | undefined,
          flowInvalidation: args.flow_invalidation as string | undefined,
          flowRecovery: args.flow_recovery as string | undefined,
          flowUnenrollment: args.flow_unenrollment as string | undefined,
          flowUserSettings: args.flow_user_settings as string | undefined,
          flowDeviceCode: args.flow_device_code as string | undefined,
          defaultApplication: args.default_application as string | undefined,
          webCertificate: args.web_certificate as string | undefined,
          attributes: args.attributes as Record<string, unknown> | undefined,
        },
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 4. Update brand
  registerTool(server, config, {
    name: 'authentik_brands_update',
    description: 'Update an existing brand. Only provided fields are modified (partial update).',
    accessTier: 'full',
    category: 'core',
    inputSchema: {
      brand_uuid: z.string().describe('Brand UUID (required)'),
      domain: z.string().optional().describe('New domain'),
      is_default: z.boolean().optional().describe('Whether this is the default brand'),
      branding_title: z.string().optional().describe('New branding title'),
      branding_logo: z.string().optional().describe('New logo URL or path'),
      branding_favicon: z.string().optional().describe('New favicon URL or path'),
      flow_authentication: z.string().optional().describe('Flow UUID for authentication'),
      flow_invalidation: z.string().optional().describe('Flow UUID for session invalidation'),
      flow_recovery: z.string().optional().describe('Flow UUID for account recovery'),
      flow_unenrollment: z.string().optional().describe('Flow UUID for unenrollment'),
      flow_user_settings: z.string().optional().describe('Flow UUID for user settings'),
      flow_device_code: z.string().optional().describe('Flow UUID for device code authentication'),
      default_application: z.string().optional().describe('Application slug'),
      web_certificate: z.string().optional().describe('Web certificate UUID'),
      attributes: z.record(z.unknown()).optional().describe('Custom attributes key-value pairs'),
    },
    handler: async (args) => {
      const result = await client.coreApi.coreBrandsPartialUpdate({
        brandUuid: args.brand_uuid as string,
        patchedBrandRequest: {
          domain: args.domain as string | undefined,
          _default: args.is_default as boolean | undefined,
          brandingTitle: args.branding_title as string | undefined,
          brandingLogo: args.branding_logo as string | undefined,
          brandingFavicon: args.branding_favicon as string | undefined,
          flowAuthentication: args.flow_authentication as string | undefined,
          flowInvalidation: args.flow_invalidation as string | undefined,
          flowRecovery: args.flow_recovery as string | undefined,
          flowUnenrollment: args.flow_unenrollment as string | undefined,
          flowUserSettings: args.flow_user_settings as string | undefined,
          flowDeviceCode: args.flow_device_code as string | undefined,
          defaultApplication: args.default_application as string | undefined,
          webCertificate: args.web_certificate as string | undefined,
          attributes: args.attributes as Record<string, unknown> | undefined,
        },
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 5. Delete brand
  registerTool(server, config, {
    name: 'authentik_brands_delete',
    description: 'Delete a brand by its UUID. This action is irreversible.',
    accessTier: 'full',
    category: 'core',
    tags: ['destructive'],
    inputSchema: {
      brand_uuid: z.string().describe('Brand UUID to delete'),
    },
    handler: async (args) => {
      await client.coreApi.coreBrandsDestroy({
        brandUuid: args.brand_uuid as string,
      });
      return `Brand ${args.brand_uuid} deleted successfully.`;
    },
  });

  // 6. Get current brand
  registerTool(server, config, {
    name: 'authentik_brands_current',
    description: 'Get the brand configuration for the current domain.',
    accessTier: 'read-only',
    category: 'core',
    handler: async () => {
      const result = await client.coreApi.coreBrandsCurrentRetrieve();
      return JSON.stringify(result, null, 2);
    },
  });
}
