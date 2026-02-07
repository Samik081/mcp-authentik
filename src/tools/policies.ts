import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { AuthentikClient } from '../core/client.js';
import type { AppConfig } from '../types/index.js';
import { registerTool } from '../core/tools.js';

// ── Per-type policy lookup maps ─────────────────────────────────────────

const POLICY_TYPES = [
  'dummy', 'event_matcher', 'expression', 'geoip',
  'password', 'password_expiry', 'reputation', 'unique_password',
] as const;

type PolicyType = typeof POLICY_TYPES[number];

/** Maps policy_type -> SDK method prefix (e.g., policiesDummyList) */
const POLICY_TYPE_SDK_PREFIX: Record<PolicyType, string> = {
  dummy: 'Dummy',
  event_matcher: 'EventMatcher',
  expression: 'Expression',
  geoip: 'Geoip',
  password: 'Password',
  password_expiry: 'PasswordExpiry',
  reputation: 'Reputation',
  unique_password: 'UniquePassword',
};

/** Maps policy_type -> request body key for create */
const POLICY_TYPE_REQUEST_KEY: Record<PolicyType, string> = {
  dummy: 'dummyPolicyRequest',
  event_matcher: 'eventMatcherPolicyRequest',
  expression: 'expressionPolicyRequest',
  geoip: 'geoIPPolicyRequest',
  password: 'passwordPolicyRequest',
  password_expiry: 'passwordExpiryPolicyRequest',
  reputation: 'reputationPolicyRequest',
  unique_password: 'uniquePasswordPolicyRequest',
};

/** Maps policy_type -> patched request body key for update */
const POLICY_TYPE_PATCHED_KEY: Record<PolicyType, string> = {
  dummy: 'patchedDummyPolicyRequest',
  event_matcher: 'patchedEventMatcherPolicyRequest',
  expression: 'patchedExpressionPolicyRequest',
  geoip: 'patchedGeoIPPolicyRequest',
  password: 'patchedPasswordPolicyRequest',
  password_expiry: 'patchedPasswordExpiryPolicyRequest',
  reputation: 'patchedReputationPolicyRequest',
  unique_password: 'patchedUniquePasswordPolicyRequest',
};

const policyTypeEnum = z.enum(POLICY_TYPES);

