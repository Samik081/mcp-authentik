import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { AuthentikClient } from "../core/client.js";
import { registerTool } from "../core/tools.js";
import type { AppConfig } from "../types/index.js";

export function registerReportTools(
  server: McpServer,
  client: AuthentikClient,
  config: AppConfig,
): void {
  // 1. List data exports
  registerTool(server, config, {
    name: "authentik_reports_export_list",
    title: "List Report Exports",
    description:
      "List data exports with optional search and ordering. Each export records who requested it, when, the content type, and whether the file is ready for download.",
    accessTier: "read-only",
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
    },
    category: "reports",
    inputSchema: {
      search: z.string().optional().describe("Search across export fields"),
      ordering: z
        .string()
        .optional()
        .describe("Field to order by (prefix with - for descending)"),
      page: z.number().optional().describe("Page number"),
      page_size: z.number().optional().describe("Number of results per page"),
    },
    handler: async (args) => {
      const result = await client.reportsApi.reportsExportsList({
        search: args.search as string | undefined,
        ordering: args.ordering as string | undefined,
        page: args.page as number | undefined,
        pageSize: args.page_size as number | undefined,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 2. Get data export
  registerTool(server, config, {
    name: "authentik_reports_export_get",
    title: "Get Report Export",
    description:
      "Retrieve a single data export by its ID, including its content type, query parameters, file URL, and completion status.",
    accessTier: "read-only",
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
    },
    category: "reports",
    inputSchema: {
      id: z.string().describe("Data export ID"),
    },
    handler: async (args) => {
      const result = await client.reportsApi.reportsExportsRetrieve({
        id: args.id as string,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 3. Delete data export
  registerTool(server, config, {
    name: "authentik_reports_export_delete",
    title: "Delete Report Export",
    description: "Delete a data export by its ID. This action is irreversible.",
    accessTier: "full",
    annotations: {
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: false,
    },
    category: "reports",
    inputSchema: {
      id: z.string().describe("Data export ID to delete"),
    },
    handler: async (args) => {
      await client.reportsApi.reportsExportsDestroy({
        id: args.id as string,
      });
      return `Data export ${args.id} deleted successfully.`;
    },
  });
}
