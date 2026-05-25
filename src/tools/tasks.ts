import type {
  TaskAggregatedStatusEnum,
  TaskStatusEnum,
} from "@goauthentik/api";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { AuthentikClient } from "../core/client.js";
import { registerTool } from "../core/tools.js";
import type { AppConfig } from "../types/index.js";

export function registerTaskTools(
  server: McpServer,
  client: AuthentikClient,
  config: AppConfig,
): void {
  // 1. List tasks
  registerTool(server, config, {
    name: "authentik_tasks_list",
    title: "List Tasks",
    description:
      "List background tasks with optional filters by actor name, queue, state, or search.",
    accessTier: "read-only",
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
    },
    category: "events",
    inputSchema: {
      actor_name: z.string().optional().describe("Filter by actor (task) name"),
      queue_name: z.string().optional().describe("Filter by queue name"),
      state: z
        .enum([
          "queued",
          "consumed",
          "preprocess",
          "running",
          "postprocess",
          "rejected",
          "done",
        ])
        .optional()
        .describe("Filter by task state"),
      aggregated_status: z
        .array(
          z.enum([
            "queued",
            "consumed",
            "preprocess",
            "running",
            "postprocess",
            "rejected",
            "done",
            "info",
            "warning",
            "error",
          ]),
        )
        .optional()
        .describe(
          "Filter by aggregated outcome status (e.g. error, warning, info). Use to find failed/errored tasks.",
        ),
      search: z.string().optional().describe("Search across task fields"),
      ordering: z
        .string()
        .optional()
        .describe("Field to order by (prefix with - for descending)"),
      page: z.number().optional().describe("Page number"),
      page_size: z.number().optional().describe("Number of results per page"),
    },
    handler: async (args) => {
      const result = await client.tasksApi.tasksTasksList({
        actorName: args.actor_name as string | undefined,
        queueName: args.queue_name as string | undefined,
        state: args.state as TaskStatusEnum | undefined,
        aggregatedStatus: args.aggregated_status as
          | TaskAggregatedStatusEnum[]
          | undefined,
        search: args.search as string | undefined,
        ordering: args.ordering as string | undefined,
        page: args.page as number | undefined,
        pageSize: args.page_size as number | undefined,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 2. Get task
  registerTool(server, config, {
    name: "authentik_tasks_get",
    title: "Get Task",
    description: "Get details of a specific task by its message ID.",
    accessTier: "read-only",
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
    },
    category: "events",
    inputSchema: {
      message_id: z.string().describe("Task message ID"),
    },
    handler: async (args) => {
      const result = await client.tasksApi.tasksTasksRetrieve({
        messageId: args.message_id as string,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 3. Retry task
  registerTool(server, config, {
    name: "authentik_tasks_retry",
    title: "Retry Task",
    description: "Retry a failed task by its message ID.",
    accessTier: "full",
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
    },
    category: "events",
    inputSchema: {
      message_id: z.string().describe("Task message ID to retry"),
    },
    handler: async (args) => {
      await client.tasksApi.tasksTasksRetryCreate({
        messageId: args.message_id as string,
      });
      return `Task ${args.message_id} retry triggered successfully.`;
    },
  });
}