export function registerPolicyTools(
  server: McpServer,
  client: AuthentikClient,
  config: AppConfig,
): void {
  // ── Cross-type policy operations ────────────────────────────────────

  // 1. List all policies (cross-type)
  registerTool(server, config, {
    name: 'authentik_policies_list',
    description: 'List all policies across all types with optional filters.',
    accessTier: 'read-only',
    category: 'policies',
    inputSchema: {
      search: z.string().optional().describe('Search across policy fields'),
      bindings_isnull: z.boolean().optional().describe('Filter by whether bindings exist'),
      ordering: z.string().optional().describe('Field to order by'),
      page: z.number().optional().describe('Page number'),
      page_size: z.number().optional().describe('Number of results per page'),
    },
    handler: async (args) => {
      const result = await client.policiesApi.policiesAllList({
        search: args.search as string | undefined,
        bindingsIsnull: args.bindings_isnull as boolean | undefined,
        ordering: args.ordering as string | undefined,
        page: args.page as number | undefined,
        pageSize: args.page_size as number | undefined,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 2. Get policy (cross-type)
  registerTool(server, config, {
    name: 'authentik_policies_get',
    description: 'Get a single policy by its UUID (cross-type).',
    accessTier: 'read-only',
    category: 'policies',
    inputSchema: {
      policy_uuid: z.string().describe('Policy UUID'),
    },
    handler: async (args) => {
      const result = await client.policiesApi.policiesAllRetrieve({
        policyUuid: args.policy_uuid as string,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 3. Delete policy (cross-type)
  registerTool(server, config, {
    name: 'authentik_policies_delete',
    description: 'Delete a policy by its UUID (cross-type). This action is irreversible.',
    accessTier: 'full',
    category: 'policies',
    tags: ['destructive'],
    inputSchema: {
      policy_uuid: z.string().describe('Policy UUID to delete'),
    },
    handler: async (args) => {
      await client.policiesApi.policiesAllDestroy({ policyUuid: args.policy_uuid as string });
      return `Policy ${args.policy_uuid} deleted successfully.`;
    },
  });

  // 4. List policy types
  registerTool(server, config, {
    name: 'authentik_policies_types_list',
    description: 'List all available policy types.',
    accessTier: 'read-only',
    category: 'policies',
    handler: async () => {
      const result = await client.policiesApi.policiesAllTypesList();
      return JSON.stringify(result, null, 2);
    },
  });

  // 5. Test policy
  registerTool(server, config, {
    name: 'authentik_policies_test',
    description: 'Test a policy against a specific user to see if it passes or fails.',
    accessTier: 'read-only',
    category: 'policies',
    inputSchema: {
      policy_uuid: z.string().describe('Policy UUID to test'),
      user: z.number().describe('User ID to test the policy against (required)'),
      context: z.record(z.unknown()).optional().describe('Additional context for the policy test'),
    },
    handler: async (args) => {
      const result = await client.policiesApi.policiesAllTestCreate({
        policyUuid: args.policy_uuid as string,
        policyTestRequest: {
          user: args.user as number,
          context: args.context as Record<string, unknown> | undefined,
        } as any,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 6. Policy cache info
  registerTool(server, config, {
    name: 'authentik_policies_cache_info',
    description: 'Get information about cached policies.',
    accessTier: 'read-only',
    category: 'policies',
    handler: async () => {
      const result = await client.policiesApi.policiesAllCacheInfoRetrieve();
      return JSON.stringify(result, null, 2);
    },
  });

  // 7. Clear policy cache
  registerTool(server, config, {
    name: 'authentik_policies_cache_clear',
    description: 'Clear the policy cache.',
    accessTier: 'full',
    category: 'policies',
    handler: async () => {
      await client.policiesApi.policiesAllCacheClearCreate();
      return 'Policy cache cleared successfully.';
    },
  });

  // ── Per-type policy dispatchers ─────────────────────────────────────

  // 8. List policies by type
  registerTool(server, config, {
    name: 'authentik_policies_by_type_list',
    description: 'List policies of a specific type with optional filters.',
    accessTier: 'read-only',
    category: 'policies',
    inputSchema: {
      policy_type: policyTypeEnum.describe('Policy type to list'),
      name: z.string().optional().describe('Filter by policy name'),
      ordering: z.string().optional().describe('Field to order by'),
      page: z.number().optional().describe('Page number'),
      page_size: z.number().optional().describe('Number of results per page'),
    },
    handler: async (args) => {
      const policyType = args.policy_type as PolicyType;
      const prefix = POLICY_TYPE_SDK_PREFIX[policyType];
      const method = `policies${prefix}List`;
      const result = await (client.policiesApi as any)[method]({
        name: args.name as string | undefined,
        ordering: args.ordering as string | undefined,
        page: args.page as number | undefined,
        pageSize: args.page_size as number | undefined,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 9. Get policy by type
  registerTool(server, config, {
    name: 'authentik_policies_by_type_get',
    description: 'Get a single policy of a specific type by its UUID.',
    accessTier: 'read-only',
    category: 'policies',
    inputSchema: {
      policy_type: policyTypeEnum.describe('Policy type'),
      policy_uuid: z.string().describe('Policy UUID'),
    },
    handler: async (args) => {
      const policyType = args.policy_type as PolicyType;
      const prefix = POLICY_TYPE_SDK_PREFIX[policyType];
      const method = `policies${prefix}Retrieve`;
      const result = await (client.policiesApi as any)[method]({
        policyUuid: args.policy_uuid as string,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 10. Create policy by type
  registerTool(server, config, {
    name: 'authentik_policies_by_type_create',
    description: 'Create a new policy of a specific type. Pass type-specific fields in the config object.',
    accessTier: 'full',
    category: 'policies',
    inputSchema: {
      policy_type: policyTypeEnum.describe('Policy type to create'),
      name: z.string().describe('Policy name (required)'),
      config: z.record(z.unknown()).optional().describe('Type-specific configuration fields (camelCase keys matching the SDK request type)'),
    },
    handler: async (args) => {
      const policyType = args.policy_type as PolicyType;
      const prefix = POLICY_TYPE_SDK_PREFIX[policyType];
      const method = `policies${prefix}Create`;
      const reqKey = POLICY_TYPE_REQUEST_KEY[policyType];
      const configObj = (args.config as Record<string, unknown>) ?? {};
      const result = await (client.policiesApi as any)[method]({
        [reqKey]: { name: args.name as string, ...configObj },
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 11. Update policy by type
  registerTool(server, config, {
    name: 'authentik_policies_by_type_update',
    description: 'Update an existing policy of a specific type. Pass type-specific fields in the config object.',
    accessTier: 'full',
    category: 'policies',
    inputSchema: {
      policy_type: policyTypeEnum.describe('Policy type'),
      policy_uuid: z.string().describe('Policy UUID (required)'),
      config: z.record(z.unknown()).optional().describe('Type-specific fields to update (camelCase keys matching the SDK patched request type)'),
    },
    handler: async (args) => {
      const policyType = args.policy_type as PolicyType;
      const prefix = POLICY_TYPE_SDK_PREFIX[policyType];
      const method = `policies${prefix}PartialUpdate`;
      const patchedKey = POLICY_TYPE_PATCHED_KEY[policyType];
      const configObj = (args.config as Record<string, unknown>) ?? {};
      const result = await (client.policiesApi as any)[method]({
        policyUuid: args.policy_uuid as string,
        [patchedKey]: { ...configObj },
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 12. Delete policy by type
  registerTool(server, config, {
    name: 'authentik_policies_by_type_delete',
    description: 'Delete a policy of a specific type by its UUID. This action is irreversible.',
    accessTier: 'full',
    category: 'policies',
    tags: ['destructive'],
    inputSchema: {
      policy_type: policyTypeEnum.describe('Policy type'),
      policy_uuid: z.string().describe('Policy UUID to delete'),
    },
    handler: async (args) => {
      const policyType = args.policy_type as PolicyType;
      const prefix = POLICY_TYPE_SDK_PREFIX[policyType];
      const method = `policies${prefix}Destroy`;
      await (client.policiesApi as any)[method]({
        policyUuid: args.policy_uuid as string,
      });
      return `Policy ${args.policy_uuid} (type: ${policyType}) deleted successfully.`;
    },
  });

  // ── Policy bindings CRUD ────────────────────────────────────────────

  // 13. List policy bindings
  registerTool(server, config, {
    name: 'authentik_policy_bindings_list',
    description: 'List policy bindings with optional filters.',
    accessTier: 'read-only',
    category: 'policies',
    inputSchema: {
      target: z.string().optional().describe('Filter by target UUID'),
      policy: z.string().optional().describe('Filter by policy UUID'),
      enabled: z.boolean().optional().describe('Filter by enabled status'),
      search: z.string().optional().describe('Search across binding fields'),
      ordering: z.string().optional().describe('Field to order by'),
      page: z.number().optional().describe('Page number'),
      page_size: z.number().optional().describe('Number of results per page'),
    },
    handler: async (args) => {
      const result = await client.policiesApi.policiesBindingsList({
        target: args.target as string | undefined,
        policy: args.policy as string | undefined,
        enabled: args.enabled as boolean | undefined,
        search: args.search as string | undefined,
        ordering: args.ordering as string | undefined,
        page: args.page as number | undefined,
        pageSize: args.page_size as number | undefined,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 14. Get policy binding
  registerTool(server, config, {
    name: 'authentik_policy_bindings_get',
    description: 'Get a single policy binding by its UUID.',
    accessTier: 'read-only',
    category: 'policies',
    inputSchema: {
      policy_binding_uuid: z.string().describe('Policy binding UUID'),
    },
    handler: async (args) => {
      const result = await client.policiesApi.policiesBindingsRetrieve({
        policyBindingUuid: args.policy_binding_uuid as string,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 15. Create policy binding
  registerTool(server, config, {
    name: 'authentik_policy_bindings_create',
    description: 'Create a new policy binding to attach a policy to a target (flow, stage, etc.).',
    accessTier: 'full',
    category: 'policies',
    inputSchema: {
      target: z.string().describe('Target UUID (flow, stage binding, etc.) (required)'),
      order: z.number().describe('Binding order (required)'),
      policy: z.string().optional().describe('Policy UUID to bind'),
      group: z.string().optional().describe('Group UUID to bind'),
      user: z.number().optional().describe('User ID to bind'),
      negate: z.boolean().optional().describe('Negate the policy result'),
      enabled: z.boolean().optional().describe('Whether the binding is enabled'),
      timeout: z.number().optional().describe('Policy timeout in seconds'),
      failure_result: z.boolean().optional().describe('Result when policy execution fails'),
    },
    handler: async (args) => {
      const result = await client.policiesApi.policiesBindingsCreate({
        policyBindingRequest: {
          target: args.target as string,
          order: args.order as number,
          policy: args.policy as string | undefined,
          group: args.group as string | undefined,
          user: args.user as number | undefined,
          negate: args.negate as boolean | undefined,
          enabled: args.enabled as boolean | undefined,
          timeout: args.timeout as number | undefined,
          failureResult: args.failure_result as boolean | undefined,
        } as any,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 16. Update policy binding
  registerTool(server, config, {
    name: 'authentik_policy_bindings_update',
    description: 'Update an existing policy binding. Only provided fields are modified.',
    accessTier: 'full',
    category: 'policies',
    inputSchema: {
      policy_binding_uuid: z.string().describe('Policy binding UUID (required)'),
      target: z.string().optional().describe('New target UUID'),
      order: z.number().optional().describe('New binding order'),
      policy: z.string().optional().describe('New policy UUID'),
      group: z.string().optional().describe('New group UUID'),
      user: z.number().optional().describe('New user ID'),
      negate: z.boolean().optional().describe('Negate the policy result'),
      enabled: z.boolean().optional().describe('Whether the binding is enabled'),
      timeout: z.number().optional().describe('Policy timeout in seconds'),
      failure_result: z.boolean().optional().describe('Result when policy execution fails'),
    },
    handler: async (args) => {
      const result = await client.policiesApi.policiesBindingsPartialUpdate({
        policyBindingUuid: args.policy_binding_uuid as string,
        patchedPolicyBindingRequest: {
          target: args.target as string | undefined,
          order: args.order as number | undefined,
          policy: args.policy as string | undefined,
          group: args.group as string | undefined,
          user: args.user as number | undefined,
          negate: args.negate as boolean | undefined,
          enabled: args.enabled as boolean | undefined,
          timeout: args.timeout as number | undefined,
          failureResult: args.failure_result as boolean | undefined,
        } as any,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 17. Delete policy binding
  registerTool(server, config, {
    name: 'authentik_policy_bindings_delete',
    description: 'Delete a policy binding by its UUID. This action is irreversible.',
    accessTier: 'full',
    category: 'policies',
    tags: ['destructive'],
    inputSchema: {
      policy_binding_uuid: z.string().describe('Policy binding UUID to delete'),
    },
    handler: async (args) => {
      await client.policiesApi.policiesBindingsDestroy({
        policyBindingUuid: args.policy_binding_uuid as string,
      });
      return `Policy binding ${args.policy_binding_uuid} deleted successfully.`;
    },
  });

  // ── Reputation scores ───────────────────────────────────────────────

  // 18. List reputation scores
  registerTool(server, config, {
    name: 'authentik_reputation_scores_list',
    description: 'List reputation scores with optional filters.',
    accessTier: 'read-only',
    category: 'policies',
    inputSchema: {
      identifier: z.string().optional().describe('Filter by identifier'),
      ip: z.string().optional().describe('Filter by IP address'),
      score: z.number().optional().describe('Filter by exact score'),
      search: z.string().optional().describe('Search across reputation fields'),
      ordering: z.string().optional().describe('Field to order by'),
      page: z.number().optional().describe('Page number'),
      page_size: z.number().optional().describe('Number of results per page'),
    },
    handler: async (args) => {
      const result = await client.policiesApi.policiesReputationScoresList({
        identifier: args.identifier as string | undefined,
        ip: args.ip as string | undefined,
        score: args.score as number | undefined,
        search: args.search as string | undefined,
        ordering: args.ordering as string | undefined,
        page: args.page as number | undefined,
        pageSize: args.page_size as number | undefined,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 19. Delete reputation score
  registerTool(server, config, {
    name: 'authentik_reputation_scores_delete',
    description: 'Delete a reputation score by its UUID. This action is irreversible.',
    accessTier: 'full',
    category: 'policies',
    tags: ['destructive'],
    inputSchema: {
      reputation_uuid: z.string().describe('Reputation score UUID to delete'),
    },
    handler: async (args) => {
      await client.policiesApi.policiesReputationScoresDestroy({
        reputationUuid: args.reputation_uuid as string,
      });
      return `Reputation score ${args.reputation_uuid} deleted successfully.`;
    },
  });
}
