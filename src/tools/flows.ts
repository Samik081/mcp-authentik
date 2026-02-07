import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { AuthentikClient } from '../core/client.js';
import type { AppConfig } from '../types/index.js';
import { registerTool } from '../core/tools.js';

export function registerFlowTools(
  server: McpServer,
  client: AuthentikClient,
  config: AppConfig,
): void {
  // ── Flow instance CRUD ──────────────────────────────────────────────

  // 1. List flows
  registerTool(server, config, {
    name: 'authentik_flows_list',
    description: 'List flows with optional filters for search, designation, and ordering.',
    accessTier: 'read-only',
    category: 'flows',
    inputSchema: {
      search: z.string().optional().describe('Search across flow fields'),
      designation: z.enum([
        'authentication', 'authorization', 'invalidation',
        'enrollment', 'unenrollment', 'recovery', 'stage_configuration',
      ]).optional().describe('Filter by flow designation'),
      ordering: z.string().optional().describe('Field to order by (prefix with - for descending)'),
      page: z.number().optional().describe('Page number'),
      page_size: z.number().optional().describe('Number of results per page'),
    },
    handler: async (args) => {
      const result = await client.flowsApi.flowsInstancesList({
        search: args.search as string | undefined,
        designation: args.designation as any,
        ordering: args.ordering as string | undefined,
        page: args.page as number | undefined,
        pageSize: args.page_size as number | undefined,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 2. Get flow
  registerTool(server, config, {
    name: 'authentik_flows_get',
    description: 'Get a single flow by its slug.',
    accessTier: 'read-only',
    category: 'flows',
    inputSchema: {
      slug: z.string().describe('Flow slug'),
    },
    handler: async (args) => {
      const result = await client.flowsApi.flowsInstancesRetrieve({
        slug: args.slug as string,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 3. Create flow
  registerTool(server, config, {
    name: 'authentik_flows_create',
    description: 'Create a new flow with name, slug, title, and designation.',
    accessTier: 'full',
    category: 'flows',
    inputSchema: {
      name: z.string().describe('Flow display name (required)'),
      slug: z.string().describe('Flow slug for URLs (required)'),
      title: z.string().describe('Flow title shown to users (required)'),
      designation: z.enum([
        'authentication', 'authorization', 'invalidation',
        'enrollment', 'unenrollment', 'recovery', 'stage_configuration',
      ]).describe('Flow designation (required)'),
      policy_engine_mode: z.enum(['all', 'any']).optional().describe('Policy engine mode'),
      compatibility_mode: z.boolean().optional().describe('Enable compatibility mode for older browsers'),
      layout: z.enum([
        'stacked', 'content_left', 'content_right', 'sidebar_left', 'sidebar_right',
      ]).optional().describe('Flow layout'),
      denied_action: z.enum([
        'message_continue', 'message', 'continue',
      ]).optional().describe('Action when access is denied'),
    },
    handler: async (args) => {
      const result = await client.flowsApi.flowsInstancesCreate({
        flowRequest: {
          name: args.name as string,
          slug: args.slug as string,
          title: args.title as string,
          designation: args.designation as any,
          policyEngineMode: args.policy_engine_mode as any,
          compatibilityMode: args.compatibility_mode as boolean | undefined,
          layout: args.layout as any,
          deniedAction: args.denied_action as any,
        },
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 4. Update flow
  registerTool(server, config, {
    name: 'authentik_flows_update',
    description: 'Update an existing flow. Only provided fields are modified (partial update).',
    accessTier: 'full',
    category: 'flows',
    inputSchema: {
      slug: z.string().describe('Flow slug (required, used as identifier)'),
      name: z.string().optional().describe('New display name'),
      title: z.string().optional().describe('New title'),
      designation: z.enum([
        'authentication', 'authorization', 'invalidation',
        'enrollment', 'unenrollment', 'recovery', 'stage_configuration',
      ]).optional().describe('New designation'),
      policy_engine_mode: z.enum(['all', 'any']).optional().describe('Policy engine mode'),
      compatibility_mode: z.boolean().optional().describe('Enable compatibility mode'),
      layout: z.enum([
        'stacked', 'content_left', 'content_right', 'sidebar_left', 'sidebar_right',
      ]).optional().describe('Flow layout'),
      denied_action: z.enum([
        'message_continue', 'message', 'continue',
      ]).optional().describe('Action when access is denied'),
    },
    handler: async (args) => {
      const result = await client.flowsApi.flowsInstancesPartialUpdate({
        slug: args.slug as string,
        patchedFlowRequest: {
          name: args.name as string | undefined,
          title: args.title as string | undefined,
          designation: args.designation as any,
          policyEngineMode: args.policy_engine_mode as any,
          compatibilityMode: args.compatibility_mode as boolean | undefined,
          layout: args.layout as any,
          deniedAction: args.denied_action as any,
        },
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 5. Delete flow
  registerTool(server, config, {
    name: 'authentik_flows_delete',
    description: 'Delete a flow by its slug. This action is irreversible.',
    accessTier: 'full',
    category: 'flows',
    tags: ['destructive'],
    inputSchema: {
      slug: z.string().describe('Flow slug to delete'),
    },
    handler: async (args) => {
      await client.flowsApi.flowsInstancesDestroy({ slug: args.slug as string });
      return `Flow "${args.slug}" deleted successfully.`;
    },
  });

  // ── Flow special operations ─────────────────────────────────────────

  // 6. Flow diagram
  registerTool(server, config, {
    name: 'authentik_flows_diagram',
    description: 'Get a visual diagram of a flow showing its stages and bindings.',
    accessTier: 'read-only',
    category: 'flows',
    inputSchema: {
      slug: z.string().describe('Flow slug'),
    },
    handler: async (args) => {
      const result = await client.flowsApi.flowsInstancesDiagramRetrieve({
        slug: args.slug as string,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 7. Export flow
  registerTool(server, config, {
    name: 'authentik_flows_export',
    description: 'Export a flow as YAML. Returns the YAML content as text.',
    accessTier: 'read-only',
    category: 'flows',
    inputSchema: {
      slug: z.string().describe('Flow slug to export'),
    },
    handler: async (args) => {
      const blob = await client.flowsApi.flowsInstancesExportRetrieve({
        slug: args.slug as string,
      });
      const text = await blob.text();
      return text;
    },
  });

  // 8. Import flow
  registerTool(server, config, {
    name: 'authentik_flows_import',
    description: 'Import a flow from YAML content.',
    accessTier: 'full',
    category: 'flows',
    inputSchema: {
      content: z.string().describe('YAML flow definition content'),
      clear: z.boolean().optional().describe('Clear existing flow objects before import'),
    },
    handler: async (args) => {
      const result = await client.flowsApi.flowsInstancesImportCreate({
        file: new Blob([args.content as string]),
        clear: args.clear as boolean | undefined,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 9. Flow cache info
  registerTool(server, config, {
    name: 'authentik_flows_cache_info',
    description: 'Get information about cached flows.',
    accessTier: 'read-only',
    category: 'flows',
    handler: async () => {
      const result = await client.flowsApi.flowsInstancesCacheInfoRetrieve();
      return JSON.stringify(result, null, 2);
    },
  });

  // 10. Clear flow cache
  registerTool(server, config, {
    name: 'authentik_flows_cache_clear',
    description: 'Clear the flow cache.',
    accessTier: 'full',
    category: 'flows',
    handler: async () => {
      await client.flowsApi.flowsInstancesCacheClearCreate();
      return 'Flow cache cleared successfully.';
    },
  });

  // ── Flow stage bindings CRUD ────────────────────────────────────────

  // 11. List flow stage bindings
  registerTool(server, config, {
    name: 'authentik_flows_bindings_list',
    description: 'List flow stage bindings with optional filters.',
    accessTier: 'read-only',
    category: 'flows',
    inputSchema: {
      target: z.string().optional().describe('Filter by target flow slug'),
      stage: z.string().optional().describe('Filter by stage UUID'),
      search: z.string().optional().describe('Search across binding fields'),
      ordering: z.string().optional().describe('Field to order by'),
      page: z.number().optional().describe('Page number'),
      page_size: z.number().optional().describe('Number of results per page'),
    },
    handler: async (args) => {
      const result = await client.flowsApi.flowsBindingsList({
        target: args.target as string | undefined,
        stage: args.stage as string | undefined,
        search: args.search as string | undefined,
        ordering: args.ordering as string | undefined,
        page: args.page as number | undefined,
        pageSize: args.page_size as number | undefined,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 12. Get flow stage binding
  registerTool(server, config, {
    name: 'authentik_flows_bindings_get',
    description: 'Get a single flow stage binding by its UUID.',
    accessTier: 'read-only',
    category: 'flows',
    inputSchema: {
      fsb_uuid: z.string().describe('Flow stage binding UUID'),
    },
    handler: async (args) => {
      const result = await client.flowsApi.flowsBindingsRetrieve({
        fsbUuid: args.fsb_uuid as string,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 13. Create flow stage binding
  registerTool(server, config, {
    name: 'authentik_flows_bindings_create',
    description: 'Create a new flow stage binding to attach a stage to a flow.',
    accessTier: 'full',
    category: 'flows',
    inputSchema: {
      target: z.string().describe('Target flow UUID (required)'),
      stage: z.string().describe('Stage UUID to bind (required)'),
      order: z.number().describe('Binding order (required)'),
      evaluate_on_plan: z.boolean().optional().describe('Evaluate policies during plan phase'),
      re_evaluate_policies: z.boolean().optional().describe('Re-evaluate policies on each request'),
      policy_engine_mode: z.enum(['all', 'any']).optional().describe('Policy engine mode'),
      invalid_response_action: z.enum(['retry', 'restart', 'skip']).optional().describe('Action on invalid response'),
    },
    handler: async (args) => {
      const result = await client.flowsApi.flowsBindingsCreate({
        flowStageBindingRequest: {
          target: args.target as string,
          stage: args.stage as string,
          order: args.order as number,
          evaluateOnPlan: args.evaluate_on_plan as boolean | undefined,
          reEvaluatePolicies: args.re_evaluate_policies as boolean | undefined,
          policyEngineMode: args.policy_engine_mode as any,
          invalidResponseAction: args.invalid_response_action as any,
        },
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 14. Update flow stage binding
  registerTool(server, config, {
    name: 'authentik_flows_bindings_update',
    description: 'Update an existing flow stage binding. Only provided fields are modified.',
    accessTier: 'full',
    category: 'flows',
    inputSchema: {
      fsb_uuid: z.string().describe('Flow stage binding UUID (required)'),
      target: z.string().optional().describe('New target flow UUID'),
      stage: z.string().optional().describe('New stage UUID'),
      order: z.number().optional().describe('New binding order'),
      evaluate_on_plan: z.boolean().optional().describe('Evaluate policies during plan phase'),
      re_evaluate_policies: z.boolean().optional().describe('Re-evaluate policies on each request'),
      policy_engine_mode: z.enum(['all', 'any']).optional().describe('Policy engine mode'),
      invalid_response_action: z.enum(['retry', 'restart', 'skip']).optional().describe('Action on invalid response'),
    },
    handler: async (args) => {
      const result = await client.flowsApi.flowsBindingsPartialUpdate({
        fsbUuid: args.fsb_uuid as string,
        patchedFlowStageBindingRequest: {
          target: args.target as string | undefined,
          stage: args.stage as string | undefined,
          order: args.order as number | undefined,
          evaluateOnPlan: args.evaluate_on_plan as boolean | undefined,
          reEvaluatePolicies: args.re_evaluate_policies as boolean | undefined,
          policyEngineMode: args.policy_engine_mode as any,
          invalidResponseAction: args.invalid_response_action as any,
        },
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 15. Delete flow stage binding
  registerTool(server, config, {
    name: 'authentik_flows_bindings_delete',
    description: 'Delete a flow stage binding by its UUID. This action is irreversible.',
    accessTier: 'full',
    category: 'flows',
    tags: ['destructive'],
    inputSchema: {
      fsb_uuid: z.string().describe('Flow stage binding UUID to delete'),
    },
    handler: async (args) => {
      await client.flowsApi.flowsBindingsDestroy({ fsbUuid: args.fsb_uuid as string });
      return `Flow stage binding ${args.fsb_uuid} deleted successfully.`;
    },
  });
}
