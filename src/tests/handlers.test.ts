import type { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { afterEach, beforeEach, describe, expect, it, type vi } from "vitest";
import type { AuthentikClient } from "../core/client.js";
import { createServer } from "../core/server.js";
import { registerAllTools } from "../tools/index.js";
import { connectTestClient, makeConfig, makeMockClient } from "./helpers.js";

describe("handler: authentik_users_list", () => {
  let cleanup: () => Promise<void>;
  let mcpClient: Client;
  let mockClient: AuthentikClient;

  beforeEach(async () => {
    mockClient = makeMockClient();
    const server = createServer();
    registerAllTools(server, mockClient, makeConfig());
    const conn = await connectTestClient(server);
    mcpClient = conn.client;
    cleanup = conn.cleanup;
  });

  afterEach(async () => {
    await cleanup();
  });

  it("returns JSON text of user list on success", async () => {
    const fakeUsers = {
      pagination: { count: 1 },
      results: [{ pk: 1, username: "admin" }],
    };
    (
      mockClient.coreApi.coreUsersList as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce(fakeUsers);

    const result = await mcpClient.callTool({
      name: "authentik_users_list",
      arguments: {},
    });

    expect(result.isError).toBeFalsy();
    const text = (result.content[0] as { type: "text"; text: string }).text;
    expect(JSON.parse(text)).toEqual(fakeUsers);
  });

  it("returns isError when client throws", async () => {
    (
      mockClient.coreApi.coreUsersList as ReturnType<typeof vi.fn>
    ).mockRejectedValueOnce(new Error("unauthorized"));

    const result = await mcpClient.callTool({
      name: "authentik_users_list",
      arguments: {},
    });

    expect(result.isError).toBe(true);
    const text = (result.content[0] as { type: "text"; text: string }).text;
    expect(text).toContain("unauthorized");
  });
});

describe("handler: authentik_users_get", () => {
  let cleanup: () => Promise<void>;
  let mcpClient: Client;
  let mockClient: AuthentikClient;

  beforeEach(async () => {
    mockClient = makeMockClient();
    const server = createServer();
    registerAllTools(server, mockClient, makeConfig());
    const conn = await connectTestClient(server);
    mcpClient = conn.client;
    cleanup = conn.cleanup;
  });

  afterEach(async () => {
    await cleanup();
  });

  it("calls coreApi.coreUsersRetrieve with correct id", async () => {
    const fakeUser = { pk: 42, username: "testuser" };
    (
      mockClient.coreApi.coreUsersRetrieve as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce(fakeUser);

    const result = await mcpClient.callTool({
      name: "authentik_users_get",
      arguments: { id: 42 },
    });

    expect(mockClient.coreApi.coreUsersRetrieve).toHaveBeenCalledWith({
      id: 42,
    });
    expect(result.isError).toBeFalsy();
  });

  it("rejects missing required id argument", async () => {
    const result = await mcpClient.callTool({
      name: "authentik_users_get",
      arguments: {},
    });

    expect(result.isError).toBe(true);
  });
});

describe("handler: authentik_users_delete (full tier)", () => {
  it("is not registered in read-only mode", async () => {
    const server = createServer();
    registerAllTools(
      server,
      makeMockClient(),
      makeConfig({ accessTier: "read-only" }),
    );
    const { client, cleanup } = await connectTestClient(server);
    const { tools } = await client.listTools();
    expect(tools.map((t) => t.name)).not.toContain("authentik_users_delete");
    await cleanup();
  });

  it("calls coreApi.coreUsersDestroy on success", async () => {
    const mockClient = makeMockClient();
    (
      mockClient.coreApi.coreUsersDestroy as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce(undefined);
    const server = createServer();
    registerAllTools(server, mockClient, makeConfig());
    const { client, cleanup } = await connectTestClient(server);

    const result = await client.callTool({
      name: "authentik_users_delete",
      arguments: { id: 42 },
    });

    expect(result.isError).toBeFalsy();
    expect(mockClient.coreApi.coreUsersDestroy).toHaveBeenCalledWith({
      id: 42,
    });
    await cleanup();
  });
});

// Shared harness for the 2026.5 new/changed tool handlers below.
function describeHandler(
  name: string,
  body: (ctx: {
    getMockClient: () => AuthentikClient;
    getClient: () => Client;
  }) => void,
) {
  describe(name, () => {
    let cleanup: () => Promise<void>;
    let mcpClient: Client;
    let mockClient: AuthentikClient;

    beforeEach(async () => {
      mockClient = makeMockClient();
      const server = createServer();
      registerAllTools(server, mockClient, makeConfig());
      const conn = await connectTestClient(server);
      mcpClient = conn.client;
      cleanup = conn.cleanup;
    });

    afterEach(async () => {
      await cleanup();
    });

    body({
      getMockClient: () => mockClient,
      getClient: () => mcpClient,
    });
  });
}

describeHandler(
  "handler: authentik_tasks_retry (2026.5)",
  ({ getMockClient, getClient }) => {
    it("calls tasksApi.tasksTasksRetryCreate with mapped messageId", async () => {
      const result = await getClient().callTool({
        name: "authentik_tasks_retry",
        arguments: { message_id: "msg-123" },
      });

      expect(result.isError).toBeFalsy();
      expect(
        getMockClient().tasksApi.tasksTasksRetryCreate,
      ).toHaveBeenCalledWith({ messageId: "msg-123" });
    });
  },
);

describeHandler(
  "handler: authentik_tasks_list (2026.5)",
  ({ getMockClient, getClient }) => {
    it("calls tasksApi.tasksTasksList with mapped filters", async () => {
      const result = await getClient().callTool({
        name: "authentik_tasks_list",
        arguments: { actor_name: "worker", page_size: 50 },
      });

      expect(result.isError).toBeFalsy();
      expect(getMockClient().tasksApi.tasksTasksList).toHaveBeenCalledWith(
        expect.objectContaining({ actorName: "worker", pageSize: 50 }),
      );
    });
  },
);

describeHandler(
  "handler: authentik_rbac_roles_add_user (2026.5)",
  ({ getMockClient, getClient }) => {
    it("calls rbacApi.rbacRolesAddUserCreate with mapped uuid + user pk", async () => {
      const result = await getClient().callTool({
        name: "authentik_rbac_roles_add_user",
        arguments: { role_uuid: "role-uuid-1", user_id: 7 },
      });

      expect(result.isError).toBeFalsy();
      expect(
        getMockClient().rbacApi.rbacRolesAddUserCreate,
      ).toHaveBeenCalledWith({
        uuid: "role-uuid-1",
        userAccountSerializerForRoleRequest: { pk: 7 },
      });
    });
  },
);

describeHandler(
  "handler: authentik_rbac_roles_remove_user (2026.5)",
  ({ getMockClient, getClient }) => {
    it("calls rbacApi.rbacRolesRemoveUserCreate with mapped uuid + user pk", async () => {
      const result = await getClient().callTool({
        name: "authentik_rbac_roles_remove_user",
        arguments: { role_uuid: "role-uuid-2", user_id: 9 },
      });

      expect(result.isError).toBeFalsy();
      expect(
        getMockClient().rbacApi.rbacRolesRemoveUserCreate,
      ).toHaveBeenCalledWith({
        uuid: "role-uuid-2",
        userAccountSerializerForRoleRequest: { pk: 9 },
      });
    });
  },
);

describeHandler(
  "handler: authentik_apps_set_icon_url (2026.5)",
  ({ getMockClient, getClient }) => {
    it("calls coreApi.coreApplicationsPartialUpdate with metaIcon", async () => {
      const result = await getClient().callTool({
        name: "authentik_apps_set_icon_url",
        arguments: { slug: "my-app", icon_url: "https://cdn.test/icon.png" },
      });

      expect(result.isError).toBeFalsy();
      expect(
        getMockClient().coreApi.coreApplicationsPartialUpdate,
      ).toHaveBeenCalledWith({
        slug: "my-app",
        patchedApplicationRequest: { metaIcon: "https://cdn.test/icon.png" },
      });
    });
  },
);

describeHandler(
  "handler: authentik_groups_create (2026.5)",
  ({ getMockClient, getClient }) => {
    it("maps parents array into the groupRequest body", async () => {
      const result = await getClient().callTool({
        name: "authentik_groups_create",
        arguments: { name: "child", parents: ["parent-uuid-a"] },
      });

      expect(result.isError).toBeFalsy();
      expect(getMockClient().coreApi.coreGroupsCreate).toHaveBeenCalledWith({
        groupRequest: expect.objectContaining({
          name: "child",
          parents: ["parent-uuid-a"],
        }),
      });
    });
  },
);

describeHandler(
  "handler: authentik_flows_import (2026.5)",
  ({ getMockClient, getClient }) => {
    it("calls managedApi.managedBlueprintsImportCreate with a file", async () => {
      const result = await getClient().callTool({
        name: "authentik_flows_import",
        arguments: { yaml_content: "version: 1" },
      });

      expect(result.isError).toBeFalsy();
      expect(
        getMockClient().managedApi.managedBlueprintsImportCreate,
      ).toHaveBeenCalledTimes(1);
      const call = (
        getMockClient().managedApi.managedBlueprintsImportCreate as ReturnType<
          typeof vi.fn
        >
      ).mock.calls[0][0];
      expect(call.file).toBeInstanceOf(Blob);
    });
  },
);

describeHandler(
  "handler: authentik_reports_export_get (2026.5)",
  ({ getMockClient, getClient }) => {
    it("calls reportsApi.reportsExportsRetrieve with id", async () => {
      const result = await getClient().callTool({
        name: "authentik_reports_export_get",
        arguments: { id: "export-1" },
      });

      expect(result.isError).toBeFalsy();
      expect(
        getMockClient().reportsApi.reportsExportsRetrieve,
      ).toHaveBeenCalledWith({ id: "export-1" });
    });
  },
);

describeHandler(
  "handler: authentik_endpoints_devices_list (2026.5)",
  ({ getMockClient, getClient }) => {
    it("calls endpointsApi.endpointsDevicesList", async () => {
      const result = await getClient().callTool({
        name: "authentik_endpoints_devices_list",
        arguments: { name: "laptop" },
      });

      expect(result.isError).toBeFalsy();
      expect(
        getMockClient().endpointsApi.endpointsDevicesList,
      ).toHaveBeenCalledWith(expect.objectContaining({ name: "laptop" }));
    });
  },
);

describeHandler(
  "handler: authentik_endpoints_devices_update (2026.5)",
  ({ getMockClient, getClient }) => {
    it("calls endpointsApi.endpointsDevicesPartialUpdate with mapped deviceUuid", async () => {
      const result = await getClient().callTool({
        name: "authentik_endpoints_devices_update",
        arguments: { device_uuid: "dev-uuid-1", name: "renamed" },
      });

      expect(result.isError).toBeFalsy();
      expect(
        getMockClient().endpointsApi.endpointsDevicesPartialUpdate,
      ).toHaveBeenCalledWith({
        deviceUuid: "dev-uuid-1",
        patchedEndpointDeviceRequest: expect.objectContaining({
          name: "renamed",
        }),
      });
    });
  },
);

describeHandler(
  "handler: authentik_events_stats (2026.5)",
  ({ getMockClient, getClient }) => {
    it("calls eventsApi.eventsEventsStatsRetrieve with mapped countSteps", async () => {
      const result = await getClient().callTool({
        name: "authentik_events_stats",
        arguments: { count_steps: ["1h", "1d"] },
      });

      expect(result.isError).toBeFalsy();
      expect(
        getMockClient().eventsApi.eventsEventsStatsRetrieve,
      ).toHaveBeenCalledWith(
        expect.objectContaining({ countSteps: ["1h", "1d"] }),
      );
    });
  },
);

describeHandler(
  "handler: authentik_users_account_lockdown (2026.5)",
  ({ getMockClient, getClient }) => {
    it("calls coreApi.coreUsersAccountLockdownCreate with mapped user id", async () => {
      const result = await getClient().callTool({
        name: "authentik_users_account_lockdown",
        arguments: { id: 13 },
      });

      expect(result.isError).toBeFalsy();
      expect(
        getMockClient().coreApi.coreUsersAccountLockdownCreate,
      ).toHaveBeenCalledWith({
        userAccountLockdownRequest: { user: 13 },
      });
    });
  },
);

describeHandler(
  "handler: authentik_ssf_streams_delete (2026.5)",
  ({ getMockClient, getClient }) => {
    it("calls ssfApi.ssfStreamsDestroy with mapped uuid", async () => {
      const result = await getClient().callTool({
        name: "authentik_ssf_streams_delete",
        arguments: { uuid: "stream-uuid-1" },
      });

      expect(result.isError).toBeFalsy();
      expect(getMockClient().ssfApi.ssfStreamsDestroy).toHaveBeenCalledWith({
        uuid: "stream-uuid-1",
      });
    });
  },
);
