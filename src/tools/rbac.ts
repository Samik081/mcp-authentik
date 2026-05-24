import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { AuthentikClient } from "../core/client.js";
import { registerTool } from "../core/tools.js";
import type { AppConfig } from "../types/index.js";

export function registerRbacTools(
  server: McpServer,
  client: AuthentikClient,
  config: AppConfig,
): void {
  // ── Roles CRUD ─────────────────────────────────────────────────────

  // 1. List roles
  registerTool(server, config, {
    name: "authentik_rbac_roles_list",
    title: "List RBAC Roles",
    description: "List RBAC roles with optional filters.",
    accessTier: "read-only",
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
    },
    category: "rbac",
    inputSchema: {
      search: z.string().optional().describe("Search across role fields"),
      ordering: z
        .string()
        .optional()
        .describe("Field to order by (prefix with - for descending)"),
      page: z.number().optional().describe("Page number"),
      page_size: z.number().optional().describe("Number of results per page"),
    },
    handler: async (args) => {
      const result = await client.rbacApi.rbacRolesList({
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
    name: "authentik_rbac_roles_get",
    title: "Get RBAC Role",
    description: "Get a single RBAC role by its UUID.",
    accessTier: "read-only",
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
    },
    category: "rbac",
    inputSchema: {
      uuid: z.string().describe("Role UUID"),
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
    name: "authentik_rbac_roles_create",
    title: "Create RBAC Role",
    description: "Create a new RBAC role.",
    accessTier: "full",
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
    },
    category: "rbac",
    inputSchema: {
      name: z.string().describe("Role name (required)"),
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
    name: "authentik_rbac_roles_update",
    title: "Update RBAC Role",
    description:
      "Update an existing RBAC role. Only provided fields are modified (partial update).",
    accessTier: "full",
    annotations: {
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: true,
    },
    category: "rbac",
    inputSchema: {
      uuid: z.string().describe("Role UUID (required)"),
      name: z.string().optional().describe("New role name"),
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
    name: "authentik_rbac_roles_delete",
    title: "Delete RBAC Role",
    description:
      "Delete an RBAC role by its UUID. This action is irreversible.",
    accessTier: "full",
    annotations: {
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: false,
    },
    category: "rbac",
    inputSchema: {
      uuid: z.string().describe("Role UUID to delete"),
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
    name: "authentik_rbac_permissions_list",
    title: "List RBAC Permissions",
    description: "List all available permissions, filterable by model and app.",
    accessTier: "read-only",
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
    },
    category: "rbac",
    inputSchema: {
      codename: z.string().optional().describe("Filter by permission codename"),
      content_type_model: z
        .string()
        .optional()
        .describe("Filter by content type model"),
      content_type_app_label: z
        .string()
        .optional()
        .describe("Filter by content type app label"),
      role: z.string().optional().describe("Filter by role UUID"),
      search: z.string().optional().describe("Search across permission fields"),
      ordering: z.string().optional().describe("Field to order by"),
      page: z.number().optional().describe("Page number"),
      page_size: z.number().optional().describe("Number of results per page"),
    },
    handler: async (args) => {
      const result = await client.rbacApi.rbacPermissionsList({
        codename: args.codename as string | undefined,
        contentTypeModel: args.content_type_model as string | undefined,
        contentTypeAppLabel: args.content_type_app_label as string | undefined,
        role: args.role as string | undefined,
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
    name: "authentik_rbac_permissions_by_role_list",
    title: "List Permissions by Role",
    description:
      "List object permissions assigned to a specific model, filterable by role.",
    accessTier: "read-only",
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
    },
    category: "rbac",
    inputSchema: {
      model: z
        .string()
        .describe('Model identifier (e.g. "authentik_core.application")'),
      object_pk: z
        .string()
        .optional()
        .describe("Object primary key to filter permissions for"),
      search: z.string().optional().describe("Search across fields"),
      ordering: z.string().optional().describe("Field to order by"),
      page: z.number().optional().describe("Page number"),
      page_size: z.number().optional().describe("Number of results per page"),
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
    name: "authentik_rbac_permissions_by_role_assign",
    title: "Assign Permissions to Role",
    description:
      "Assign permission(s) to a role. When object_pk is set, permissions are only assigned to the specific object.",
    accessTier: "full",
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
    },
    category: "rbac",
    inputSchema: {
      uuid: z.string().describe("Role UUID"),
      permissions: z
        .array(z.string())
        .describe("Array of permission codenames to assign"),
      model: z
        .string()
        .optional()
        .describe("Model identifier for scoped permissions"),
      object_pk: z
        .string()
        .optional()
        .describe("Object primary key for object-level permissions"),
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
    name: "authentik_rbac_permissions_by_role_unassign",
    title: "Unassign Permissions from Role",
    description:
      "Unassign permission(s) from a role. When object_pk is set, permissions are only unassigned from the specific object.",
    accessTier: "full",
    annotations: {
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: false,
    },
    category: "rbac",
    inputSchema: {
      uuid: z.string().describe("Role UUID"),
      permissions: z
        .array(z.string())
        .describe("Array of permission codenames to unassign"),
      model: z
        .string()
        .optional()
        .describe("Model identifier for scoped permissions"),
      object_pk: z
        .string()
        .optional()
        .describe("Object primary key for object-level permissions"),
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

  // ── Role membership ────────────────────────────────────────────────

  // Add user to role
  registerTool(server, config, {
    name: "authentik_rbac_roles_add_user",
    title: "Add User to Role",
    description:
      "Add a user to a role by role UUID and user ID. Permissions are granted via roles.",
    accessTier: "full",
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
    },
    category: "rbac",
    inputSchema: {
      role_uuid: z.string().describe("Role UUID"),
      user_id: z.number().describe("User ID to add to the role"),
    },
    handler: async (args) => {
      await client.rbacApi.rbacRolesAddUserCreate({
        uuid: args.role_uuid as string,
        userAccountSerializerForRoleRequest: {
          pk: args.user_id as number,
        },
      });
      return `User ${args.user_id} added to role ${args.role_uuid} successfully.`;
    },
  });

  // Remove user from role
  registerTool(server, config, {
    name: "authentik_rbac_roles_remove_user",
    title: "Remove User from Role",
    description: "Remove a user from a role by role UUID and user ID.",
    accessTier: "full",
    annotations: {
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: false,
    },
    category: "rbac",
    inputSchema: {
      role_uuid: z.string().describe("Role UUID"),
      user_id: z.number().describe("User ID to remove from the role"),
    },
    handler: async (args) => {
      await client.rbacApi.rbacRolesRemoveUserCreate({
        uuid: args.role_uuid as string,
        userAccountSerializerForRoleRequest: {
          pk: args.user_id as number,
        },
      });
      return `User ${args.user_id} removed from role ${args.role_uuid} successfully.`;
    },
  });
}
