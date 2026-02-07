import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { AuthentikClient } from '../core/client.js';
import type { AppConfig } from '../types/index.js';
import { registerTool } from '../core/tools.js';

// ── Per-type provider lookup maps ───────────────────────────────────────

const PROVIDER_TYPES = [
  'oauth2', 'saml', 'ldap', 'proxy', 'radius', 'scim', 'rac',
  'google_workspace', 'microsoft_entra',
] as const;

type ProviderType = typeof PROVIDER_TYPES[number];

/** Maps provider_type -> SDK method prefix (e.g., providersOauth2List) */
const PROVIDER_TYPE_SDK_PREFIX: Record<ProviderType, string> = {
  oauth2: 'Oauth2',
  saml: 'Saml',
  ldap: 'Ldap',
  proxy: 'Proxy',
  radius: 'Radius',
  scim: 'Scim',
  rac: 'Rac',
  google_workspace: 'GoogleWorkspace',
  microsoft_entra: 'MicrosoftEntra',
};

/** Maps provider_type -> request body key for create */
const PROVIDER_TYPE_REQUEST_KEY: Record<ProviderType, string> = {
  oauth2: 'oAuth2ProviderRequest',
  saml: 'sAMLProviderRequest',
  ldap: 'lDAPProviderRequest',
  proxy: 'proxyProviderRequest',
  radius: 'radiusProviderRequest',
  scim: 'sCIMProviderRequest',
  rac: 'rACProviderRequest',
  google_workspace: 'googleWorkspaceProviderRequest',
  microsoft_entra: 'microsoftEntraProviderRequest',
};

/** Maps provider_type -> patched request body key for update */
const PROVIDER_TYPE_PATCHED_KEY: Record<ProviderType, string> = {
  oauth2: 'patchedOAuth2ProviderRequest',
  saml: 'patchedSAMLProviderRequest',
  ldap: 'patchedLDAPProviderRequest',
  proxy: 'patchedProxyProviderRequest',
  radius: 'patchedRadiusProviderRequest',
  scim: 'patchedSCIMProviderRequest',
  rac: 'patchedRACProviderRequest',
  google_workspace: 'patchedGoogleWorkspaceProviderRequest',
  microsoft_entra: 'patchedMicrosoftEntraProviderRequest',
};

const providerTypeEnum = z.enum(PROVIDER_TYPES);

