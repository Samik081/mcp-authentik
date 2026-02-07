import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { AuthentikClient } from '../core/client.js';
import type { AppConfig } from '../types/index.js';
import { registerTool } from '../core/tools.js';

export function registerApplicationTools(
  server: McpServer,
  client: AuthentikClient,
  config: AppConfig,
): void {
  // 1. List applications
  registerTool(server, config, {
    name: 'authentik_apps_list',
    description: 'List applications with optional filters for name, slug, group, search, and more.',
    accessTier: 'read-only',
    category: 'core',
    inputSchema: {
      name: z.string().optional().describe('Filter by exact application name'),
      slug: z.string().optional().describe('Filter by exact slug'),
      group: z.string().optional().describe('Filter by application group'),
      search: z.string().optional().describe('Search across application fields'),
      superuser_full_list: z.boolean().optional().describe('When true, return all apps regardless of policy'),
      for_user: z.number().optional().describe('Filter applications accessible by this user ID'),
      ordering: z.string().optional().describe('Field to order by (prefix with - for descending)'),
      page: z.number().optional().describe('Page number'),
      page_size: z.number().optional().describe('Number of results per page'),
    },
    handler: async (args) => {
      const result = await client.coreApi.coreApplicationsList({
        name: args.name as string | undefined,
        slug: args.slug as string | undefined,
        group: args.group as string | undefined,
        search: args.search as string | undefined,
        superuserFullList: args.superuser_full_list as boolean | undefined,
        forUser: args.for_user as number | undefined,
        ordering: args.ordering as string | undefined,
        page: args.page as number | undefined,
        pageSize: args.page_size as number | undefined,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 2. Get application
  registerTool(server, config, {
    name: 'authentik_apps_get',
    description: 'Get a single application by its slug.',
    accessTier: 'read-only',
    category: 'core',
    inputSchema: {
      slug: z.string().describe('Application slug'),
    },
    handler: async (args) => {
      const result = await client.coreApi.coreApplicationsRetrieve({
        slug: args.slug as string,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 3. Create application
  registerTool(server, config, {
    name: 'authentik_apps_create',
    description: 'Create a new application with name, slug, and optional provider, group, and metadata.',
    accessTier: 'full',
    category: 'core',
    inputSchema: {
      name: z.string().describe('Application display name (required)'),
      slug: z.string().describe('Internal application slug for URLs (required)'),
      provider: z.number().optional().describe('Provider ID to associate'),
      group: z.string().optional().describe('Application group name'),
      meta_launch_url: z.string().optional().describe('Launch URL for the application'),
      meta_description: z.string().optional().describe('Application description'),
      meta_publisher: z.string().optional().describe('Application publisher'),
      policy_engine_mode: z.enum(['all', 'any']).optional().describe('Policy engine mode: "all" (all policies must pass) or "any" (any policy must pass)'),
      open_in_new_tab: z.boolean().optional().describe('Open launch URL in a new browser tab'),
    },
    handler: async (args) => {
      const result = await client.coreApi.coreApplicationsCreate({
        applicationRequest: {
          name: args.name as string,
          slug: args.slug as string,
          provider: args.provider as number | undefined,
          group: args.group as string | undefined,
          metaLaunchUrl: args.meta_launch_url as string | undefined,
          metaDescription: args.meta_description as string | undefined,
          metaPublisher: args.meta_publisher as string | undefined,
          policyEngineMode: args.policy_engine_mode as 'all' | 'any' | undefined,
          openInNewTab: args.open_in_new_tab as boolean | undefined,
        },
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 4. Update application
  registerTool(server, config, {
    name: 'authentik_apps_update',
    description: 'Update an existing application. Only provided fields are modified (partial update).',
    accessTier: 'full',
    category: 'core',
    inputSchema: {
      slug: z.string().describe('Application slug (required, used as identifier)'),
      name: z.string().optional().describe('New display name'),
      provider: z.number().optional().describe('New provider ID'),
      group: z.string().optional().describe('New application group name'),
      meta_launch_url: z.string().optional().describe('New launch URL'),
      meta_description: z.string().optional().describe('New description'),
      meta_publisher: z.string().optional().describe('New publisher'),
      policy_engine_mode: z.enum(['all', 'any']).optional().describe('Policy engine mode'),
      open_in_new_tab: z.boolean().optional().describe('Open launch URL in a new browser tab'),
    },
    handler: async (args) => {
      const result = await client.coreApi.coreApplicationsPartialUpdate({
        slug: args.slug as string,
        patchedApplicationRequest: {
          name: args.name as string | undefined,
          provider: args.provider as number | undefined,
          group: args.group as string | undefined,
          metaLaunchUrl: args.meta_launch_url as string | undefined,
          metaDescription: args.meta_description as string | undefined,
          metaPublisher: args.meta_publisher as string | undefined,
          policyEngineMode: args.policy_engine_mode as 'all' | 'any' | undefined,
          openInNewTab: args.open_in_new_tab as boolean | undefined,
        },
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 4b. Set application icon via URL
  registerTool(server, config, {
    name: 'authentik_apps_set_icon_url',
    description: 'Set an application icon from a URL. Provide a URL pointing to an image to use as the application icon, or set clear to true to remove the current icon.',
    accessTier: 'full',
    category: 'core',
    inputSchema: {
      slug: z.string().describe('Application slug (required)'),
      url: z.string().optional().describe('URL pointing to the icon image'),
      clear: z.boolean().optional().describe('Set to true to clear/remove the current icon'),
    },
    handler: async (args) => {
      const slug = args.slug as string;
      if (args.clear) {
        await client.coreApi.coreApplicationsSetIconCreate({ slug, clear: true });
        return `Icon cleared for application "${slug}".`;
      }
      if (!args.url) {
        throw new Error('Either "url" or "clear: true" must be provided.');
      }
      await client.coreApi.coreApplicationsSetIconUrlCreate({
        slug,
        filePathRequest: { url: args.url as string },
      });
      return `Icon set for application "${slug}" from URL: ${args.url}`;
    },
  });

  // 5. Delete application
  registerTool(server, config, {
    name: 'authentik_apps_delete',
    description: 'Delete an application by its slug. This action is irreversible.',
    accessTier: 'full',
    category: 'core',
    tags: ['destructive'],
    inputSchema: {
      slug: z.string().describe('Application slug to delete'),
    },
    handler: async (args) => {
      await client.coreApi.coreApplicationsDestroy({ slug: args.slug as string });
      return `Application "${args.slug}" deleted successfully.`;
    },
  });

  // 6. Check access
  registerTool(server, config, {
    name: 'authentik_apps_check_access',
    description: 'Check whether a specific user has access to an application.',
    accessTier: 'read-only',
    category: 'core',
    inputSchema: {
      slug: z.string().describe('Application slug'),
      for_user: z.number().optional().describe('User ID to check access for'),
    },
    handler: async (args) => {
      const result = await client.coreApi.coreApplicationsCheckAccessRetrieve({
        slug: args.slug as string,
        forUser: args.for_user as number | undefined,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 7. Transactional application update (create app + provider atomically)
  registerTool(server, config, {
    name: 'authentik_apps_update_transactional',
    description: 'Create or update an application and its provider in a single atomic transaction. Useful for setting up an application with a new provider.',
    accessTier: 'full',
    category: 'core',
    inputSchema: {
      app: z.object({
        name: z.string().describe('Application display name'),
        slug: z.string().describe('Application slug'),
        provider: z.number().optional().describe('Existing provider ID'),
        group: z.string().optional().describe('Application group'),
        meta_launch_url: z.string().optional().describe('Launch URL'),
        meta_description: z.string().optional().describe('Description'),
        meta_publisher: z.string().optional().describe('Publisher'),
      }).describe('Application configuration'),
      provider_model: z.string().describe('Provider model identifier (e.g. "authentik_providers_oauth2.oauth2provider")'),
      provider: z.record(z.unknown()).describe('Provider configuration object. IMPORTANT: Use camelCase field names (e.g. authorizationFlow, invalidationFlow, propertyMappings, clientType). Must include a providerModel discriminator field matching provider_model value. For OAuth2, redirectUris must be an array of {matchingMode: "strict", url: "..."} objects.'),
    },
    handler: async (args) => {
      const app = args.app as Record<string, unknown>;
      const result = await client.coreApi.coreTransactionalApplicationsUpdate({
        transactionApplicationRequest: {
          app: {
            name: app.name as string,
            slug: app.slug as string,
            provider: app.provider as number | undefined,
            group: app.group as string | undefined,
            metaLaunchUrl: app.meta_launch_url as string | undefined,
            metaDescription: app.meta_description as string | undefined,
            metaPublisher: app.meta_publisher as string | undefined,
          },
          providerModel: args.provider_model as string as any,
          provider: args.provider as any,
        },
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 8. List application entitlements
  registerTool(server, config, {
    name: 'authentik_app_entitlements_list',
    description: 'List application entitlements with optional filters.',
    accessTier: 'read-only',
    category: 'core',
    inputSchema: {
      app: z.string().optional().describe('Filter by application slug'),
      name: z.string().optional().describe('Filter by entitlement name'),
      ordering: z.string().optional().describe('Field to order by'),
      page: z.number().optional().describe('Page number'),
      page_size: z.number().optional().describe('Number of results per page'),
      search: z.string().optional().describe('Search across entitlement fields'),
    },
    handler: async (args) => {
      const result = await client.coreApi.coreApplicationEntitlementsList({
        app: args.app as string | undefined,
        name: args.name as string | undefined,
        ordering: args.ordering as string | undefined,
        page: args.page as number | undefined,
        pageSize: args.page_size as number | undefined,
        search: args.search as string | undefined,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 9. Get application entitlement
  registerTool(server, config, {
    name: 'authentik_app_entitlements_get',
    description: 'Get a single application entitlement by its UUID.',
    accessTier: 'read-only',
    category: 'core',
    inputSchema: {
      pbm_uuid: z.string().describe('Entitlement UUID'),
    },
    handler: async (args) => {
      const result = await client.coreApi.coreApplicationEntitlementsRetrieve({
        pbmUuid: args.pbm_uuid as string,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 10. Create application entitlement
  registerTool(server, config, {
    name: 'authentik_app_entitlements_create',
    description: 'Create a new application entitlement.',
    accessTier: 'full',
    category: 'core',
    inputSchema: {
      name: z.string().describe('Entitlement name (required)'),
      app: z.string().describe('Application slug or UUID (required)'),
      attributes: z.record(z.unknown()).optional().describe('Custom attributes'),
    },
    handler: async (args) => {
      const result = await client.coreApi.coreApplicationEntitlementsCreate({
        applicationEntitlementRequest: {
          name: args.name as string,
          app: args.app as string,
          attributes: args.attributes as Record<string, unknown> | undefined,
        },
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 11. Update application entitlement
  registerTool(server, config, {
    name: 'authentik_app_entitlements_update',
    description: 'Update an existing application entitlement. Only provided fields are modified (partial update).',
    accessTier: 'full',
    category: 'core',
    inputSchema: {
      pbm_uuid: z.string().describe('Entitlement UUID (required)'),
      name: z.string().optional().describe('New entitlement name'),
      app: z.string().optional().describe('New application slug or UUID'),
      attributes: z.record(z.unknown()).optional().describe('New custom attributes'),
    },
    handler: async (args) => {
      const result = await client.coreApi.coreApplicationEntitlementsPartialUpdate({
        pbmUuid: args.pbm_uuid as string,
        patchedApplicationEntitlementRequest: {
          name: args.name as string | undefined,
          app: args.app as string | undefined,
          attributes: args.attributes as Record<string, unknown> | undefined,
        },
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 12. Delete application entitlement
  registerTool(server, config, {
    name: 'authentik_app_entitlements_delete',
    description: 'Delete an application entitlement by its UUID. This action is irreversible.',
    accessTier: 'full',
    category: 'core',
    tags: ['destructive'],
    inputSchema: {
      pbm_uuid: z.string().describe('Entitlement UUID to delete'),
    },
    handler: async (args) => {
      await client.coreApi.coreApplicationEntitlementsDestroy({
        pbmUuid: args.pbm_uuid as string,
      });
      return `Application entitlement ${args.pbm_uuid} deleted successfully.`;
    },
  });
}
