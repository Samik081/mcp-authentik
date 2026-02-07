import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { AuthentikClient } from '../core/client.js';
import type { AppConfig } from '../types/index.js';
import { registerTool } from '../core/tools.js';

/**
 * SDK method-name prefix for per-type source operations.
 * E.g., for 'oauth' we call `sourcesOauthList`, `sourcesOauthCreate`, etc.
 */
const SOURCE_TYPE_SDK_PREFIX: Record<string, string> = {
  oauth: 'Oauth',
  saml: 'Saml',
  ldap: 'Ldap',
  plex: 'Plex',
  kerberos: 'Kerberos',
  scim: 'Scim',
};

/**
 * Request body property key for create calls (full PUT-style body).
 * Matches the SDK's generated parameter interface key.
 */
const SOURCE_TYPE_REQUEST_KEY: Record<string, string> = {
  oauth: 'oAuthSourceRequest',
  saml: 'sAMLSourceRequest',
  ldap: 'lDAPSourceRequest',
  plex: 'plexSourceRequest',
  kerberos: 'kerberosSourceRequest',
  scim: 'sCIMSourceRequest',
};

/**
 * Request body property key for partial-update (PATCH) calls.
 */
const SOURCE_TYPE_PATCHED_KEY: Record<string, string> = {
  oauth: 'patchedOAuthSourceRequest',
  saml: 'patchedSAMLSourceRequest',
  ldap: 'patchedLDAPSourceRequest',
  plex: 'patchedPlexSourceRequest',
  kerberos: 'patchedKerberosSourceRequest',
  scim: 'patchedSCIMSourceRequest',
};

const VALID_SOURCE_TYPES = Object.keys(SOURCE_TYPE_SDK_PREFIX).join(', ');