export function registerProviderTools(
  server: McpServer,
  client: AuthentikClient,
  config: AppConfig,
): void {
  // ── Cross-type provider operations ──────────────────────────────────

  // 1. List all providers (cross-type)
  registerTool(server, config, {
    name: 'authentik_providers_list',
    description: 'List all providers across all types with optional filters.',
    accessTier: 'read-only',
    category: 'providers',
    inputSchema: {
      search: z.string().optional().describe('Search across provider fields'),
      application_isnull: z.boolean().optional().describe('Filter by whether application is null'),
      backchannel: z.boolean().optional().describe('Filter by backchannel status'),
      ordering: z.string().optional().describe('Field to order by'),
      page: z.number().optional().describe('Page number'),
      page_size: z.number().optional().describe('Number of results per page'),
    },
    handler: async (args) => {
      const result = await client.providersApi.providersAllList({
        search: args.search as string | undefined,
        applicationIsnull: args.application_isnull as boolean | undefined,
        backchannel: args.backchannel as boolean | undefined,
        ordering: args.ordering as string | undefined,
        page: args.page as number | undefined,
        pageSize: args.page_size as number | undefined,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 2. Get provider (cross-type)
  registerTool(server, config, {
    name: 'authentik_providers_get',
    description: 'Get a single provider by its numeric ID (cross-type).',
    accessTier: 'read-only',
    category: 'providers',
    inputSchema: {
      id: z.number().describe('Provider ID'),
    },
    handler: async (args) => {
      const result = await client.providersApi.providersAllRetrieve({
        id: args.id as number,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 3. Delete provider (cross-type)
  registerTool(server, config, {
    name: 'authentik_providers_delete',
    description: 'Delete a provider by its numeric ID (cross-type). This action is irreversible.',
    accessTier: 'full',
    category: 'providers',
    tags: ['destructive'],
    inputSchema: {
      id: z.number().describe('Provider ID to delete'),
    },
    handler: async (args) => {
      await client.providersApi.providersAllDestroy({ id: args.id as number });
      return `Provider ${args.id} deleted successfully.`;
    },
  });

  // 4. List provider types
  registerTool(server, config, {
    name: 'authentik_providers_types_list',
    description: 'List all available provider types.',
    accessTier: 'read-only',
    category: 'providers',
    handler: async () => {
      const result = await client.providersApi.providersAllTypesList();
      return JSON.stringify(result, null, 2);
    },
  });

  // ── Per-type provider dispatchers ───────────────────────────────────

  // 5. List providers by type
  registerTool(server, config, {
    name: 'authentik_providers_by_type_list',
    description: 'List providers of a specific type with optional filters.',
    accessTier: 'read-only',
    category: 'providers',
    inputSchema: {
      provider_type: providerTypeEnum.describe('Provider type to list'),
      name: z.string().optional().describe('Filter by provider name'),
      search: z.string().optional().describe('Search across provider fields'),
      ordering: z.string().optional().describe('Field to order by'),
      page: z.number().optional().describe('Page number'),
      page_size: z.number().optional().describe('Number of results per page'),
    },
    handler: async (args) => {
      const providerType = args.provider_type as ProviderType;
      const prefix = PROVIDER_TYPE_SDK_PREFIX[providerType];
      const method = `providers${prefix}List`;
      const result = await (client.providersApi as any)[method]({
        name: args.name as string | undefined,
        search: args.search as string | undefined,
        ordering: args.ordering as string | undefined,
        page: args.page as number | undefined,
        pageSize: args.page_size as number | undefined,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 6. Get provider by type
  registerTool(server, config, {
    name: 'authentik_providers_by_type_get',
    description: 'Get a single provider of a specific type by its numeric ID.',
    accessTier: 'read-only',
    category: 'providers',
    inputSchema: {
      provider_type: providerTypeEnum.describe('Provider type'),
      id: z.number().describe('Provider ID'),
    },
    handler: async (args) => {
      const providerType = args.provider_type as ProviderType;
      const prefix = PROVIDER_TYPE_SDK_PREFIX[providerType];
      const method = `providers${prefix}Retrieve`;
      const result = await (client.providersApi as any)[method]({
        id: args.id as number,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 7. Create provider by type
  registerTool(server, config, {
    name: 'authentik_providers_by_type_create',
    description: 'Create a new provider of a specific type. Pass type-specific fields in the config object.',
    accessTier: 'full',
    category: 'providers',
    inputSchema: {
      provider_type: providerTypeEnum.describe('Provider type to create'),
      name: z.string().describe('Provider name (required)'),
      authorization_flow: z.string().describe('Authorization flow slug (required)'),
      config: z.record(z.unknown()).optional().describe('Type-specific configuration fields (camelCase keys matching the SDK request type)'),
    },
    handler: async (args) => {
      const providerType = args.provider_type as ProviderType;
      const prefix = PROVIDER_TYPE_SDK_PREFIX[providerType];
      const method = `providers${prefix}Create`;
      const reqKey = PROVIDER_TYPE_REQUEST_KEY[providerType];
      const configObj = (args.config as Record<string, unknown>) ?? {};
      const result = await (client.providersApi as any)[method]({
        [reqKey]: {
          name: args.name as string,
          authorizationFlow: args.authorization_flow as string,
          ...configObj,
        },
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 8. Update provider by type
  registerTool(server, config, {
    name: 'authentik_providers_by_type_update',
    description: 'Update an existing provider of a specific type. Pass type-specific fields in the config object.',
    accessTier: 'full',
    category: 'providers',
    inputSchema: {
      provider_type: providerTypeEnum.describe('Provider type'),
      id: z.number().describe('Provider ID (required)'),
      config: z.record(z.unknown()).optional().describe('Type-specific fields to update (camelCase keys matching the SDK patched request type)'),
    },
    handler: async (args) => {
      const providerType = args.provider_type as ProviderType;
      const prefix = PROVIDER_TYPE_SDK_PREFIX[providerType];
      const method = `providers${prefix}PartialUpdate`;
      const patchedKey = PROVIDER_TYPE_PATCHED_KEY[providerType];
      const configObj = (args.config as Record<string, unknown>) ?? {};
      const result = await (client.providersApi as any)[method]({
        id: args.id as number,
        [patchedKey]: { ...configObj },
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 9. Delete provider by type
  registerTool(server, config, {
    name: 'authentik_providers_by_type_delete',
    description: 'Delete a provider of a specific type by its numeric ID. This action is irreversible.',
    accessTier: 'full',
    category: 'providers',
    tags: ['destructive'],
    inputSchema: {
      provider_type: providerTypeEnum.describe('Provider type'),
      id: z.number().describe('Provider ID to delete'),
    },
    handler: async (args) => {
      const providerType = args.provider_type as ProviderType;
      const prefix = PROVIDER_TYPE_SDK_PREFIX[providerType];
      const method = `providers${prefix}Destroy`;
      await (client.providersApi as any)[method]({ id: args.id as number });
      return `Provider ${args.id} (type: ${providerType}) deleted successfully.`;
    },
  });

  // ── Special provider operations ─────────────────────────────────────

  // 10. OAuth2 setup URLs
  registerTool(server, config, {
    name: 'authentik_providers_oauth2_setup_urls',
    description: 'Get OAuth2 provider setup URLs (authorize, token, userinfo, etc.).',
    accessTier: 'read-only',
    category: 'providers',
    inputSchema: {
      id: z.number().describe('OAuth2 provider ID'),
    },
    handler: async (args) => {
      const result = await client.providersApi.providersOauth2SetupUrlsRetrieve({
        id: args.id as number,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 11. SAML metadata
  registerTool(server, config, {
    name: 'authentik_providers_saml_metadata',
    description: 'Get SAML provider metadata XML.',
    accessTier: 'read-only',
    category: 'providers',
    inputSchema: {
      id: z.number().describe('SAML provider ID'),
      download: z.boolean().optional().describe('Whether to force download'),
      force_binding: z.enum([
        'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST',
        'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect',
      ]).optional().describe('Force a specific SAML binding'),
    },
    handler: async (args) => {
      const result = await client.providersApi.providersSamlMetadataRetrieve({
        id: args.id as number,
        download: args.download as boolean | undefined,
        forceBinding: args.force_binding as any,
      });
      return JSON.stringify(result, null, 2);
    },
  });
}
