import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { AuthentikClient } from '../core/client.js';
import type { AppConfig } from '../types/index.js';
import { registerTool } from '../core/tools.js';

export function registerRbacTools(
  server: McpServer,
  client: AuthentikClient,
  config: AppConfig,
): void {
  // ── Roles CRUD ─────────────────────────────────────────────────────

  // 1. List roles
  registerTool(server, config, {
    name: 'authentik_rbac_roles_list',
    description: 'List RBAC roles with optional filters.',
    accessTier: 'read-only',
    category: 'rbac',
    inputSchema: {
      group_name: z.string().optional().describe('Filter by group name'),
      search: z.string().optional().describe('Search across role fields'),
      ordering: z.string().optional().describe('Field to order by (prefix with - for descending)'),
      page: z.number().optional().describe('Page number'),
      page_size: z.number().optional().describe('Number of results per page'),
    },
    handler: async (args) => {
      const result = await client.rbacApi.rbacRolesList({
        groupName: args.group_name as string | undefined,
        search: args.search as string | undefined,
        ordering: args.ordering as string | undefined,
        page: args.page as number | undefined,
        pageSize: args.page_size as number | undefined,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 2. Get role
  registerTool(server, config, {
    name: 'authentik_rbac_roles_get',
    description: 'Get a single RBAC role by its UUID.',
    accessTier: 'read-only',
    category: 'rbac',
    inputSchema: {
      uuid: z.string().describe('Role UUID'),
    },
    handler: async (args) => {
      const result = await client.rbacApi.rbacRolesRetrieve({
        uuid: args.uuid as string,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 3. Create role
  registerTool(server, config, {
    name: 'authentik_rbac_roles_create',
    description: 'Create a new RBAC role.',
    accessTier: 'full',
    category: 'rbac',
    inputSchema: {
      name: z.string().describe('Role name (required)'),
    },
    handler: async (args) => {
      const result = await client.rbacApi.rbacRolesCreate({
        roleRequest: {
          name: args.name as string,
        },
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 4. Update role
  registerTool(server, config, {
    name: 'authentik_rbac_roles_update',
    description: 'Update an existing RBAC role. Only provided fields are modified (partial update).',
    accessTier: 'full',
    category: 'rbac',
    inputSchema: {
      uuid: z.string().describe('Role UUID (required)'),
      name: z.string().optional().describe('New role name'),
    },
    handler: async (args) => {
      const result = await client.rbacApi.rbacRolesPartialUpdate({
        uuid: args.uuid as string,
        patchedRoleRequest: {
          name: args.name as string | undefined,
        },
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 5. Delete role
  registerTool(server, config, {
    name: 'authentik_rbac_roles_delete',
    description: 'Delete an RBAC role by its UUID. This action is irreversible.',
    accessTier: 'full',
    category: 'rbac',
    tags: ['destructive'],
    inputSchema: {
      uuid: z.string().describe('Role UUID to delete'),
    },
    handler: async (args) => {
      await client.rbacApi.rbacRolesDestroy({
        uuid: args.uuid as string,
      });
      return `Role "${args.uuid}" deleted successfully.`;
    },
  });

  // ── Permissions ────────────────────────────────────────────────────

  // 6. List permissions
  registerTool(server, config, {
    name: 'authentik_rbac_permissions_list',
    description: 'List all available permissions, filterable by model and app.',
    accessTier: 'read-only',
    category: 'rbac',
    inputSchema: {
      codename: z.string().optional().describe('Filter by permission codename'),
      content_type_model: z.string().optional().describe('Filter by content type model'),
      content_type_app_label: z.string().optional().describe('Filter by content type app label'),
      role: z.string().optional().describe('Filter by role UUID'),
      user: z.number().optional().describe('Filter by user ID'),
      search: z.string().optional().describe('Search across permission fields'),
      ordering: z.string().optional().describe('Field to order by'),
      page: z.number().optional().describe('Page number'),
      page_size: z.number().optional().describe('Number of results per page'),
    },
    handler: async (args) => {
      const result = await client.rbacApi.rbacPermissionsList({
        codename: args.codename as string | undefined,
        contentTypeModel: args.content_type_model as string | undefined,
        contentTypeAppLabel: args.content_type_app_label as string | undefined,
        role: args.role as string | undefined,
        user: args.user as number | undefined,
        search: args.search as string | undefined,
        ordering: args.ordering as string | undefined,
        page: args.page as number | undefined,
        pageSize: args.page_size as number | undefined,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // ── Permissions by role ────────────────────────────────────────────

  // 7. List permissions assigned to a role
  registerTool(server, config, {
    name: 'authentik_rbac_permissions_by_role_list',
    description: 'List object permissions assigned to a specific model, filterable by role.',
    accessTier: 'read-only',
    category: 'rbac',
    inputSchema: {
      model: z.string().describe('Model identifier (e.g. "authentik_core.application")'),
      object_pk: z.string().optional().describe('Object primary key to filter permissions for'),
      search: z.string().optional().describe('Search across fields'),
      ordering: z.string().optional().describe('Field to order by'),
      page: z.number().optional().describe('Page number'),
      page_size: z.number().optional().describe('Number of results per page'),
    },
    handler: async (args) => {
      const result = await client.rbacApi.rbacPermissionsAssignedByRolesList({
        model: args.model as any,
        objectPk: args.object_pk as string | undefined,
        search: args.search as string | undefined,
        ordering: args.ordering as string | undefined,
        page: args.page as number | undefined,
        pageSize: args.page_size as number | undefined,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 8. Assign permissions to a role
  registerTool(server, config, {
    name: 'authentik_rbac_permissions_by_role_assign',
    description: 'Assign permission(s) to a role. When object_pk is set, permissions are only assigned to the specific object.',
    accessTier: 'full',
    category: 'rbac',
    inputSchema: {
      uuid: z.string().describe('Role UUID'),
      permissions: z.array(z.string()).describe('Array of permission codenames to assign'),
      model: z.string().optional().describe('Model identifier for scoped permissions'),
      object_pk: z.string().optional().describe('Object primary key for object-level permissions'),
    },
    handler: async (args) => {
      const result = await client.rbacApi.rbacPermissionsAssignedByRolesAssign({
        uuid: args.uuid as string,
        permissionAssignRequest: {
          permissions: args.permissions as string[],
          model: args.model as any,
          objectPk: args.object_pk as string | undefined,
        },
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 9. Unassign permissions from a role
  registerTool(server, config, {
    name: 'authentik_rbac_permissions_by_role_unassign',
    description: 'Unassign permission(s) from a role. When object_pk is set, permissions are only unassigned from the specific object.',
    accessTier: 'full',
    category: 'rbac',
    inputSchema: {
      uuid: z.string().describe('Role UUID'),
      permissions: z.array(z.string()).describe('Array of permission codenames to unassign'),
      model: z.string().optional().describe('Model identifier for scoped permissions'),
      object_pk: z.string().optional().describe('Object primary key for object-level permissions'),
    },
    handler: async (args) => {
      await client.rbacApi.rbacPermissionsAssignedByRolesUnassignPartialUpdate({
        uuid: args.uuid as string,
        patchedPermissionAssignRequest: {
          permissions: args.permissions as string[],
          model: args.model as any,
          objectPk: args.object_pk as string | undefined,
        },
      });
      return `Permissions unassigned from role "${args.uuid}" successfully.`;
    },
  });

  // ── Permissions by user ────────────────────────────────────────────

  // 10. List permissions assigned to a user
  registerTool(server, config, {
    name: 'authentik_rbac_permissions_by_user_list',
    description: 'List object permissions assigned to a specific model, filterable by user.',
    accessTier: 'read-only',
    category: 'rbac',
    inputSchema: {
      model: z.string().describe('Model identifier (e.g. "authentik_core.user")'),
      object_pk: z.string().optional().describe('Object primary key to filter permissions for'),
      search: z.string().optional().describe('Search across fields'),
      ordering: z.string().optional().describe('Field to order by'),
      page: z.number().optional().describe('Page number'),
      page_size: z.number().optional().describe('Number of results per page'),
    },
    handler: async (args) => {
      const result = await client.rbacApi.rbacPermissionsAssignedByUsersList({
        model: args.model as any,
        objectPk: args.object_pk as string | undefined,
        search: args.search as string | undefined,
        ordering: args.ordering as string | undefined,
        page: args.page as number | undefined,
        pageSize: args.page_size as number | undefined,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 11. Assign permissions to a user
  registerTool(server, config, {
    name: 'authentik_rbac_permissions_by_user_assign',
    description: 'Assign permission(s) to a user.',
    accessTier: 'full',
    category: 'rbac',
    inputSchema: {
      id: z.number().describe('User ID'),
      permissions: z.array(z.string()).describe('Array of permission codenames to assign'),
      model: z.string().optional().describe('Model identifier for scoped permissions'),
      object_pk: z.string().optional().describe('Object primary key for object-level permissions'),
    },
    handler: async (args) => {
      const result = await client.rbacApi.rbacPermissionsAssignedByUsersAssign({
        id: args.id as number,
        permissionAssignRequest: {
          permissions: args.permissions as string[],
          model: args.model as any,
          objectPk: args.object_pk as string | undefined,
        },
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 12. Unassign permissions from a user
  registerTool(server, config, {
    name: 'authentik_rbac_permissions_by_user_unassign',
    description: 'Unassign permission(s) from a user.',
    accessTier: 'full',
    category: 'rbac',
    inputSchema: {
      id: z.number().describe('User ID'),
      permissions: z.array(z.string()).describe('Array of permission codenames to unassign'),
      model: z.string().optional().describe('Model identifier for scoped permissions'),
      object_pk: z.string().optional().describe('Object primary key for object-level permissions'),
    },
    handler: async (args) => {
      await client.rbacApi.rbacPermissionsAssignedByUsersUnassignPartialUpdate({
        id: args.id as number,
        patchedPermissionAssignRequest: {
          permissions: args.permissions as string[],
          model: args.model as any,
          objectPk: args.object_pk as string | undefined,
        },
      });
      return `Permissions unassigned from user ${args.id} successfully.`;
    },
  });
}