export function registerSourceTools(
  server: McpServer,
  client: AuthentikClient,
  config: AppConfig,
): void {
  // ── Cross-type operations ──────────────────────────────────────────

  // 1. List all sources (cross-type)
  registerTool(server, config, {
    name: 'authentik_sources_list',
    description: 'List all sources across all types (OAuth, SAML, LDAP, Plex, Kerberos, SCIM).',
    accessTier: 'read-only',
    category: 'sources',
    inputSchema: {
      name: z.string().optional().describe('Filter by exact source name'),
      slug: z.string().optional().describe('Filter by exact source slug'),
      search: z.string().optional().describe('Search across source fields'),
      ordering: z.string().optional().describe('Field to order by (prefix with - for descending)'),
      page: z.number().optional().describe('Page number'),
      page_size: z.number().optional().describe('Number of results per page'),
    },
    handler: async (args) => {
      const result = await client.sourcesApi.sourcesAllList({
        name: args.name as string | undefined,
        slug: args.slug as string | undefined,
        search: args.search as string | undefined,
        ordering: args.ordering as string | undefined,
        page: args.page as number | undefined,
        pageSize: args.page_size as number | undefined,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 2. Get a single source (cross-type)
  registerTool(server, config, {
    name: 'authentik_sources_get',
    description: 'Get a single source by its slug (cross-type).',
    accessTier: 'read-only',
    category: 'sources',
    inputSchema: {
      slug: z.string().describe('Source slug'),
    },
    handler: async (args) => {
      const result = await client.sourcesApi.sourcesAllRetrieve({
        slug: args.slug as string,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 3. Delete a source (cross-type)
  registerTool(server, config, {
    name: 'authentik_sources_delete',
    description: 'Delete a source by its slug. This action is irreversible.',
    accessTier: 'full',
    category: 'sources',
    tags: ['destructive'],
    inputSchema: {
      slug: z.string().describe('Source slug to delete'),
    },
    handler: async (args) => {
      await client.sourcesApi.sourcesAllDestroy({
        slug: args.slug as string,
      });
      return `Source "${args.slug}" deleted successfully.`;
    },
  });

  // 4. List source types
  registerTool(server, config, {
    name: 'authentik_sources_types_list',
    description: 'List all available source types that can be created.',
    accessTier: 'read-only',
    category: 'sources',
    inputSchema: {},
    handler: async () => {
      const result = await client.sourcesApi.sourcesAllTypesList();
      return JSON.stringify(result, null, 2);
    },
  });

  // ── Per-type operations (dispatchers) ──────────────────────────────

  // 5. List sources by type
  registerTool(server, config, {
    name: 'authentik_sources_by_type_list',
    description: `List sources of a specific type. Valid types: ${VALID_SOURCE_TYPES}.`,
    accessTier: 'read-only',
    category: 'sources',
    inputSchema: {
      source_type: z.string().describe(`Source type: ${VALID_SOURCE_TYPES}`),
      name: z.string().optional().describe('Filter by name'),
      slug: z.string().optional().describe('Filter by slug'),
      search: z.string().optional().describe('Search across fields'),
      ordering: z.string().optional().describe('Field to order by'),
      page: z.number().optional().describe('Page number'),
      page_size: z.number().optional().describe('Number of results per page'),
    },
    handler: async (args) => {
      const sourceType = args.source_type as string;
      const prefix = SOURCE_TYPE_SDK_PREFIX[sourceType];
      if (!prefix) {
        throw new Error(`Invalid source_type "${sourceType}". Valid types: ${VALID_SOURCE_TYPES}`);
      }
      const methodName = `sources${prefix}List` as keyof typeof client.sourcesApi;
      const method = (client.sourcesApi[methodName] as Function).bind(client.sourcesApi);
      const result = await method({
        name: args.name as string | undefined,
        slug: args.slug as string | undefined,
        search: args.search as string | undefined,
        ordering: args.ordering as string | undefined,
        page: args.page as number | undefined,
        pageSize: args.page_size as number | undefined,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 6. Get a source by type and slug
  registerTool(server, config, {
    name: 'authentik_sources_by_type_get',
    description: `Get a single source by type and slug. Valid types: ${VALID_SOURCE_TYPES}.`,
    accessTier: 'read-only',
    category: 'sources',
    inputSchema: {
      source_type: z.string().describe(`Source type: ${VALID_SOURCE_TYPES}`),
      slug: z.string().describe('Source slug'),
    },
    handler: async (args) => {
      const sourceType = args.source_type as string;
      const prefix = SOURCE_TYPE_SDK_PREFIX[sourceType];
      if (!prefix) {
        throw new Error(`Invalid source_type "${sourceType}". Valid types: ${VALID_SOURCE_TYPES}`);
      }
      const methodName = `sources${prefix}Retrieve` as keyof typeof client.sourcesApi;
      const method = (client.sourcesApi[methodName] as Function).bind(client.sourcesApi);
      const result = await method({ slug: args.slug as string });
      return JSON.stringify(result, null, 2);
    },
  });

  // 7. Create a source by type
  registerTool(server, config, {
    name: 'authentik_sources_by_type_create',
    description: `Create a new source of a specific type. Valid types: ${VALID_SOURCE_TYPES}. Pass the source-specific configuration as a JSON object in the "config" parameter.`,
    accessTier: 'full',
    category: 'sources',
    inputSchema: {
      source_type: z.string().describe(`Source type: ${VALID_SOURCE_TYPES}`),
      config: z.record(z.unknown()).describe('Source configuration object (fields depend on source_type). Must include "name" and "slug".'),
    },
    handler: async (args) => {
      const sourceType = args.source_type as string;
      const prefix = SOURCE_TYPE_SDK_PREFIX[sourceType];
      const requestKey = SOURCE_TYPE_REQUEST_KEY[sourceType];
      if (!prefix || !requestKey) {
        throw new Error(`Invalid source_type "${sourceType}". Valid types: ${VALID_SOURCE_TYPES}`);
      }
      const methodName = `sources${prefix}Create` as keyof typeof client.sourcesApi;
      const method = (client.sourcesApi[methodName] as Function).bind(client.sourcesApi);
      const result = await method({ [requestKey]: args.config });
      return JSON.stringify(result, null, 2);
    },
  });

  // 8. Update a source by type (partial update)
  registerTool(server, config, {
    name: 'authentik_sources_by_type_update',
    description: `Update an existing source by type and slug. Only provided fields are modified (partial update). Valid types: ${VALID_SOURCE_TYPES}.`,
    accessTier: 'full',
    category: 'sources',
    inputSchema: {
      source_type: z.string().describe(`Source type: ${VALID_SOURCE_TYPES}`),
      slug: z.string().describe('Source slug (required, used as identifier)'),
      config: z.record(z.unknown()).describe('Fields to update (partial update).'),
    },
    handler: async (args) => {
      const sourceType = args.source_type as string;
      const prefix = SOURCE_TYPE_SDK_PREFIX[sourceType];
      const patchedKey = SOURCE_TYPE_PATCHED_KEY[sourceType];
      if (!prefix || !patchedKey) {
        throw new Error(`Invalid source_type "${sourceType}". Valid types: ${VALID_SOURCE_TYPES}`);
      }
      const methodName = `sources${prefix}PartialUpdate` as keyof typeof client.sourcesApi;
      const method = (client.sourcesApi[methodName] as Function).bind(client.sourcesApi);
      const result = await method({
        slug: args.slug as string,
        [patchedKey]: args.config,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 9. Delete a source by type
  registerTool(server, config, {
    name: 'authentik_sources_by_type_delete',
    description: `Delete a source by type and slug. This action is irreversible. Valid types: ${VALID_SOURCE_TYPES}.`,
    accessTier: 'full',
    category: 'sources',
    tags: ['destructive'],
    inputSchema: {
      source_type: z.string().describe(`Source type: ${VALID_SOURCE_TYPES}`),
      slug: z.string().describe('Source slug to delete'),
    },
    handler: async (args) => {
      const sourceType = args.source_type as string;
      const prefix = SOURCE_TYPE_SDK_PREFIX[sourceType];
      if (!prefix) {
        throw new Error(`Invalid source_type "${sourceType}". Valid types: ${VALID_SOURCE_TYPES}`);
      }
      const methodName = `sources${prefix}Destroy` as keyof typeof client.sourcesApi;
      const method = (client.sourcesApi[methodName] as Function).bind(client.sourcesApi);
      await method({ slug: args.slug as string });
      return `Source "${args.slug}" (type: ${sourceType}) deleted successfully.`;
    },
  });

  // 10. List user source connections (cross-type)
  registerTool(server, config, {
    name: 'authentik_sources_user_connections_list',
    description: 'List user-source connections across all source types.',
    accessTier: 'read-only',
    category: 'sources',
    inputSchema: {
      user: z.number().optional().describe('Filter by user ID'),
      source_slug: z.string().optional().describe('Filter by source slug'),
      search: z.string().optional().describe('Search across connection fields'),
      ordering: z.string().optional().describe('Field to order by'),
      page: z.number().optional().describe('Page number'),
      page_size: z.number().optional().describe('Number of results per page'),
    },
    handler: async (args) => {
      const result = await client.sourcesApi.sourcesUserConnectionsAllList({
        user: args.user as number | undefined,
        sourceSlug: args.source_slug as string | undefined,
        search: args.search as string | undefined,
        ordering: args.ordering as string | undefined,
        page: args.page as number | undefined,
        pageSize: args.page_size as number | undefined,
      });
      return JSON.stringify(result, null, 2);
    },
  });
}
