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
