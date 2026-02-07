import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { AuthentikClient } from '../core/client.js';
import type { AppConfig } from '../types/index.js';
import { registerTool } from '../core/tools.js';

export function registerTenantTools(
  server: McpServer,
  client: AuthentikClient,
  config: AppConfig,
): void {
  // ── Tenants ──

  // 1. List tenants
  registerTool(server, config, {
    name: 'authentik_tenants_list',
    description: 'List tenants with optional filters.',
    accessTier: 'read-only',
    category: 'tenants',
    inputSchema: {
      search: z.string().optional().describe('Search across fields'),
      ordering: z.string().optional().describe('Field to order by'),
      page: z.number().optional().describe('Page number'),
      page_size: z.number().optional().describe('Number of results per page'),
    },
    handler: async (args) => {
      const result = await client.tenantsApi.tenantsTenantsList({
        search: args.search as string | undefined,
        ordering: args.ordering as string | undefined,
        page: args.page as number | undefined,
        pageSize: args.page_size as number | undefined,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 2. Get tenant
  registerTool(server, config, {
    name: 'authentik_tenants_get',
    description: 'Get a single tenant by its UUID.',
    accessTier: 'read-only',
    category: 'tenants',
    inputSchema: {
      tenant_uuid: z.string().describe('Tenant UUID'),
    },
    handler: async (args) => {
      const result = await client.tenantsApi.tenantsTenantsRetrieve({
        tenantUuid: args.tenant_uuid as string,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 3. Create tenant
  registerTool(server, config, {
    name: 'authentik_tenants_create',
    description: 'Create a new tenant.',
    accessTier: 'full',
    category: 'tenants',
    inputSchema: {
      schema_name: z.string().describe('Database schema name (required, immutable after creation)'),
      name: z.string().describe('Tenant display name (required)'),
      ready: z.boolean().optional().describe('Whether the tenant is ready for use'),
    },
    handler: async (args) => {
      const result = await client.tenantsApi.tenantsTenantsCreate({
        tenantRequest: {
          schemaName: args.schema_name as string,
          name: args.name as string,
          ready: args.ready as boolean | undefined,
        },
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 4. Update tenant
  registerTool(server, config, {
    name: 'authentik_tenants_update',
    description: 'Update an existing tenant. Only provided fields are modified (partial update).',
    accessTier: 'full',
    category: 'tenants',
    inputSchema: {
      tenant_uuid: z.string().describe('Tenant UUID (required)'),
      name: z.string().optional().describe('New tenant name'),
      ready: z.boolean().optional().describe('Whether the tenant is ready'),
    },
    handler: async (args) => {
      const result = await client.tenantsApi.tenantsTenantsPartialUpdate({
        tenantUuid: args.tenant_uuid as string,
        patchedTenantRequest: {
          name: args.name as string | undefined,
          ready: args.ready as boolean | undefined,
        },
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 5. Delete tenant
  registerTool(server, config, {
    name: 'authentik_tenants_delete',
    description: 'Delete a tenant by its UUID. This action is irreversible and removes all tenant data.',
    accessTier: 'full',
    category: 'tenants',
    tags: ['destructive'],
    inputSchema: {
      tenant_uuid: z.string().describe('Tenant UUID to delete'),
    },
    handler: async (args) => {
      await client.tenantsApi.tenantsTenantsDestroy({
        tenantUuid: args.tenant_uuid as string,
      });
      return `Tenant "${args.tenant_uuid}" deleted successfully.`;
    },
  });

  // 6. Create admin group for tenant
  registerTool(server, config, {
    name: 'authentik_tenants_create_admin_group',
    description: 'Create an admin group for a tenant and add a user to it.',
    accessTier: 'full',
    category: 'tenants',
    inputSchema: {
      tenant_uuid: z.string().describe('Tenant UUID (required)'),
      user: z.string().describe('User ID to add to the admin group (required)'),
    },
    handler: async (args) => {
      await client.tenantsApi.tenantsTenantsCreateAdminGroupCreate({
        tenantUuid: args.tenant_uuid as string,
        tenantAdminGroupRequestRequest: {
          user: args.user as string,
        },
      });
      return `Admin group created for tenant "${args.tenant_uuid}" with user "${args.user}".`;
    },
  });

  // 7. Create recovery key for tenant
  registerTool(server, config, {
    name: 'authentik_tenants_create_recovery_key',
    description: 'Create a recovery key for a user in a tenant.',
    accessTier: 'full',
    category: 'tenants',
    inputSchema: {
      tenant_uuid: z.string().describe('Tenant UUID (required)'),
      user: z.string().describe('User ID to create recovery key for (required)'),
      duration_days: z.number().describe('Number of days the recovery key is valid (required)'),
    },
    handler: async (args) => {
      const result = await client.tenantsApi.tenantsTenantsCreateRecoveryKeyCreate({
        tenantUuid: args.tenant_uuid as string,
        tenantRecoveryKeyRequestRequest: {
          user: args.user as string,
          durationDays: args.duration_days as number,
        },
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // ── Tenant Domains ──

  // 8. List tenant domains
  registerTool(server, config, {
    name: 'authentik_tenants_domains_list',
    description: 'List tenant domains with optional filters.',
    accessTier: 'read-only',
    category: 'tenants',
    inputSchema: {
      search: z.string().optional().describe('Search across fields'),
      ordering: z.string().optional().describe('Field to order by'),
      page: z.number().optional().describe('Page number'),
      page_size: z.number().optional().describe('Number of results per page'),
    },
    handler: async (args) => {
      const result = await client.tenantsApi.tenantsDomainsList({
        search: args.search as string | undefined,
        ordering: args.ordering as string | undefined,
        page: args.page as number | undefined,
        pageSize: args.page_size as number | undefined,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 9. Create tenant domain
  registerTool(server, config, {
    name: 'authentik_tenants_domains_create',
    description: 'Create a new domain for a tenant.',
    accessTier: 'full',
    category: 'tenants',
    inputSchema: {
      domain: z.string().describe('Domain name (required)'),
      tenant: z.string().describe('Tenant UUID to associate the domain with (required)'),
      is_primary: z.boolean().optional().describe('Whether this is the primary domain'),
    },
    handler: async (args) => {
      const result = await client.tenantsApi.tenantsDomainsCreate({
        domainRequest: {
          domain: args.domain as string,
          tenant: args.tenant as string,
          isPrimary: args.is_primary as boolean | undefined,
        },
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 10. Delete tenant domain
  registerTool(server, config, {
    name: 'authentik_tenants_domains_delete',
    description: 'Delete a tenant domain by its numeric ID. This action is irreversible.',
    accessTier: 'full',
    category: 'tenants',
    tags: ['destructive'],
    inputSchema: {
      id: z.number().describe('Domain ID to delete'),
    },
    handler: async (args) => {
      await client.tenantsApi.tenantsDomainsDestroy({
        id: args.id as number,
      });
      return `Tenant domain ${args.id} deleted successfully.`;
    },
  });
}
