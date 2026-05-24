import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { AuthentikClient } from "../core/client.js";
import { registerTool } from "../core/tools.js";
import type { AppConfig } from "../types/index.js";

export function registerEndpointTools(
  server: McpServer,
  client: AuthentikClient,
  config: AppConfig,
): void {
  // ---------------------------------------------------------------------------
  // Devices
  // ---------------------------------------------------------------------------

  // 1. List devices
  registerTool(server, config, {
    name: "authentik_endpoints_devices_list",
    title: "List Endpoint Devices",
    description:
      "List managed endpoint devices with optional filtering by name or identifier, search, and ordering.",
    accessTier: "read-only",
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
    },
    category: "endpoints",
    inputSchema: {
      name: z.string().optional().describe("Filter by device name"),
      identifier: z.string().optional().describe("Filter by device identifier"),
      search: z.string().optional().describe("Search across device fields"),
      ordering: z
        .string()
        .optional()
        .describe("Field to order by (prefix with - for descending)"),
      page: z.number().optional().describe("Page number"),
      page_size: z.number().optional().describe("Number of results per page"),
    },
    handler: async (args) => {
      const result = await client.endpointsApi.endpointsDevicesList({
        name: args.name as string | undefined,
        identifier: args.identifier as string | undefined,
        search: args.search as string | undefined,
        ordering: args.ordering as string | undefined,
        page: args.page as number | undefined,
        pageSize: args.page_size as number | undefined,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 2. Get device
  registerTool(server, config, {
    name: "authentik_endpoints_devices_get",
    title: "Get Endpoint Device",
    description: "Retrieve a single endpoint device by its UUID.",
    accessTier: "read-only",
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
    },
    category: "endpoints",
    inputSchema: {
      device_uuid: z.string().describe("Device UUID"),
    },
    handler: async (args) => {
      const result = await client.endpointsApi.endpointsDevicesRetrieve({
        deviceUuid: args.device_uuid as string,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 3. Devices summary
  registerTool(server, config, {
    name: "authentik_endpoints_devices_summary",
    title: "Get Endpoint Devices Summary",
    description:
      "Retrieve aggregate summary statistics about managed endpoint devices.",
    accessTier: "read-only",
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
    },
    category: "endpoints",
    inputSchema: {},
    handler: async () => {
      const result =
        await client.endpointsApi.endpointsDevicesSummaryRetrieve();
      return JSON.stringify(result, null, 2);
    },
  });

  // 4. Update device
  registerTool(server, config, {
    name: "authentik_endpoints_devices_update",
    title: "Update Endpoint Device",
    description:
      "Update an endpoint device. Only provided fields are modified (partial update).",
    accessTier: "full",
    annotations: {
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: true,
    },
    category: "endpoints",
    inputSchema: {
      device_uuid: z.string().describe("Device UUID to update"),
      name: z.string().optional().describe("Device name"),
      access_group: z
        .string()
        .nullable()
        .optional()
        .describe("Device access group UUID this device belongs to"),
      expiring: z.boolean().optional().describe("Whether the device expires"),
      expires: z
        .string()
        .nullable()
        .optional()
        .describe("Expiry timestamp (ISO 8601)"),
    },
    handler: async (args) => {
      await client.endpointsApi.endpointsDevicesPartialUpdate({
        deviceUuid: args.device_uuid as string,
        patchedEndpointDeviceRequest: {
          name: args.name as string | undefined,
          accessGroup: args.access_group as string | null | undefined,
          expiring: args.expiring as boolean | undefined,
          expires:
            args.expires != null
              ? new Date(args.expires as string)
              : (args.expires as null | undefined),
        },
      });
      return `Endpoint device ${args.device_uuid} updated successfully.`;
    },
  });

  // 5. Delete device
  registerTool(server, config, {
    name: "authentik_endpoints_devices_delete",
    title: "Delete Endpoint Device",
    description: "Delete an endpoint device by its UUID. This is irreversible.",
    accessTier: "full",
    annotations: {
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: false,
    },
    category: "endpoints",
    inputSchema: {
      device_uuid: z.string().describe("Device UUID to delete"),
    },
    handler: async (args) => {
      await client.endpointsApi.endpointsDevicesDestroy({
        deviceUuid: args.device_uuid as string,
      });
      return `Endpoint device ${args.device_uuid} deleted successfully.`;
    },
  });

  // ---------------------------------------------------------------------------
  // Device Access Groups
  // ---------------------------------------------------------------------------

  // 6. List device access groups
  registerTool(server, config, {
    name: "authentik_endpoints_device_access_groups_list",
    title: "List Device Access Groups",
    description:
      "List device access groups with optional filtering by name, search, and ordering.",
    accessTier: "read-only",
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
    },
    category: "endpoints",
    inputSchema: {
      name: z.string().optional().describe("Filter by access group name"),
      search: z.string().optional().describe("Search across fields"),
      ordering: z
        .string()
        .optional()
        .describe("Field to order by (prefix with - for descending)"),
      page: z.number().optional().describe("Page number"),
      page_size: z.number().optional().describe("Number of results per page"),
    },
    handler: async (args) => {
      const result = await client.endpointsApi.endpointsDeviceAccessGroupsList({
        name: args.name as string | undefined,
        search: args.search as string | undefined,
        ordering: args.ordering as string | undefined,
        page: args.page as number | undefined,
        pageSize: args.page_size as number | undefined,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 7. Get device access group
  registerTool(server, config, {
    name: "authentik_endpoints_device_access_groups_get",
    title: "Get Device Access Group",
    description: "Retrieve a single device access group by its UUID.",
    accessTier: "read-only",
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
    },
    category: "endpoints",
    inputSchema: {
      pbm_uuid: z.string().describe("Device access group UUID"),
    },
    handler: async (args) => {
      const result =
        await client.endpointsApi.endpointsDeviceAccessGroupsRetrieve({
          pbmUuid: args.pbm_uuid as string,
        });
      return JSON.stringify(result, null, 2);
    },
  });

  // 8. Create device access group
  registerTool(server, config, {
    name: "authentik_endpoints_device_access_groups_create",
    title: "Create Device Access Group",
    description:
      "Create a new device access group. Device access groups bundle devices for policy targeting.",
    accessTier: "full",
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
    },
    category: "endpoints",
    inputSchema: {
      name: z.string().describe("Access group name"),
      attributes: z
        .record(z.string(), z.unknown())
        .optional()
        .describe("Custom attributes object"),
    },
    handler: async (args) => {
      const result =
        await client.endpointsApi.endpointsDeviceAccessGroupsCreate({
          deviceAccessGroupRequest: {
            name: args.name as string,
            attributes: args.attributes as Record<string, unknown> | undefined,
          },
        });
      return `Device access group created successfully:\n${JSON.stringify(
        result,
        null,
        2,
      )}`;
    },
  });

  // 9. Update device access group
  registerTool(server, config, {
    name: "authentik_endpoints_device_access_groups_update",
    title: "Update Device Access Group",
    description:
      "Update a device access group. Only provided fields are modified (partial update).",
    accessTier: "full",
    annotations: {
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: true,
    },
    category: "endpoints",
    inputSchema: {
      pbm_uuid: z.string().describe("Device access group UUID to update"),
      name: z.string().optional().describe("Access group name"),
      attributes: z
        .record(z.string(), z.unknown())
        .optional()
        .describe("Custom attributes object"),
    },
    handler: async (args) => {
      await client.endpointsApi.endpointsDeviceAccessGroupsPartialUpdate({
        pbmUuid: args.pbm_uuid as string,
        patchedDeviceAccessGroupRequest: {
          name: args.name as string | undefined,
          attributes: args.attributes as Record<string, unknown> | undefined,
        },
      });
      return `Device access group ${args.pbm_uuid} updated successfully.`;
    },
  });

  // 10. Delete device access group
  registerTool(server, config, {
    name: "authentik_endpoints_device_access_groups_delete",
    title: "Delete Device Access Group",
    description:
      "Delete a device access group by its UUID. This is irreversible.",
    accessTier: "full",
    annotations: {
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: false,
    },
    category: "endpoints",
    inputSchema: {
      pbm_uuid: z.string().describe("Device access group UUID to delete"),
    },
    handler: async (args) => {
      await client.endpointsApi.endpointsDeviceAccessGroupsDestroy({
        pbmUuid: args.pbm_uuid as string,
      });
      return `Device access group ${args.pbm_uuid} deleted successfully.`;
    },
  });

  // ---------------------------------------------------------------------------
  // Device Bindings
  // ---------------------------------------------------------------------------

  // 11. List device bindings
  registerTool(server, config, {
    name: "authentik_endpoints_device_bindings_list",
    title: "List Device Bindings",
    description:
      "List device-to-user policy bindings with optional filtering by policy, target, enabled state, search, and ordering.",
    accessTier: "read-only",
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
    },
    category: "endpoints",
    inputSchema: {
      policy: z.string().optional().describe("Filter by policy UUID"),
      target: z.string().optional().describe("Filter by target UUID"),
      enabled: z.boolean().optional().describe("Filter by enabled state"),
      search: z.string().optional().describe("Search across fields"),
      ordering: z
        .string()
        .optional()
        .describe("Field to order by (prefix with - for descending)"),
      page: z.number().optional().describe("Page number"),
      page_size: z.number().optional().describe("Number of results per page"),
    },
    handler: async (args) => {
      const result = await client.endpointsApi.endpointsDeviceBindingsList({
        policy: args.policy as string | undefined,
        target: args.target as string | undefined,
        enabled: args.enabled as boolean | undefined,
        search: args.search as string | undefined,
        ordering: args.ordering as string | undefined,
        page: args.page as number | undefined,
        pageSize: args.page_size as number | undefined,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 12. Get device binding
  registerTool(server, config, {
    name: "authentik_endpoints_device_bindings_get",
    title: "Get Device Binding",
    description: "Retrieve a single device binding by its UUID.",
    accessTier: "read-only",
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
    },
    category: "endpoints",
    inputSchema: {
      policy_binding_uuid: z.string().describe("Policy binding UUID"),
    },
    handler: async (args) => {
      const result = await client.endpointsApi.endpointsDeviceBindingsRetrieve({
        policyBindingUuid: args.policy_binding_uuid as string,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 13. Create device binding
  registerTool(server, config, {
    name: "authentik_endpoints_device_bindings_create",
    title: "Create Device Binding",
    description:
      "Create a new device binding linking a policy, group, or user to a target with an evaluation order.",
    accessTier: "full",
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
    },
    category: "endpoints",
    inputSchema: {
      target: z.string().describe("Target UUID the binding applies to"),
      order: z.number().describe("Evaluation order of the binding"),
      policy: z.string().nullable().optional().describe("Policy UUID to bind"),
      group: z.string().nullable().optional().describe("Group UUID to bind"),
      user: z.number().nullable().optional().describe("User ID to bind"),
      enabled: z
        .boolean()
        .optional()
        .describe("Whether the binding is enabled"),
      negate: z
        .boolean()
        .optional()
        .describe("Negate the outcome of the policy"),
      timeout: z
        .number()
        .optional()
        .describe("Timeout after which policy execution is terminated"),
    },
    handler: async (args) => {
      const result = await client.endpointsApi.endpointsDeviceBindingsCreate({
        deviceUserBindingRequest: {
          target: args.target as string,
          order: args.order as number,
          policy: args.policy as string | null | undefined,
          group: args.group as string | null | undefined,
          user: args.user as number | null | undefined,
          enabled: args.enabled as boolean | undefined,
          negate: args.negate as boolean | undefined,
          timeout: args.timeout as number | undefined,
        },
      });
      return `Device binding created successfully:\n${JSON.stringify(
        result,
        null,
        2,
      )}`;
    },
  });

  // 14. Update device binding
  registerTool(server, config, {
    name: "authentik_endpoints_device_bindings_update",
    title: "Update Device Binding",
    description:
      "Update a device binding. Only provided fields are modified (partial update).",
    accessTier: "full",
    annotations: {
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: true,
    },
    category: "endpoints",
    inputSchema: {
      policy_binding_uuid: z.string().describe("Policy binding UUID to update"),
      target: z
        .string()
        .optional()
        .describe("Target UUID the binding applies to"),
      order: z.number().optional().describe("Evaluation order of the binding"),
      policy: z.string().nullable().optional().describe("Policy UUID to bind"),
      group: z.string().nullable().optional().describe("Group UUID to bind"),
      user: z.number().nullable().optional().describe("User ID to bind"),
      enabled: z
        .boolean()
        .optional()
        .describe("Whether the binding is enabled"),
      negate: z
        .boolean()
        .optional()
        .describe("Negate the outcome of the policy"),
      timeout: z
        .number()
        .optional()
        .describe("Timeout after which policy execution is terminated"),
    },
    handler: async (args) => {
      await client.endpointsApi.endpointsDeviceBindingsPartialUpdate({
        policyBindingUuid: args.policy_binding_uuid as string,
        patchedDeviceUserBindingRequest: {
          target: args.target as string | undefined,
          order: args.order as number | undefined,
          policy: args.policy as string | null | undefined,
          group: args.group as string | null | undefined,
          user: args.user as number | null | undefined,
          enabled: args.enabled as boolean | undefined,
          negate: args.negate as boolean | undefined,
          timeout: args.timeout as number | undefined,
        },
      });
      return `Device binding ${args.policy_binding_uuid} updated successfully.`;
    },
  });

  // 15. Delete device binding
  registerTool(server, config, {
    name: "authentik_endpoints_device_bindings_delete",
    title: "Delete Device Binding",
    description: "Delete a device binding by its UUID. This is irreversible.",
    accessTier: "full",
    annotations: {
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: false,
    },
    category: "endpoints",
    inputSchema: {
      policy_binding_uuid: z.string().describe("Policy binding UUID to delete"),
    },
    handler: async (args) => {
      await client.endpointsApi.endpointsDeviceBindingsDestroy({
        policyBindingUuid: args.policy_binding_uuid as string,
      });
      return `Device binding ${args.policy_binding_uuid} deleted successfully.`;
    },
  });

  // ---------------------------------------------------------------------------
  // Agent Connectors
  // ---------------------------------------------------------------------------

  // 16. List agent connectors
  registerTool(server, config, {
    name: "authentik_endpoints_agent_connectors_list",
    title: "List Agent Connectors",
    description:
      "List endpoint agent connectors with optional filtering by name, enabled state, search, and ordering.",
    accessTier: "read-only",
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
    },
    category: "endpoints",
    inputSchema: {
      name: z.string().optional().describe("Filter by connector name"),
      enabled: z.boolean().optional().describe("Filter by enabled state"),
      search: z.string().optional().describe("Search across fields"),
      ordering: z
        .string()
        .optional()
        .describe("Field to order by (prefix with - for descending)"),
      page: z.number().optional().describe("Page number"),
      page_size: z.number().optional().describe("Number of results per page"),
    },
    handler: async (args) => {
      const result = await client.endpointsApi.endpointsAgentsConnectorsList({
        name: args.name as string | undefined,
        enabled: args.enabled as boolean | undefined,
        search: args.search as string | undefined,
        ordering: args.ordering as string | undefined,
        page: args.page as number | undefined,
        pageSize: args.page_size as number | undefined,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 17. Get agent connector
  registerTool(server, config, {
    name: "authentik_endpoints_agent_connectors_get",
    title: "Get Agent Connector",
    description: "Retrieve a single agent connector by its UUID.",
    accessTier: "read-only",
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
    },
    category: "endpoints",
    inputSchema: {
      connector_uuid: z.string().describe("Connector UUID"),
    },
    handler: async (args) => {
      const result =
        await client.endpointsApi.endpointsAgentsConnectorsRetrieve({
          connectorUuid: args.connector_uuid as string,
        });
      return JSON.stringify(result, null, 2);
    },
  });

  // 18. Create agent connector
  registerTool(server, config, {
    name: "authentik_endpoints_agent_connectors_create",
    title: "Create Agent Connector",
    description: "Create a new endpoint agent connector.",
    accessTier: "full",
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
    },
    category: "endpoints",
    inputSchema: {
      name: z.string().describe("Connector name"),
      enabled: z
        .boolean()
        .optional()
        .describe("Whether the connector is enabled"),
      authorization_flow: z
        .string()
        .nullable()
        .optional()
        .describe("Authorization flow UUID"),
      snapshot_expiry: z
        .string()
        .optional()
        .describe("Snapshot expiry duration"),
      refresh_interval: z
        .string()
        .optional()
        .describe("Refresh interval duration"),
    },
    handler: async (args) => {
      const result = await client.endpointsApi.endpointsAgentsConnectorsCreate({
        agentConnectorRequest: {
          name: args.name as string,
          enabled: args.enabled as boolean | undefined,
          authorizationFlow: args.authorization_flow as
            | string
            | null
            | undefined,
          snapshotExpiry: args.snapshot_expiry as string | undefined,
          refreshInterval: args.refresh_interval as string | undefined,
        },
      });
      return `Agent connector created successfully:\n${JSON.stringify(
        result,
        null,
        2,
      )}`;
    },
  });

  // 19. Update agent connector
  registerTool(server, config, {
    name: "authentik_endpoints_agent_connectors_update",
    title: "Update Agent Connector",
    description:
      "Update an agent connector. Only provided fields are modified (partial update).",
    accessTier: "full",
    annotations: {
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: true,
    },
    category: "endpoints",
    inputSchema: {
      connector_uuid: z.string().describe("Connector UUID to update"),
      name: z.string().optional().describe("Connector name"),
      enabled: z
        .boolean()
        .optional()
        .describe("Whether the connector is enabled"),
      authorization_flow: z
        .string()
        .nullable()
        .optional()
        .describe("Authorization flow UUID"),
      snapshot_expiry: z
        .string()
        .optional()
        .describe("Snapshot expiry duration"),
      refresh_interval: z
        .string()
        .optional()
        .describe("Refresh interval duration"),
    },
    handler: async (args) => {
      await client.endpointsApi.endpointsAgentsConnectorsPartialUpdate({
        connectorUuid: args.connector_uuid as string,
        patchedAgentConnectorRequest: {
          name: args.name as string | undefined,
          enabled: args.enabled as boolean | undefined,
          authorizationFlow: args.authorization_flow as
            | string
            | null
            | undefined,
          snapshotExpiry: args.snapshot_expiry as string | undefined,
          refreshInterval: args.refresh_interval as string | undefined,
        },
      });
      return `Agent connector ${args.connector_uuid} updated successfully.`;
    },
  });

  // 20. Delete agent connector
  registerTool(server, config, {
    name: "authentik_endpoints_agent_connectors_delete",
    title: "Delete Agent Connector",
    description: "Delete an agent connector by its UUID. This is irreversible.",
    accessTier: "full",
    annotations: {
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: false,
    },
    category: "endpoints",
    inputSchema: {
      connector_uuid: z.string().describe("Connector UUID to delete"),
    },
    handler: async (args) => {
      await client.endpointsApi.endpointsAgentsConnectorsDestroy({
        connectorUuid: args.connector_uuid as string,
      });
      return `Agent connector ${args.connector_uuid} deleted successfully.`;
    },
  });

  // ---------------------------------------------------------------------------
  // Enrollment Tokens
  // ---------------------------------------------------------------------------

  // 21. List enrollment tokens
  registerTool(server, config, {
    name: "authentik_endpoints_enrollment_tokens_list",
    title: "List Enrollment Tokens",
    description:
      "List agent enrollment tokens with optional filtering by connector, search, and ordering.",
    accessTier: "read-only",
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
    },
    category: "endpoints",
    inputSchema: {
      connector: z.string().optional().describe("Filter by connector UUID"),
      search: z.string().optional().describe("Search across fields"),
      ordering: z
        .string()
        .optional()
        .describe("Field to order by (prefix with - for descending)"),
      page: z.number().optional().describe("Page number"),
      page_size: z.number().optional().describe("Number of results per page"),
    },
    handler: async (args) => {
      const result =
        await client.endpointsApi.endpointsAgentsEnrollmentTokensList({
          connector: args.connector as string | undefined,
          search: args.search as string | undefined,
          ordering: args.ordering as string | undefined,
          page: args.page as number | undefined,
          pageSize: args.page_size as number | undefined,
        });
      return JSON.stringify(result, null, 2);
    },
  });

  // 22. Get enrollment token
  registerTool(server, config, {
    name: "authentik_endpoints_enrollment_tokens_get",
    title: "Get Enrollment Token",
    description: "Retrieve a single enrollment token by its UUID.",
    accessTier: "read-only",
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
    },
    category: "endpoints",
    inputSchema: {
      token_uuid: z.string().describe("Enrollment token UUID"),
    },
    handler: async (args) => {
      const result =
        await client.endpointsApi.endpointsAgentsEnrollmentTokensRetrieve({
          tokenUuid: args.token_uuid as string,
        });
      return JSON.stringify(result, null, 2);
    },
  });

  // 23. Create enrollment token
  registerTool(server, config, {
    name: "authentik_endpoints_enrollment_tokens_create",
    title: "Create Enrollment Token",
    description:
      "Create a new agent enrollment token bound to a connector. Used to enroll devices.",
    accessTier: "full",
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
    },
    category: "endpoints",
    inputSchema: {
      name: z.string().describe("Enrollment token name"),
      connector: z.string().describe("Connector UUID this token enrolls into"),
      device_group: z
        .string()
        .nullable()
        .optional()
        .describe("Device access group UUID for enrolled devices"),
      expiring: z.boolean().optional().describe("Whether the token expires"),
      expires: z
        .string()
        .nullable()
        .optional()
        .describe("Expiry timestamp (ISO 8601)"),
    },
    handler: async (args) => {
      const result =
        await client.endpointsApi.endpointsAgentsEnrollmentTokensCreate({
          enrollmentTokenRequest: {
            name: args.name as string,
            connector: args.connector as string,
            deviceGroup: args.device_group as string | null | undefined,
            expiring: args.expiring as boolean | undefined,
            expires:
              args.expires != null
                ? new Date(args.expires as string)
                : (args.expires as null | undefined),
          },
        });
      return `Enrollment token created successfully:\n${JSON.stringify(
        result,
        null,
        2,
      )}`;
    },
  });

  // 24. Update enrollment token
  registerTool(server, config, {
    name: "authentik_endpoints_enrollment_tokens_update",
    title: "Update Enrollment Token",
    description:
      "Update an enrollment token. Only provided fields are modified (partial update).",
    accessTier: "full",
    annotations: {
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: true,
    },
    category: "endpoints",
    inputSchema: {
      token_uuid: z.string().describe("Enrollment token UUID to update"),
      name: z.string().optional().describe("Enrollment token name"),
      connector: z
        .string()
        .optional()
        .describe("Connector UUID this token enrolls into"),
      device_group: z
        .string()
        .nullable()
        .optional()
        .describe("Device access group UUID for enrolled devices"),
      expiring: z.boolean().optional().describe("Whether the token expires"),
      expires: z
        .string()
        .nullable()
        .optional()
        .describe("Expiry timestamp (ISO 8601)"),
    },
    handler: async (args) => {
      await client.endpointsApi.endpointsAgentsEnrollmentTokensPartialUpdate({
        tokenUuid: args.token_uuid as string,
        patchedEnrollmentTokenRequest: {
          name: args.name as string | undefined,
          connector: args.connector as string | undefined,
          deviceGroup: args.device_group as string | null | undefined,
          expiring: args.expiring as boolean | undefined,
          expires:
            args.expires != null
              ? new Date(args.expires as string)
              : (args.expires as null | undefined),
        },
      });
      return `Enrollment token ${args.token_uuid} updated successfully.`;
    },
  });

  // 25. Delete enrollment token
  registerTool(server, config, {
    name: "authentik_endpoints_enrollment_tokens_delete",
    title: "Delete Enrollment Token",
    description:
      "Delete an enrollment token by its UUID. This is irreversible.",
    accessTier: "full",
    annotations: {
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: false,
    },
    category: "endpoints",
    inputSchema: {
      token_uuid: z.string().describe("Enrollment token UUID to delete"),
    },
    handler: async (args) => {
      await client.endpointsApi.endpointsAgentsEnrollmentTokensDestroy({
        tokenUuid: args.token_uuid as string,
      });
      return `Enrollment token ${args.token_uuid} deleted successfully.`;
    },
  });

  // ---------------------------------------------------------------------------
  // ISE-PSSO Agents (Apple Independent Secure Enclave)
  // ---------------------------------------------------------------------------

  // 26. List ISE-PSSO agents
  registerTool(server, config, {
    name: "authentik_endpoints_psso_ise_list",
    title: "List ISE-PSSO Agents",
    description:
      "List Apple Independent Secure Enclave (ISE-PSSO) agents with optional filtering by user, search, and ordering.",
    accessTier: "read-only",
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
    },
    category: "endpoints",
    inputSchema: {
      user: z.number().optional().describe("Filter by user ID"),
      search: z.string().optional().describe("Search across fields"),
      ordering: z
        .string()
        .optional()
        .describe("Field to order by (prefix with - for descending)"),
      page: z.number().optional().describe("Page number"),
      page_size: z.number().optional().describe("Number of results per page"),
    },
    handler: async (args) => {
      const result = await client.endpointsApi.endpointsAgentsPssoIseList({
        user: args.user as number | undefined,
        search: args.search as string | undefined,
        ordering: args.ordering as string | undefined,
        page: args.page as number | undefined,
        pageSize: args.page_size as number | undefined,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 27. Get ISE-PSSO agent
  registerTool(server, config, {
    name: "authentik_endpoints_psso_ise_get",
    title: "Get ISE-PSSO Agent",
    description: "Retrieve a single ISE-PSSO agent by its UUID.",
    accessTier: "read-only",
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
    },
    category: "endpoints",
    inputSchema: {
      uuid: z.string().describe("ISE-PSSO agent UUID"),
    },
    handler: async (args) => {
      const result = await client.endpointsApi.endpointsAgentsPssoIseRetrieve({
        uuid: args.uuid as string,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 28. Delete ISE-PSSO agent
  registerTool(server, config, {
    name: "authentik_endpoints_psso_ise_delete",
    title: "Delete ISE-PSSO Agent",
    description: "Delete an ISE-PSSO agent by its UUID. This is irreversible.",
    accessTier: "full",
    annotations: {
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: false,
    },
    category: "endpoints",
    inputSchema: {
      uuid: z.string().describe("ISE-PSSO agent UUID to delete"),
    },
    handler: async (args) => {
      await client.endpointsApi.endpointsAgentsPssoIseDestroy({
        uuid: args.uuid as string,
      });
      return `ISE-PSSO agent ${args.uuid} deleted successfully.`;
    },
  });

  // ---------------------------------------------------------------------------
  // Fleet Connectors
  // ---------------------------------------------------------------------------

  // 29. List fleet connectors
  registerTool(server, config, {
    name: "authentik_endpoints_fleet_connectors_list",
    title: "List Fleet Connectors",
    description:
      "List Fleet device-management connectors with optional filtering by name, search, and ordering.",
    accessTier: "read-only",
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
    },
    category: "endpoints",
    inputSchema: {
      name: z.string().optional().describe("Filter by connector name"),
      search: z.string().optional().describe("Search across fields"),
      ordering: z
        .string()
        .optional()
        .describe("Field to order by (prefix with - for descending)"),
      page: z.number().optional().describe("Page number"),
      page_size: z.number().optional().describe("Number of results per page"),
    },
    handler: async (args) => {
      const result = await client.endpointsApi.endpointsFleetConnectorsList({
        name: args.name as string | undefined,
        search: args.search as string | undefined,
        ordering: args.ordering as string | undefined,
        page: args.page as number | undefined,
        pageSize: args.page_size as number | undefined,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 30. Get fleet connector
  registerTool(server, config, {
    name: "authentik_endpoints_fleet_connectors_get",
    title: "Get Fleet Connector",
    description: "Retrieve a single Fleet connector by its UUID.",
    accessTier: "read-only",
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
    },
    category: "endpoints",
    inputSchema: {
      connector_uuid: z.string().describe("Connector UUID"),
    },
    handler: async (args) => {
      const result = await client.endpointsApi.endpointsFleetConnectorsRetrieve(
        {
          connectorUuid: args.connector_uuid as string,
        },
      );
      return JSON.stringify(result, null, 2);
    },
  });

  // 31. Create fleet connector
  registerTool(server, config, {
    name: "authentik_endpoints_fleet_connectors_create",
    title: "Create Fleet Connector",
    description:
      "Create a new Fleet connector pointing at a Fleet device-management instance.",
    accessTier: "full",
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
    },
    category: "endpoints",
    inputSchema: {
      name: z.string().describe("Connector name"),
      url: z.string().describe("Fleet instance URL"),
      token: z.string().describe("Fleet API token"),
      enabled: z
        .boolean()
        .optional()
        .describe("Whether the connector is enabled"),
      map_users: z
        .boolean()
        .optional()
        .describe("Map Fleet users to authentik users"),
      map_teams_access_group: z
        .boolean()
        .optional()
        .describe("Map Fleet teams to device access groups"),
    },
    handler: async (args) => {
      const result = await client.endpointsApi.endpointsFleetConnectorsCreate({
        fleetConnectorRequest: {
          name: args.name as string,
          url: args.url as string,
          token: args.token as string,
          enabled: args.enabled as boolean | undefined,
          mapUsers: args.map_users as boolean | undefined,
          mapTeamsAccessGroup: args.map_teams_access_group as
            | boolean
            | undefined,
        },
      });
      return `Fleet connector created successfully:\n${JSON.stringify(
        result,
        null,
        2,
      )}`;
    },
  });

  // 32. Update fleet connector
  registerTool(server, config, {
    name: "authentik_endpoints_fleet_connectors_update",
    title: "Update Fleet Connector",
    description:
      "Update a Fleet connector. Only provided fields are modified (partial update).",
    accessTier: "full",
    annotations: {
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: true,
    },
    category: "endpoints",
    inputSchema: {
      connector_uuid: z.string().describe("Connector UUID to update"),
      name: z.string().optional().describe("Connector name"),
      url: z.string().optional().describe("Fleet instance URL"),
      token: z.string().optional().describe("Fleet API token"),
      enabled: z
        .boolean()
        .optional()
        .describe("Whether the connector is enabled"),
      map_users: z
        .boolean()
        .optional()
        .describe("Map Fleet users to authentik users"),
      map_teams_access_group: z
        .boolean()
        .optional()
        .describe("Map Fleet teams to device access groups"),
    },
    handler: async (args) => {
      await client.endpointsApi.endpointsFleetConnectorsPartialUpdate({
        connectorUuid: args.connector_uuid as string,
        patchedFleetConnectorRequest: {
          name: args.name as string | undefined,
          url: args.url as string | undefined,
          token: args.token as string | undefined,
          enabled: args.enabled as boolean | undefined,
          mapUsers: args.map_users as boolean | undefined,
          mapTeamsAccessGroup: args.map_teams_access_group as
            | boolean
            | undefined,
        },
      });
      return `Fleet connector ${args.connector_uuid} updated successfully.`;
    },
  });

  // 33. Delete fleet connector
  registerTool(server, config, {
    name: "authentik_endpoints_fleet_connectors_delete",
    title: "Delete Fleet Connector",
    description: "Delete a Fleet connector by its UUID. This is irreversible.",
    accessTier: "full",
    annotations: {
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: false,
    },
    category: "endpoints",
    inputSchema: {
      connector_uuid: z.string().describe("Connector UUID to delete"),
    },
    handler: async (args) => {
      await client.endpointsApi.endpointsFleetConnectorsDestroy({
        connectorUuid: args.connector_uuid as string,
      });
      return `Fleet connector ${args.connector_uuid} deleted successfully.`;
    },
  });

  // ---------------------------------------------------------------------------
  // Google Chrome Connectors
  // ---------------------------------------------------------------------------

  // 34. List Google Chrome connectors
  registerTool(server, config, {
    name: "authentik_endpoints_google_chrome_connectors_list",
    title: "List Google Chrome Connectors",
    description:
      "List Google Chrome device-management connectors with optional filtering by name, search, and ordering.",
    accessTier: "read-only",
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
    },
    category: "endpoints",
    inputSchema: {
      name: z.string().optional().describe("Filter by connector name"),
      search: z.string().optional().describe("Search across fields"),
      ordering: z
        .string()
        .optional()
        .describe("Field to order by (prefix with - for descending)"),
      page: z.number().optional().describe("Page number"),
      page_size: z.number().optional().describe("Number of results per page"),
    },
    handler: async (args) => {
      const result =
        await client.endpointsApi.endpointsGoogleChromeConnectorsList({
          name: args.name as string | undefined,
          search: args.search as string | undefined,
          ordering: args.ordering as string | undefined,
          page: args.page as number | undefined,
          pageSize: args.page_size as number | undefined,
        });
      return JSON.stringify(result, null, 2);
    },
  });

  // 35. Get Google Chrome connector
  registerTool(server, config, {
    name: "authentik_endpoints_google_chrome_connectors_get",
    title: "Get Google Chrome Connector",
    description: "Retrieve a single Google Chrome connector by its UUID.",
    accessTier: "read-only",
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
    },
    category: "endpoints",
    inputSchema: {
      connector_uuid: z.string().describe("Connector UUID"),
    },
    handler: async (args) => {
      const result =
        await client.endpointsApi.endpointsGoogleChromeConnectorsRetrieve({
          connectorUuid: args.connector_uuid as string,
        });
      return JSON.stringify(result, null, 2);
    },
  });

  // 36. Create Google Chrome connector
  registerTool(server, config, {
    name: "authentik_endpoints_google_chrome_connectors_create",
    title: "Create Google Chrome Connector",
    description:
      "Create a new Google Chrome connector with service-account credentials.",
    accessTier: "full",
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
    },
    category: "endpoints",
    inputSchema: {
      name: z.string().describe("Connector name"),
      credentials: z
        .record(z.string(), z.unknown())
        .describe("Google service-account credentials object"),
      enabled: z
        .boolean()
        .optional()
        .describe("Whether the connector is enabled"),
    },
    handler: async (args) => {
      const result =
        await client.endpointsApi.endpointsGoogleChromeConnectorsCreate({
          googleChromeConnectorRequest: {
            name: args.name as string,
            credentials: args.credentials as Record<string, unknown>,
            enabled: args.enabled as boolean | undefined,
          },
        });
      return `Google Chrome connector created successfully:\n${JSON.stringify(
        result,
        null,
        2,
      )}`;
    },
  });

  // 37. Update Google Chrome connector
  registerTool(server, config, {
    name: "authentik_endpoints_google_chrome_connectors_update",
    title: "Update Google Chrome Connector",
    description:
      "Update a Google Chrome connector. Only provided fields are modified (partial update).",
    accessTier: "full",
    annotations: {
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: true,
    },
    category: "endpoints",
    inputSchema: {
      connector_uuid: z.string().describe("Connector UUID to update"),
      name: z.string().optional().describe("Connector name"),
      credentials: z
        .record(z.string(), z.unknown())
        .optional()
        .describe("Google service-account credentials object"),
      enabled: z
        .boolean()
        .optional()
        .describe("Whether the connector is enabled"),
    },
    handler: async (args) => {
      await client.endpointsApi.endpointsGoogleChromeConnectorsPartialUpdate({
        connectorUuid: args.connector_uuid as string,
        patchedGoogleChromeConnectorRequest: {
          name: args.name as string | undefined,
          credentials: args.credentials as Record<string, unknown> | undefined,
          enabled: args.enabled as boolean | undefined,
        },
      });
      return `Google Chrome connector ${args.connector_uuid} updated successfully.`;
    },
  });

  // 38. Delete Google Chrome connector
  registerTool(server, config, {
    name: "authentik_endpoints_google_chrome_connectors_delete",
    title: "Delete Google Chrome Connector",
    description:
      "Delete a Google Chrome connector by its UUID. This is irreversible.",
    accessTier: "full",
    annotations: {
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: false,
    },
    category: "endpoints",
    inputSchema: {
      connector_uuid: z.string().describe("Connector UUID to delete"),
    },
    handler: async (args) => {
      await client.endpointsApi.endpointsGoogleChromeConnectorsDestroy({
        connectorUuid: args.connector_uuid as string,
      });
      return `Google Chrome connector ${args.connector_uuid} deleted successfully.`;
    },
  });

  // ---------------------------------------------------------------------------
  // Connectors (generic registry — read + delete)
  // ---------------------------------------------------------------------------

  // 39. List connectors
  registerTool(server, config, {
    name: "authentik_endpoints_connectors_list",
    title: "List Endpoint Connectors",
    description:
      "List all endpoint connectors across types (generic registry view) with optional search and ordering.",
    accessTier: "read-only",
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
    },
    category: "endpoints",
    inputSchema: {
      search: z.string().optional().describe("Search across fields"),
      ordering: z
        .string()
        .optional()
        .describe("Field to order by (prefix with - for descending)"),
      page: z.number().optional().describe("Page number"),
      page_size: z.number().optional().describe("Number of results per page"),
    },
    handler: async (args) => {
      const result = await client.endpointsApi.endpointsConnectorsList({
        search: args.search as string | undefined,
        ordering: args.ordering as string | undefined,
        page: args.page as number | undefined,
        pageSize: args.page_size as number | undefined,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 40. Get connector
  registerTool(server, config, {
    name: "authentik_endpoints_connectors_get",
    title: "Get Endpoint Connector",
    description:
      "Retrieve a single endpoint connector by its UUID from the generic registry.",
    accessTier: "read-only",
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
    },
    category: "endpoints",
    inputSchema: {
      connector_uuid: z.string().describe("Connector UUID"),
    },
    handler: async (args) => {
      const result = await client.endpointsApi.endpointsConnectorsRetrieve({
        connectorUuid: args.connector_uuid as string,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 41. Delete connector
  registerTool(server, config, {
    name: "authentik_endpoints_connectors_delete",
    title: "Delete Endpoint Connector",
    description:
      "Delete an endpoint connector by its UUID from the generic registry. This is irreversible.",
    accessTier: "full",
    annotations: {
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: false,
    },
    category: "endpoints",
    inputSchema: {
      connector_uuid: z.string().describe("Connector UUID to delete"),
    },
    handler: async (args) => {
      await client.endpointsApi.endpointsConnectorsDestroy({
        connectorUuid: args.connector_uuid as string,
      });
      return `Endpoint connector ${args.connector_uuid} deleted successfully.`;
    },
  });
}
