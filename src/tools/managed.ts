import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { AuthentikClient } from '../core/client.js';
import type { AppConfig } from '../types/index.js';
import { registerTool } from '../core/tools.js';

export function registerManagedTools(
  server: McpServer,
  client: AuthentikClient,
  config: AppConfig,
): void {
  // 1. List blueprint instances
  registerTool(server, config, {
    name: 'authentik_blueprints_list',
    description: 'List managed blueprint instances with optional filters.',
    accessTier: 'read-only',
    category: 'managed',
    inputSchema: {
      name: z.string().optional().describe('Filter by exact name'),
      path: z.string().optional().describe('Filter by blueprint path'),
      search: z.string().optional().describe('Search across fields'),
      ordering: z.string().optional().describe('Field to order by (prefix with - for descending)'),
      page: z.number().optional().describe('Page number'),
      page_size: z.number().optional().describe('Number of results per page'),
    },
    handler: async (args) => {
      const result = await client.managedApi.managedBlueprintsList({
        name: args.name as string | undefined,
        path: args.path as string | undefined,
        search: args.search as string | undefined,
        ordering: args.ordering as string | undefined,
        page: args.page as number | undefined,
        pageSize: args.page_size as number | undefined,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 2. Get blueprint instance
  registerTool(server, config, {
    name: 'authentik_blueprints_get',
    description: 'Get a single blueprint instance by its UUID.',
    accessTier: 'read-only',
    category: 'managed',
    inputSchema: {
      instance_uuid: z.string().describe('Blueprint instance UUID'),
    },
    handler: async (args) => {
      const result = await client.managedApi.managedBlueprintsRetrieve({
        instanceUuid: args.instance_uuid as string,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 3. Create blueprint instance
  registerTool(server, config, {
    name: 'authentik_blueprints_create',
    description: 'Create a new managed blueprint instance.',
    accessTier: 'full',
    category: 'managed',
    inputSchema: {
      name: z.string().describe('Blueprint name (required)'),
      path: z.string().optional().describe('Path to the blueprint file'),
      context: z.record(z.unknown()).optional().describe('Context variables for the blueprint'),
      enabled: z.boolean().optional().describe('Whether the blueprint is enabled'),
      content: z.string().optional().describe('Inline blueprint content (YAML)'),
    },
    handler: async (args) => {
      const result = await client.managedApi.managedBlueprintsCreate({
        blueprintInstanceRequest: {
          name: args.name as string,
          path: args.path as string | undefined,
          context: args.context as Record<string, any> | undefined,
          enabled: args.enabled as boolean | undefined,
          content: args.content as string | undefined,
        },
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 4. Update blueprint instance
  registerTool(server, config, {
    name: 'authentik_blueprints_update',
    description: 'Update an existing blueprint instance. Only provided fields are modified (partial update).',
    accessTier: 'full',
    category: 'managed',
    inputSchema: {
      instance_uuid: z.string().describe('Blueprint instance UUID (required)'),
      name: z.string().optional().describe('New blueprint name'),
      path: z.string().optional().describe('New blueprint file path'),
      context: z.record(z.unknown()).optional().describe('New context variables'),
      enabled: z.boolean().optional().describe('Whether the blueprint is enabled'),
      content: z.string().optional().describe('New inline blueprint content'),
    },
    handler: async (args) => {
      const result = await client.managedApi.managedBlueprintsPartialUpdate({
        instanceUuid: args.instance_uuid as string,
        patchedBlueprintInstanceRequest: {
          name: args.name as string | undefined,
          path: args.path as string | undefined,
          context: args.context as Record<string, any> | undefined,
          enabled: args.enabled as boolean | undefined,
          content: args.content as string | undefined,
        },
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 5. Delete blueprint instance
  registerTool(server, config, {
    name: 'authentik_blueprints_delete',
    description: 'Delete a blueprint instance by its UUID. This action is irreversible.',
    accessTier: 'full',
    category: 'managed',
    tags: ['destructive'],
    inputSchema: {
      instance_uuid: z.string().describe('Blueprint instance UUID to delete'),
    },
    handler: async (args) => {
      await client.managedApi.managedBlueprintsDestroy({
        instanceUuid: args.instance_uuid as string,
      });
      return `Blueprint instance "${args.instance_uuid}" deleted successfully.`;
    },
  });

  // 6. List available blueprints
  registerTool(server, config, {
    name: 'authentik_blueprints_available',
    description: 'List all available blueprint files that can be used to create blueprint instances.',
    accessTier: 'read-only',
    category: 'managed',
    handler: async () => {
      const result = await client.managedApi.managedBlueprintsAvailableList();
      return JSON.stringify(result, null, 2);
    },
  });

  // 7. Apply blueprint
  registerTool(server, config, {
    name: 'authentik_blueprints_apply',
    description: 'Apply a blueprint instance, executing its configuration. This may create, update, or delete objects.',
    accessTier: 'full',
    category: 'managed',
    tags: ['destructive'],
    inputSchema: {
      instance_uuid: z.string().describe('Blueprint instance UUID to apply'),
    },
    handler: async (args) => {
      const result = await client.managedApi.managedBlueprintsApplyCreate({
        instanceUuid: args.instance_uuid as string,
      });
      return JSON.stringify(result, null, 2);
    },
  });
}
