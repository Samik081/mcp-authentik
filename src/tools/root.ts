import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { AuthentikClient } from "../core/client.js";
import { registerTool } from "../core/tools.js";
import type { AppConfig } from "../types/index.js";

export function registerRootTools(
  server: McpServer,
  client: AuthentikClient,
  config: AppConfig,
): void {
  // 1. Get root configuration
  registerTool(server, config, {
    name: "authentik_root_config",
    title: "Get Root Configuration",
    description:
      "Get root configuration including capabilities, error reporting settings, and UI configuration.",
    accessTier: "read-only",
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
    },
    category: "root",
    handler: async () => {
      const result = await client.rootApi.rootConfigRetrieve();
      return JSON.stringify(result, null, 2);
    },
  });
}
