import { request as httpRequest } from "node:http";
import { afterEach, describe, expect, it } from "vitest";
import { loadConfig } from "../core/config.js";
import { createServer, startServer } from "../core/server.js";
import { registerAllTools } from "../tools/index.js";
import type { AppConfig } from "../types/index.js";
import { makeConfig, makeMockClient } from "./helpers.js";

/**
 * Remote authorization: with AUTHENTIK_REMOTE_AUTHORIZATION=true one HTTP
 * deployment serves several users, each sending its own Authentik token, so
 * the token seen by the session is the caller's rather than the environment's.
 */

interface PostResult {
  status: number;
  headers: Record<string, string>;
  body: string;
}

function postInitialize(
  port: number,
  authorization?: string,
): Promise<PostResult> {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2025-03-26",
        capabilities: {},
        clientInfo: { name: "test-client", version: "1.0.0" },
      },
    });
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
    };
    if (authorization) {
      headers.Authorization = authorization;
    }
    const req = httpRequest(
      { hostname: "127.0.0.1", port, path: "/", method: "POST", headers },
      (res) => {
        let body = "";
        res.on("data", (chunk: Buffer) => {
          body += chunk.toString();
        });
        res.on("end", () => {
          const responseHeaders: Record<string, string> = {};
          for (const [key, value] of Object.entries(res.headers)) {
            if (typeof value === "string") {
              responseHeaders[key] = value;
            }
          }
          resolve({
            status: res.statusCode ?? 0,
            headers: responseHeaders,
            body,
          });
        });
      },
    );
    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

describe("remote authorization config", () => {
  const envKeys = [
    "AUTHENTIK_URL",
    "AUTHENTIK_TOKEN",
    "AUTHENTIK_REMOTE_AUTHORIZATION",
    "MCP_TRANSPORT",
  ];
  const saved = new Map<string, string | undefined>();

  function setEnv(values: Record<string, string | undefined>): void {
    for (const key of envKeys) {
      if (!saved.has(key)) {
        saved.set(key, process.env[key]);
      }
      const value = values[key];
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  }

  afterEach(() => {
    for (const [key, value] of saved) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
    saved.clear();
  });

  it("allows a missing AUTHENTIK_TOKEN when enabled", () => {
    setEnv({
      AUTHENTIK_URL: "https://authentik.test",
      AUTHENTIK_REMOTE_AUTHORIZATION: "true",
      MCP_TRANSPORT: "http",
      AUTHENTIK_TOKEN: undefined,
    });

    const config = loadConfig();
    expect(config.remoteAuthorization).toBe(true);
    expect(config.token).toBeUndefined();
  });

  it("still requires AUTHENTIK_TOKEN when disabled", () => {
    setEnv({
      AUTHENTIK_URL: "https://authentik.test",
      AUTHENTIK_REMOTE_AUTHORIZATION: undefined,
      MCP_TRANSPORT: "http",
      AUTHENTIK_TOKEN: undefined,
    });

    expect(() => loadConfig()).toThrow(/AUTHENTIK_TOKEN/);
  });

  it("rejects stdio, which has no per-request headers", () => {
    setEnv({
      AUTHENTIK_URL: "https://authentik.test",
      AUTHENTIK_REMOTE_AUTHORIZATION: "true",
      MCP_TRANSPORT: undefined,
      AUTHENTIK_TOKEN: "env-token",
    });

    expect(() => loadConfig()).toThrow(/MCP_TRANSPORT=http/);
  });

  it("rejects a value that is neither true nor false", () => {
    setEnv({
      AUTHENTIK_URL: "https://authentik.test",
      AUTHENTIK_REMOTE_AUTHORIZATION: "yes-please",
      MCP_TRANSPORT: "http",
      AUTHENTIK_TOKEN: "env-token",
    });

    expect(() => loadConfig()).toThrow(/AUTHENTIK_REMOTE_AUTHORIZATION/);
  });
});

describe("remote authorization over HTTP", () => {
  const servers: Array<() => Promise<void>> = [];

  afterEach(async () => {
    for (const cleanup of servers) {
      await cleanup();
    }
    servers.length = 0;
  });

  // Records the token each session was built with, so a test can assert which
  // credential the caller ended up using.
  async function startTestServer(
    configOverrides: Partial<AppConfig>,
  ): Promise<{ port: number; tokens: Array<string | undefined> }> {
    const client = makeMockClient();
    const config = makeConfig({
      transport: "http",
      httpPort: 0,
      httpHost: "127.0.0.1",
      ...configOverrides,
    });
    const tokens: Array<string | undefined> = [];

    const factory = (requestToken?: string) => {
      tokens.push(
        config.remoteAuthorization
          ? (requestToken ?? config.token)
          : config.token,
      );
      const s = createServer();
      registerAllTools(s, client, config);
      return s;
    };

    const httpServer = await startServer(createServer(), config, factory);
    if (!httpServer) {
      throw new Error("startServer did not return an http.Server");
    }
    servers.push(
      () =>
        new Promise<void>((resolve, reject) => {
          httpServer.closeAllConnections();
          httpServer.close((err) => (err ? reject(err) : resolve()));
        }),
    );

    const address = httpServer.address();
    if (typeof address !== "object" || address === null) {
      throw new Error("http.Server is not bound to a TCP port");
    }
    return { port: address.port, tokens };
  }

  it("uses the caller's bearer token for the session", async () => {
    const { port, tokens } = await startTestServer({
      remoteAuthorization: true,
      token: undefined,
    });

    const res = await postInitialize(port, "Bearer caller-token");
    expect(res.status).toBe(200);
    expect(tokens).toEqual(["caller-token"]);
  });

  it("accepts a bare token without the Bearer prefix", async () => {
    const { port, tokens } = await startTestServer({
      remoteAuthorization: true,
      token: undefined,
    });

    const res = await postInitialize(port, "caller-token");
    expect(res.status).toBe(200);
    expect(tokens).toEqual(["caller-token"]);
  });

  it("keeps sessions on separate tokens", async () => {
    const { port, tokens } = await startTestServer({
      remoteAuthorization: true,
      token: undefined,
    });

    await postInitialize(port, "Bearer alice-token");
    await postInitialize(port, "Bearer bob-token");
    expect(tokens).toEqual(["alice-token", "bob-token"]);
  });

  it("answers 401 when the header is missing", async () => {
    const { port, tokens } = await startTestServer({
      remoteAuthorization: true,
      token: undefined,
    });

    const res = await postInitialize(port);
    expect(res.status).toBe(401);
    expect(res.headers["www-authenticate"]).toBe("Bearer");
    expect(tokens).toEqual([]);
  });

  it("ignores the header when remote authorization is off", async () => {
    const { port, tokens } = await startTestServer({
      remoteAuthorization: false,
      token: "env-token",
    });

    const res = await postInitialize(port, "Bearer caller-token");
    expect(res.status).toBe(200);
    expect(tokens).toEqual(["env-token"]);
  });
});
