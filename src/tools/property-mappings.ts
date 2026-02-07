import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { AuthentikClient } from '../core/client.js';
import type { AppConfig } from '../types/index.js';
import { registerTool } from '../core/tools.js';

/**
 * SDK method-name suffix for per-type property mapping operations.
 * E.g., for 'notification' → `propertymappingsNotificationList`, etc.
 */
const PMAP_TYPE_SDK_SUFFIX: Record<string, string> = {
  notification: 'Notification',
  provider_google_workspace: 'ProviderGoogleWorkspace',
  provider_microsoft_entra: 'ProviderMicrosoftEntra',
  provider_rac: 'ProviderRac',
  provider_radius: 'ProviderRadius',
  provider_saml: 'ProviderSaml',
  provider_scim: 'ProviderScim',
  provider_scope: 'ProviderScope',
  source_kerberos: 'SourceKerberos',
  source_ldap: 'SourceLdap',
  source_oauth: 'SourceOauth',
  source_plex: 'SourcePlex',
  source_saml: 'SourceSaml',
  source_scim: 'SourceScim',
};

/**
 * Request body property key for create calls.
 */
const PMAP_TYPE_REQUEST_KEY: Record<string, string> = {
  notification: 'notificationWebhookMappingRequest',
  provider_google_workspace: 'googleWorkspaceProviderMappingRequest',
  provider_microsoft_entra: 'microsoftEntraProviderMappingRequest',
  provider_rac: 'rACPropertyMappingRequest',
  provider_radius: 'radiusProviderPropertyMappingRequest',
  provider_saml: 'sAMLPropertyMappingRequest',
  provider_scim: 'sCIMMappingRequest',
  provider_scope: 'scopeMappingRequest',
  source_kerberos: 'kerberosSourcePropertyMappingRequest',
  source_ldap: 'lDAPSourcePropertyMappingRequest',
  source_oauth: 'oAuthSourcePropertyMappingRequest',
  source_plex: 'plexSourcePropertyMappingRequest',
  source_saml: 'sAMLSourcePropertyMappingRequest',
  source_scim: 'sCIMSourcePropertyMappingRequest',
};

/**
 * Request body property key for partial-update (PATCH) calls.
 */
const PMAP_TYPE_PATCHED_KEY: Record<string, string> = {
  notification: 'patchedNotificationWebhookMappingRequest',
  provider_google_workspace: 'patchedGoogleWorkspaceProviderMappingRequest',
  provider_microsoft_entra: 'patchedMicrosoftEntraProviderMappingRequest',
  provider_rac: 'patchedRACPropertyMappingRequest',
  provider_radius: 'patchedRadiusProviderPropertyMappingRequest',
  provider_saml: 'patchedSAMLPropertyMappingRequest',
  provider_scim: 'patchedSCIMMappingRequest',
  provider_scope: 'patchedScopeMappingRequest',
  source_kerberos: 'patchedKerberosSourcePropertyMappingRequest',
  source_ldap: 'patchedLDAPSourcePropertyMappingRequest',
  source_oauth: 'patchedOAuthSourcePropertyMappingRequest',
  source_plex: 'patchedPlexSourcePropertyMappingRequest',
  source_saml: 'patchedSAMLSourcePropertyMappingRequest',
  source_scim: 'patchedSCIMSourcePropertyMappingRequest',
};

const VALID_PMAP_TYPES = Object.keys(PMAP_TYPE_SDK_SUFFIX).join(', ');

