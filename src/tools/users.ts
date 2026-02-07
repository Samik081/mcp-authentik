import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { AuthentikClient } from '../core/client.js';
import type { AppConfig } from '../types/index.js';
import { registerTool } from '../core/tools.js';

export function registerUserTools(
  server: McpServer,
  client: AuthentikClient,
  config: AppConfig,
): void {
  // 1. List users
  registerTool(server, config, {
    name: 'authentik_users_list',
    description: 'List users with optional filters for username, email, name, active status, superuser status, path, groups, and search.',
    accessTier: 'read-only',
    category: 'core',
    inputSchema: {
      username: z.string().optional().describe('Filter by exact username'),
      email: z.string().optional().describe('Filter by exact email'),
      name: z.string().optional().describe('Filter by exact display name'),
      is_active: z.boolean().optional().describe('Filter by active status'),
      is_superuser: z.boolean().optional().describe('Filter by superuser status'),
      path: z.string().optional().describe('Filter by exact user path'),
      path_startswith: z.string().optional().describe('Filter by path prefix'),
      search: z.string().optional().describe('Search across user fields'),
      groups_by_name: z.array(z.string()).optional().describe('Filter by group names'),
      page: z.number().optional().describe('Page number'),
      page_size: z.number().optional().describe('Number of results per page'),
      ordering: z.string().optional().describe('Field to order by (prefix with - for descending)'),
    },
    handler: async (args) => {
      const result = await client.coreApi.coreUsersList({
        username: args.username as string | undefined,
        email: args.email as string | undefined,
        name: args.name as string | undefined,
        isActive: args.is_active as boolean | undefined,
        isSuperuser: args.is_superuser as boolean | undefined,
        path: args.path as string | undefined,
        pathStartswith: args.path_startswith as string | undefined,
        search: args.search as string | undefined,
        groupsByName: args.groups_by_name as string[] | undefined,
        page: args.page as number | undefined,
        pageSize: args.page_size as number | undefined,
        ordering: args.ordering as string | undefined,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 2. Get user
  registerTool(server, config, {
    name: 'authentik_users_get',
    description: 'Get a single user by their numeric ID.',
    accessTier: 'read-only',
    category: 'core',
    inputSchema: {
      id: z.number().describe('User ID'),
    },
    handler: async (args) => {
      const result = await client.coreApi.coreUsersRetrieve({
        id: args.id as number,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 3. Create user
  registerTool(server, config, {
    name: 'authentik_users_create',
    description: 'Create a new user. Use authentik_users_set_password to set the password after creation.',
    accessTier: 'full',
    category: 'core',
    inputSchema: {
      username: z.string().describe('Username (required, must be unique)'),
      name: z.string().describe('Display name (required)'),
      email: z.string().optional().describe('Email address'),
      path: z.string().optional().describe('User path (e.g. "users" or "admins")'),
      is_active: z.boolean().optional().describe('Whether the user account is active'),
      groups: z.array(z.string()).optional().describe('Array of group UUIDs to assign'),
    },
    handler: async (args) => {
      const result = await client.coreApi.coreUsersCreate({
        userRequest: {
          username: args.username as string,
          name: args.name as string,
          email: args.email as string | undefined,
          path: args.path as string | undefined,
          isActive: args.is_active as boolean | undefined,
          groups: args.groups as string[] | undefined,
        },
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 4. Update user
  registerTool(server, config, {
    name: 'authentik_users_update',
    description: 'Update an existing user. Only provided fields are modified (partial update).',
    accessTier: 'full',
    category: 'core',
    inputSchema: {
      id: z.number().describe('User ID (required)'),
      username: z.string().optional().describe('New username'),
      name: z.string().optional().describe('New display name'),
      email: z.string().optional().describe('New email address'),
      path: z.string().optional().describe('New user path'),
      is_active: z.boolean().optional().describe('Whether the user account is active'),
      groups: z.array(z.string()).optional().describe('Array of group UUIDs'),
    },
    handler: async (args) => {
      const result = await client.coreApi.coreUsersPartialUpdate({
        id: args.id as number,
        patchedUserRequest: {
          username: args.username as string | undefined,
          name: args.name as string | undefined,
          email: args.email as string | undefined,
          path: args.path as string | undefined,
          isActive: args.is_active as boolean | undefined,
          groups: args.groups as string[] | undefined,
        },
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 5. Delete user
  registerTool(server, config, {
    name: 'authentik_users_delete',
    description: 'Delete a user by their numeric ID. This action is irreversible.',
    accessTier: 'full',
    category: 'core',
    tags: ['destructive'],
    inputSchema: {
      id: z.number().describe('User ID to delete'),
    },
    handler: async (args) => {
      await client.coreApi.coreUsersDestroy({ id: args.id as number });
      return `User ${args.id} deleted successfully.`;
    },
  });

  // 6. Get current user (me)
  registerTool(server, config, {
    name: 'authentik_users_me',
    description: 'Get information about the currently authenticated user.',
    accessTier: 'read-only',
    category: 'core',
    handler: async () => {
      const result = await client.coreApi.coreUsersMeRetrieve();
      return JSON.stringify(result, null, 2);
    },
  });

  // 7. Set password
  registerTool(server, config, {
    name: 'authentik_users_set_password',
    description: 'Set a new password for a user.',
    accessTier: 'full',
    category: 'core',
    inputSchema: {
      id: z.number().describe('User ID'),
      password: z.string().describe('New password to set'),
    },
    handler: async (args) => {
      await client.coreApi.coreUsersSetPasswordCreate({
        id: args.id as number,
        userPasswordSetRequest: {
          password: args.password as string,
        },
      });
      return `Password set successfully for user ${args.id}.`;
    },
  });

  // 8. Create service account
  registerTool(server, config, {
    name: 'authentik_users_create_service_account',
    description: 'Create a new service account user with an optional associated group and token.',
    accessTier: 'full',
    category: 'core',
    inputSchema: {
      name: z.string().describe('Service account name (required)'),
      create_group: z.boolean().optional().describe('Whether to create an associated group'),
      expiring: z.boolean().optional().describe('Whether the token should expire'),
      expires: z.string().optional().describe('Token expiration date (ISO 8601). If not provided, valid for 360 days.'),
    },
    handler: async (args) => {
      const result = await client.coreApi.coreUsersServiceAccountCreate({
        userServiceAccountRequest: {
          name: args.name as string,
          createGroup: args.create_group as boolean | undefined,
          expiring: args.expiring as boolean | undefined,
          expires: args.expires ? new Date(args.expires as string) : undefined,
        },
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 9. Generate recovery link
  registerTool(server, config, {
    name: 'authentik_users_generate_recovery_link',
    description: 'Generate a temporary recovery link for a user to regain account access.',
    accessTier: 'full',
    category: 'core',
    inputSchema: {
      id: z.number().describe('User ID'),
    },
    handler: async (args) => {
      const result = await client.coreApi.coreUsersRecoveryCreate({
        id: args.id as number,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 10. Send recovery email
  registerTool(server, config, {
    name: 'authentik_users_send_recovery_email',
    description: 'Send a recovery email to a user using a specified email stage.',
    accessTier: 'full',
    category: 'core',
    inputSchema: {
      id: z.number().describe('User ID'),
      email_stage: z.string().describe('Primary key (UUID) of the email stage to use for sending recovery email'),
    },
    handler: async (args) => {
      await client.coreApi.coreUsersRecoveryEmailCreate({
        id: args.id as number,
        emailStage: args.email_stage as string,
      });
      return `Recovery email sent successfully to user ${args.id}.`;
    },
  });

  // 11. List user paths
  registerTool(server, config, {
    name: 'authentik_users_list_paths',
    description: 'List all user paths configured in the system.',
    accessTier: 'read-only',
    category: 'core',
    inputSchema: {
      search: z.string().optional().describe('Search filter for paths'),
    },
    handler: async (args) => {
      const result = await client.coreApi.coreUsersPathsRetrieve({
        search: args.search as string | undefined,
      });
      return JSON.stringify(result, null, 2);
    },
  });
}
