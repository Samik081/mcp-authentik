import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { AuthentikClient } from '../core/client.js';
import type { AppConfig } from '../types/index.js';
import { registerTool } from '../core/tools.js';

export function registerOutpostTools(
  server: McpServer,
  client: AuthentikClient,
  config: AppConfig,
): void {
  // ── Outpost Instances ──

  // 1. List outpost instances
  registerTool(server, config, {
    name: 'authentik_outposts_list',
    description: 'List outpost instances with optional filters.',
    accessTier: 'read-only',
    category: 'outposts',
    inputSchema: {
      name: z.string().optional().describe('Filter by name (case-insensitive contains)'),
      search: z.string().optional().describe('Search across fields'),
      ordering: z.string().optional().describe('Field to order by (prefix with - for descending)'),
      page: z.number().optional().describe('Page number'),
      page_size: z.number().optional().describe('Number of results per page'),
    },
    handler: async (args) => {
      const result = await client.outpostsApi.outpostsInstancesList({
        nameIcontains: args.name as string | undefined,
        search: args.search as string | undefined,
        ordering: args.ordering as string | undefined,
        page: args.page as number | undefined,
        pageSize: args.page_size as number | undefined,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 2. Get outpost instance
  registerTool(server, config, {
    name: 'authentik_outposts_get',
    description: 'Get a single outpost instance by its UUID.',
    accessTier: 'read-only',
    category: 'outposts',
    inputSchema: {
      uuid: z.string().describe('Outpost UUID'),
    },
    handler: async (args) => {
      const result = await client.outpostsApi.outpostsInstancesRetrieve({
        uuid: args.uuid as string,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 3. Create outpost instance
  registerTool(server, config, {
    name: 'authentik_outposts_create',
    description: 'Create a new outpost instance.',
    accessTier: 'full',
    category: 'outposts',
    inputSchema: {
      name: z.string().describe('Outpost name (required)'),
      type: z.enum(['proxy', 'ldap', 'radius', 'rac']).describe('Outpost type (required)'),
      providers: z.array(z.number()).describe('List of provider IDs to associate (required)'),
      service_connection: z.string().optional().describe('Service connection UUID (leave empty for unmanaged)'),
      config: z.record(z.unknown()).optional().describe('Outpost configuration object'),
      managed: z.string().optional().describe('Managed identifier string'),
    },
    handler: async (args) => {
      const result = await client.outpostsApi.outpostsInstancesCreate({
        outpostRequest: {
          name: args.name as string,
          type: args.type as any,
          providers: args.providers as number[],
          serviceConnection: args.service_connection as string | undefined,
          config: (args.config as Record<string, any>) ?? {},
          managed: args.managed as string | undefined,
        },
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 4. Update outpost instance
  registerTool(server, config, {
    name: 'authentik_outposts_update',
    description: 'Update an existing outpost instance. Only provided fields are modified (partial update).',
    accessTier: 'full',
    category: 'outposts',
    inputSchema: {
      uuid: z.string().describe('Outpost UUID (required)'),
      name: z.string().optional().describe('New outpost name'),
      type: z.enum(['proxy', 'ldap', 'radius', 'rac']).optional().describe('New outpost type'),
      providers: z.array(z.number()).optional().describe('New list of provider IDs'),
      service_connection: z.string().optional().describe('New service connection UUID'),
      config: z.record(z.unknown()).optional().describe('New outpost configuration object'),
      managed: z.string().optional().describe('New managed identifier string'),
    },
    handler: async (args) => {
      const result = await client.outpostsApi.outpostsInstancesPartialUpdate({
        uuid: args.uuid as string,
        patchedOutpostRequest: {
          name: args.name as string | undefined,
          type: args.type as any,
          providers: args.providers as number[] | undefined,
          serviceConnection: args.service_connection as string | undefined,
          config: args.config as Record<string, any> | undefined,
          managed: args.managed as string | undefined,
        },
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 5. Delete outpost instance
  registerTool(server, config, {
    name: 'authentik_outposts_delete',
    description: 'Delete an outpost instance by its UUID. This action is irreversible.',
    accessTier: 'full',
    category: 'outposts',
    tags: ['destructive'],
    inputSchema: {
      uuid: z.string().describe('Outpost UUID to delete'),
    },
    handler: async (args) => {
      await client.outpostsApi.outpostsInstancesDestroy({
        uuid: args.uuid as string,
      });
      return `Outpost "${args.uuid}" deleted successfully.`;
    },
  });

  // 6. Get outpost health
  registerTool(server, config, {
    name: 'authentik_outposts_health',
    description: 'Get the current health status of an outpost.',
    accessTier: 'read-only',
    category: 'outposts',
    inputSchema: {
      uuid: z.string().describe('Outpost UUID'),
    },
    handler: async (args) => {
      const result = await client.outpostsApi.outpostsInstancesHealthList({
        uuid: args.uuid as string,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 7. Get outpost default settings
  registerTool(server, config, {
    name: 'authentik_outposts_default_settings',
    description: 'Get the global default outpost configuration.',
    accessTier: 'read-only',
    category: 'outposts',
    handler: async () => {
      const result = await client.outpostsApi.outpostsInstancesDefaultSettingsRetrieve();
      return JSON.stringify(result, null, 2);
    },
  });

  // ── Service Connections ──

  // 8. List all service connections
  registerTool(server, config, {
    name: 'authentik_outposts_service_connections_list',
    description: 'List all service connections (Docker and Kubernetes) with optional filters.',
    accessTier: 'read-only',
    category: 'outposts',
    inputSchema: {
      name: z.string().optional().describe('Filter by name'),
      search: z.string().optional().describe('Search across fields'),
      ordering: z.string().optional().describe('Field to order by'),
      page: z.number().optional().describe('Page number'),
      page_size: z.number().optional().describe('Number of results per page'),
    },
    handler: async (args) => {
      const result = await client.outpostsApi.outpostsServiceConnectionsAllList({
        name: args.name as string | undefined,
        search: args.search as string | undefined,
        ordering: args.ordering as string | undefined,
        page: args.page as number | undefined,
        pageSize: args.page_size as number | undefined,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 9. Get service connection state
  registerTool(server, config, {
    name: 'authentik_outposts_service_connections_state',
    description: 'Get the current state of a service connection.',
    accessTier: 'read-only',
    category: 'outposts',
    inputSchema: {
      uuid: z.string().describe('Service connection UUID'),
    },
    handler: async (args) => {
      const result = await client.outpostsApi.outpostsServiceConnectionsAllStateRetrieve({
        uuid: args.uuid as string,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 10. List service connection types
  registerTool(server, config, {
    name: 'authentik_outposts_service_connections_types',
    description: 'List all available service connection types that can be created.',
    accessTier: 'read-only',
    category: 'outposts',
    handler: async () => {
      const result = await client.outpostsApi.outpostsServiceConnectionsAllTypesList();
      return JSON.stringify(result, null, 2);
    },
  });

  // 11. Create Docker service connection
  registerTool(server, config, {
    name: 'authentik_outposts_docker_create',
    description: 'Create a new Docker service connection.',
    accessTier: 'full',
    category: 'outposts',
    inputSchema: {
      name: z.string().describe('Connection name (required)'),
      url: z.string().describe('Docker URL, e.g. unix:///var/run/docker.sock or https://host:2376 (required)'),
      local: z.boolean().optional().describe('Use local Docker socket'),
      tls_verification: z.string().optional().describe('CA certificate keypair UUID for TLS verification'),
      tls_authentication: z.string().optional().describe('Client certificate keypair UUID for TLS authentication'),
    },
    handler: async (args) => {
      const result = await client.outpostsApi.outpostsServiceConnectionsDockerCreate({
        dockerServiceConnectionRequest: {
          name: args.name as string,
          url: args.url as string,
          local: args.local as boolean | undefined,
          tlsVerification: args.tls_verification as string | undefined,
          tlsAuthentication: args.tls_authentication as string | undefined,
        },
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 12. Update Docker service connection
  registerTool(server, config, {
    name: 'authentik_outposts_docker_update',
    description: 'Update an existing Docker service connection. Only provided fields are modified (partial update).',
    accessTier: 'full',
    category: 'outposts',
    inputSchema: {
      uuid: z.string().describe('Docker service connection UUID (required)'),
      name: z.string().optional().describe('New connection name'),
      url: z.string().optional().describe('New Docker URL'),
      local: z.boolean().optional().describe('Use local Docker socket'),
      tls_verification: z.string().optional().describe('New CA certificate keypair UUID'),
      tls_authentication: z.string().optional().describe('New client certificate keypair UUID'),
    },
    handler: async (args) => {
      const result = await client.outpostsApi.outpostsServiceConnectionsDockerPartialUpdate({
        uuid: args.uuid as string,
        patchedDockerServiceConnectionRequest: {
          name: args.name as string | undefined,
          url: args.url as string | undefined,
          local: args.local as boolean | undefined,
          tlsVerification: args.tls_verification as string | undefined,
          tlsAuthentication: args.tls_authentication as string | undefined,
        },
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 13. Create Kubernetes service connection
  registerTool(server, config, {
    name: 'authentik_outposts_kubernetes_create',
    description: 'Create a new Kubernetes service connection.',
    accessTier: 'full',
    category: 'outposts',
    inputSchema: {
      name: z.string().describe('Connection name (required)'),
      local: z.boolean().optional().describe('Use local Kubernetes integration'),
      kubeconfig: z.record(z.unknown()).optional().describe('Kubeconfig object (uses currently selected context)'),
      verify_ssl: z.boolean().optional().describe('Verify SSL certificates of the Kubernetes API endpoint'),
    },
    handler: async (args) => {
      const result = await client.outpostsApi.outpostsServiceConnectionsKubernetesCreate({
        kubernetesServiceConnectionRequest: {
          name: args.name as string,
          local: args.local as boolean | undefined,
          kubeconfig: args.kubeconfig as Record<string, any> | undefined,
          verifySsl: args.verify_ssl as boolean | undefined,
        },
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 14. Update Kubernetes service connection
  registerTool(server, config, {
    name: 'authentik_outposts_kubernetes_update',
    description: 'Update an existing Kubernetes service connection. Only provided fields are modified (partial update).',
    accessTier: 'full',
    category: 'outposts',
    inputSchema: {
      uuid: z.string().describe('Kubernetes service connection UUID (required)'),
      name: z.string().optional().describe('New connection name'),
      local: z.boolean().optional().describe('Use local Kubernetes integration'),
      kubeconfig: z.record(z.unknown()).optional().describe('New kubeconfig object'),
      verify_ssl: z.boolean().optional().describe('Verify SSL certificates'),
    },
    handler: async (args) => {
      const result = await client.outpostsApi.outpostsServiceConnectionsKubernetesPartialUpdate({
        uuid: args.uuid as string,
        patchedKubernetesServiceConnectionRequest: {
          name: args.name as string | undefined,
          local: args.local as boolean | undefined,
          kubeconfig: args.kubeconfig as Record<string, any> | undefined,
          verifySsl: args.verify_ssl as boolean | undefined,
        },
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 15. Delete service connection
  registerTool(server, config, {
    name: 'authentik_outposts_service_connections_delete',
    description: 'Delete a service connection by its UUID. This action is irreversible.',
    accessTier: 'full',
    category: 'outposts',
    tags: ['destructive'],
    inputSchema: {
      uuid: z.string().describe('Service connection UUID to delete'),
    },
    handler: async (args) => {
      await client.outpostsApi.outpostsServiceConnectionsAllDestroy({
        uuid: args.uuid as string,
      });
      return `Service connection "${args.uuid}" deleted successfully.`;
    },
  });
}
