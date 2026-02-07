import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { AuthentikClient } from '../core/client.js';
import type { AppConfig } from '../types/index.js';
import { registerTool } from '../core/tools.js';

export function registerGroupTools(
  server: McpServer,
  client: AuthentikClient,
  config: AppConfig,
): void {
  // 1. List groups
  registerTool(server, config, {
    name: 'authentik_groups_list',
    description: 'List groups with optional filters for name, superuser status, members, and search.',
    accessTier: 'read-only',
    category: 'core',
    inputSchema: {
      name: z.string().optional().describe('Filter by exact group name'),
      search: z.string().optional().describe('Search across group fields'),
      members_by_pk: z.array(z.number()).optional().describe('Filter by member user IDs'),
      members_by_username: z.array(z.string()).optional().describe('Filter by member usernames'),
      is_superuser: z.boolean().optional().describe('Filter by superuser group status'),
      ordering: z.string().optional().describe('Field to order by (prefix with - for descending)'),
      page: z.number().optional().describe('Page number'),
      page_size: z.number().optional().describe('Number of results per page'),
    },
    handler: async (args) => {
      const result = await client.coreApi.coreGroupsList({
        name: args.name as string | undefined,
        search: args.search as string | undefined,
        membersByPk: args.members_by_pk as number[] | undefined,
        membersByUsername: args.members_by_username as string[] | undefined,
        isSuperuser: args.is_superuser as boolean | undefined,
        ordering: args.ordering as string | undefined,
        page: args.page as number | undefined,
        pageSize: args.page_size as number | undefined,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 2. Get group
  registerTool(server, config, {
    name: 'authentik_groups_get',
    description: 'Get a single group by its UUID.',
    accessTier: 'read-only',
    category: 'core',
    inputSchema: {
      group_uuid: z.string().describe('Group UUID'),
    },
    handler: async (args) => {
      const result = await client.coreApi.coreGroupsRetrieve({
        groupUuid: args.group_uuid as string,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 3. Create group
  registerTool(server, config, {
    name: 'authentik_groups_create',
    description: 'Create a new group with optional parent, superuser status, users, and custom attributes.',
    accessTier: 'full',
    category: 'core',
    inputSchema: {
      name: z.string().describe('Group name (required)'),
      parent: z.string().optional().describe('Parent group UUID'),
      is_superuser: z.boolean().optional().describe('Whether members of this group are superusers'),
      users: z.array(z.number()).optional().describe('Array of user IDs to add as members'),
      attributes: z.record(z.unknown()).optional().describe('Custom attributes key-value pairs'),
    },
    handler: async (args) => {
      const result = await client.coreApi.coreGroupsCreate({
        groupRequest: {
          name: args.name as string,
          parent: args.parent as string | undefined,
          isSuperuser: args.is_superuser as boolean | undefined,
          users: args.users as number[] | undefined,
          attributes: args.attributes as Record<string, unknown> | undefined,
        },
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 4. Update group
  registerTool(server, config, {
    name: 'authentik_groups_update',
    description: 'Update an existing group. Only provided fields are modified (partial update).',
    accessTier: 'full',
    category: 'core',
    inputSchema: {
      group_uuid: z.string().describe('Group UUID (required)'),
      name: z.string().optional().describe('New group name'),
      parent: z.string().optional().describe('New parent group UUID'),
      is_superuser: z.boolean().optional().describe('Whether members are superusers'),
      users: z.array(z.number()).optional().describe('Array of user IDs'),
      attributes: z.record(z.unknown()).optional().describe('Custom attributes key-value pairs'),
    },
    handler: async (args) => {
      const result = await client.coreApi.coreGroupsPartialUpdate({
        groupUuid: args.group_uuid as string,
        patchedGroupRequest: {
          name: args.name as string | undefined,
          parent: args.parent as string | undefined,
          isSuperuser: args.is_superuser as boolean | undefined,
          users: args.users as number[] | undefined,
          attributes: args.attributes as Record<string, unknown> | undefined,
        },
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 5. Delete group
  registerTool(server, config, {
    name: 'authentik_groups_delete',
    description: 'Delete a group by its UUID. This action is irreversible.',
    accessTier: 'full',
    category: 'core',
    tags: ['destructive'],
    inputSchema: {
      group_uuid: z.string().describe('Group UUID to delete'),
    },
    handler: async (args) => {
      await client.coreApi.coreGroupsDestroy({
        groupUuid: args.group_uuid as string,
      });
      return `Group ${args.group_uuid} deleted successfully.`;
    },
  });

  // 6. Add user to group
  registerTool(server, config, {
    name: 'authentik_groups_add_user',
    description: 'Add a user to a group by group UUID and user ID.',
    accessTier: 'full',
    category: 'core',
    inputSchema: {
      group_uuid: z.string().describe('Group UUID'),
      user_id: z.number().describe('User ID to add to the group'),
    },
    handler: async (args) => {
      await client.coreApi.coreGroupsAddUserCreate({
        groupUuid: args.group_uuid as string,
        userAccountRequest: {
          pk: args.user_id as number,
        },
      });
      return `User ${args.user_id} added to group ${args.group_uuid} successfully.`;
    },
  });

  // 7. Remove user from group
  registerTool(server, config, {
    name: 'authentik_groups_remove_user',
    description: 'Remove a user from a group by group UUID and user ID.',
    accessTier: 'full',
    category: 'core',
    inputSchema: {
      group_uuid: z.string().describe('Group UUID'),
      user_id: z.number().describe('User ID to remove from the group'),
    },
    handler: async (args) => {
      await client.coreApi.coreGroupsRemoveUserCreate({
        groupUuid: args.group_uuid as string,
        userAccountRequest: {
          pk: args.user_id as number,
        },
      });
      return `User ${args.user_id} removed from group ${args.group_uuid} successfully.`;
    },
  });
}
