import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { AuthentikClient } from '../core/client.js';
import type { AppConfig } from '../types/index.js';
import { registerTool } from '../core/tools.js';
import type { EventsSystemTasksListStatusEnum } from '@goauthentik/api';

export function registerTaskTools(
  server: McpServer,
  client: AuthentikClient,
  config: AppConfig,
): void {
  // 1. List system tasks
  registerTool(server, config, {
    name: 'authentik_tasks_list',
    description:
      'List system tasks with optional filters by name, status, or UID.',
    accessTier: 'read-only',
    category: 'events',
    inputSchema: {
      name: z.string().optional().describe('Filter by task name'),
      status: z
        .enum(['unknown', 'successful', 'warning', 'error'])
        .optional()
        .describe('Filter by task status'),
      uid: z.string().optional().describe('Filter by task UID'),
      search: z.string().optional().describe('Search across task fields'),
      ordering: z.string().optional().describe('Field to order by (prefix with - for descending)'),
      page: z.number().optional().describe('Page number'),
      page_size: z.number().optional().describe('Number of results per page'),
    },
    handler: async (args) => {
      const result = await client.eventsApi.eventsSystemTasksList({
        name: args.name as string | undefined,
        status: args.status as EventsSystemTasksListStatusEnum | undefined,
        uid: args.uid as string | undefined,
        search: args.search as string | undefined,
        ordering: args.ordering as string | undefined,
        page: args.page as number | undefined,
        pageSize: args.page_size as number | undefined,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 2. Get system task
  registerTool(server, config, {
    name: 'authentik_tasks_get',
    description: 'Get details of a specific system task by UUID.',
    accessTier: 'read-only',
    category: 'events',
    inputSchema: {
      uuid: z.string().describe('System task UUID'),
    },
    handler: async (args) => {
      const result = await client.eventsApi.eventsSystemTasksRetrieve({
        uuid: args.uuid as string,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 3. Retry system task
  registerTool(server, config, {
    name: 'authentik_tasks_retry',
    description: 'Retry a failed system task by UUID.',
    accessTier: 'full',
    category: 'events',
    inputSchema: {
      uuid: z.string().describe('System task UUID to retry'),
    },
    handler: async (args) => {
      await client.eventsApi.eventsSystemTasksRunCreate({
        uuid: args.uuid as string,
      });
      return `Task ${args.uuid} retry triggered successfully.`;
    },
  });
}