export function registerPropertyMappingTools(
  server: McpServer,
  client: AuthentikClient,
  config: AppConfig,
): void {
  // ── Cross-type operations ──────────────────────────────────────────

  // 1. List all property mappings (cross-type)
  registerTool(server, config, {
    name: 'authentik_property_mappings_list',
    description: 'List all property mappings across all types.',
    accessTier: 'read-only',
    category: 'property-mappings',
    inputSchema: {
      name: z.string().optional().describe('Filter by exact mapping name'),
      search: z.string().optional().describe('Search across mapping fields'),
      ordering: z.string().optional().describe('Field to order by (prefix with - for descending)'),
      page: z.number().optional().describe('Page number'),
      page_size: z.number().optional().describe('Number of results per page'),
    },
    handler: async (args) => {
      const result = await client.propertymappingsApi.propertymappingsAllList({
        name: args.name as string | undefined,
        search: args.search as string | undefined,
        ordering: args.ordering as string | undefined,
        page: args.page as number | undefined,
        pageSize: args.page_size as number | undefined,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 2. Get a single property mapping (cross-type)
  registerTool(server, config, {
    name: 'authentik_property_mappings_get',
    description: 'Get a single property mapping by its UUID (cross-type).',
    accessTier: 'read-only',
    category: 'property-mappings',
    inputSchema: {
      pm_uuid: z.string().describe('Property mapping UUID'),
    },
    handler: async (args) => {
      const result = await client.propertymappingsApi.propertymappingsAllRetrieve({
        pmUuid: args.pm_uuid as string,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 3. Delete a property mapping (cross-type)
  registerTool(server, config, {
    name: 'authentik_property_mappings_delete',
    description: 'Delete a property mapping by its UUID. This action is irreversible.',
    accessTier: 'full',
    category: 'property-mappings',
    tags: ['destructive'],
    inputSchema: {
      pm_uuid: z.string().describe('Property mapping UUID to delete'),
    },
    handler: async (args) => {
      await client.propertymappingsApi.propertymappingsAllDestroy({
        pmUuid: args.pm_uuid as string,
      });
      return `Property mapping "${args.pm_uuid}" deleted successfully.`;
    },
  });

  // 4. List property mapping types
  registerTool(server, config, {
    name: 'authentik_property_mappings_types_list',
    description: 'List all available property mapping types that can be created.',
    accessTier: 'read-only',
    category: 'property-mappings',
    inputSchema: {},
    handler: async () => {
      const result = await client.propertymappingsApi.propertymappingsAllTypesList();
      return JSON.stringify(result, null, 2);
    },
  });

  // 5. Test a property mapping
  registerTool(server, config, {
    name: 'authentik_property_mappings_test',
    description: 'Test a property mapping by UUID. Optionally provide user, context, and format_result.',
    accessTier: 'full',
    category: 'property-mappings',
    inputSchema: {
      pm_uuid: z.string().describe('Property mapping UUID to test'),
      user: z.number().optional().describe('User ID to use as test context'),
      context: z.record(z.unknown()).optional().describe('Additional context for the test'),
      format_result: z.boolean().optional().describe('Whether to format the result'),
    },
    handler: async (args) => {
      const result = await client.propertymappingsApi.propertymappingsAllTestCreate({
        pmUuid: args.pm_uuid as string,
        formatResult: args.format_result as boolean | undefined,
        propertyMappingTestRequest: args.user !== undefined || args.context !== undefined
          ? {
              user: args.user as number | undefined,
              context: args.context as Record<string, unknown> | undefined,
            } as any
          : undefined,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // ── Per-type operations (dispatchers) ──────────────────────────────

  // 6. List property mappings by type
  registerTool(server, config, {
    name: 'authentik_property_mappings_by_type_list',
    description: `List property mappings of a specific type. Valid types: ${VALID_PMAP_TYPES}.`,
    accessTier: 'read-only',
    category: 'property-mappings',
    inputSchema: {
      mapping_type: z.string().describe(`Mapping type: ${VALID_PMAP_TYPES}`),
      name: z.string().optional().describe('Filter by name'),
      search: z.string().optional().describe('Search across fields'),
      ordering: z.string().optional().describe('Field to order by'),
      page: z.number().optional().describe('Page number'),
      page_size: z.number().optional().describe('Number of results per page'),
    },
    handler: async (args) => {
      const mappingType = args.mapping_type as string;
      const suffix = PMAP_TYPE_SDK_SUFFIX[mappingType];
      if (!suffix) {
        throw new Error(`Invalid mapping_type "${mappingType}". Valid types: ${VALID_PMAP_TYPES}`);
      }
      const methodName = `propertymappings${suffix}List` as keyof typeof client.propertymappingsApi;
      const method = (client.propertymappingsApi[methodName] as Function).bind(client.propertymappingsApi);
      const result = await method({
        name: args.name as string | undefined,
        search: args.search as string | undefined,
        ordering: args.ordering as string | undefined,
        page: args.page as number | undefined,
        pageSize: args.page_size as number | undefined,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 7. Get a property mapping by type
  registerTool(server, config, {
    name: 'authentik_property_mappings_by_type_get',
    description: `Get a single property mapping by type and UUID. Valid types: ${VALID_PMAP_TYPES}.`,
    accessTier: 'read-only',
    category: 'property-mappings',
    inputSchema: {
      mapping_type: z.string().describe(`Mapping type: ${VALID_PMAP_TYPES}`),
      pm_uuid: z.string().describe('Property mapping UUID'),
    },
    handler: async (args) => {
      const mappingType = args.mapping_type as string;
      const suffix = PMAP_TYPE_SDK_SUFFIX[mappingType];
      if (!suffix) {
        throw new Error(`Invalid mapping_type "${mappingType}". Valid types: ${VALID_PMAP_TYPES}`);
      }
      const methodName = `propertymappings${suffix}Retrieve` as keyof typeof client.propertymappingsApi;
      const method = (client.propertymappingsApi[methodName] as Function).bind(client.propertymappingsApi);
      const result = await method({ pmUuid: args.pm_uuid as string });
      return JSON.stringify(result, null, 2);
    },
  });

  // 8. Create a property mapping by type
  registerTool(server, config, {
    name: 'authentik_property_mappings_by_type_create',
    description: `Create a new property mapping of a specific type. Valid types: ${VALID_PMAP_TYPES}. Pass the type-specific configuration as a JSON object in the "config" parameter.`,
    accessTier: 'full',
    category: 'property-mappings',
    inputSchema: {
      mapping_type: z.string().describe(`Mapping type: ${VALID_PMAP_TYPES}`),
      config: z.record(z.unknown()).describe('Mapping configuration object (fields depend on mapping_type). Must include "name" and "expression".'),
    },
    handler: async (args) => {
      const mappingType = args.mapping_type as string;
      const suffix = PMAP_TYPE_SDK_SUFFIX[mappingType];
      const requestKey = PMAP_TYPE_REQUEST_KEY[mappingType];
      if (!suffix || !requestKey) {
        throw new Error(`Invalid mapping_type "${mappingType}". Valid types: ${VALID_PMAP_TYPES}`);
      }
      const methodName = `propertymappings${suffix}Create` as keyof typeof client.propertymappingsApi;
      const method = (client.propertymappingsApi[methodName] as Function).bind(client.propertymappingsApi);
      const result = await method({ [requestKey]: args.config });
      return JSON.stringify(result, null, 2);
    },
  });

  // 9. Update a property mapping by type (partial update)
  registerTool(server, config, {
    name: 'authentik_property_mappings_by_type_update',
    description: `Update an existing property mapping by type and UUID. Only provided fields are modified (partial update). Valid types: ${VALID_PMAP_TYPES}.`,
    accessTier: 'full',
    category: 'property-mappings',
    inputSchema: {
      mapping_type: z.string().describe(`Mapping type: ${VALID_PMAP_TYPES}`),
      pm_uuid: z.string().describe('Property mapping UUID'),
      config: z.record(z.unknown()).describe('Fields to update (partial update).'),
    },
    handler: async (args) => {
      const mappingType = args.mapping_type as string;
      const suffix = PMAP_TYPE_SDK_SUFFIX[mappingType];
      const patchedKey = PMAP_TYPE_PATCHED_KEY[mappingType];
      if (!suffix || !patchedKey) {
        throw new Error(`Invalid mapping_type "${mappingType}". Valid types: ${VALID_PMAP_TYPES}`);
      }
      const methodName = `propertymappings${suffix}PartialUpdate` as keyof typeof client.propertymappingsApi;
      const method = (client.propertymappingsApi[methodName] as Function).bind(client.propertymappingsApi);
      const result = await method({
        pmUuid: args.pm_uuid as string,
        [patchedKey]: args.config,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 10. Delete a property mapping by type
  registerTool(server, config, {
    name: 'authentik_property_mappings_by_type_delete',
    description: `Delete a property mapping by type and UUID. This action is irreversible. Valid types: ${VALID_PMAP_TYPES}.`,
    accessTier: 'full',
    category: 'property-mappings',
    tags: ['destructive'],
    inputSchema: {
      mapping_type: z.string().describe(`Mapping type: ${VALID_PMAP_TYPES}`),
      pm_uuid: z.string().describe('Property mapping UUID to delete'),
    },
    handler: async (args) => {
      const mappingType = args.mapping_type as string;
      const suffix = PMAP_TYPE_SDK_SUFFIX[mappingType];
      if (!suffix) {
        throw new Error(`Invalid mapping_type "${mappingType}". Valid types: ${VALID_PMAP_TYPES}`);
      }
      const methodName = `propertymappings${suffix}Destroy` as keyof typeof client.propertymappingsApi;
      const method = (client.propertymappingsApi[methodName] as Function).bind(client.propertymappingsApi);
      await method({ pmUuid: args.pm_uuid as string });
      return `Property mapping "${args.pm_uuid}" (type: ${mappingType}) deleted successfully.`;
    },
  });
}
