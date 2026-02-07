import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { AuthentikClient } from '../core/client.js';
import type { AppConfig } from '../types/index.js';
import { registerTool } from '../core/tools.js';

// ── Per-type stage lookup maps ──────────────────────────────────────────

const STAGE_TYPES = [
  'authenticator_duo', 'authenticator_email', 'authenticator_endpoint_gdtc',
  'authenticator_sms', 'authenticator_static', 'authenticator_totp',
  'authenticator_validate', 'authenticator_webauthn',
  'captcha', 'consent', 'deny', 'dummy', 'email', 'identification',
  'invitation', 'mtls', 'password', 'prompt', 'redirect', 'source',
  'user_delete', 'user_login', 'user_logout', 'user_write',
] as const;

type StageType = typeof STAGE_TYPES[number];

/** Maps stage_type → SDK method prefix (e.g., stagesAuthenticatorDuoList) */
const STAGE_TYPE_SDK_PREFIX: Record<StageType, string> = {
  authenticator_duo: 'AuthenticatorDuo',
  authenticator_email: 'AuthenticatorEmail',
  authenticator_endpoint_gdtc: 'AuthenticatorEndpointGdtc',
  authenticator_sms: 'AuthenticatorSms',
  authenticator_static: 'AuthenticatorStatic',
  authenticator_totp: 'AuthenticatorTotp',
  authenticator_validate: 'AuthenticatorValidate',
  authenticator_webauthn: 'AuthenticatorWebauthn',
  captcha: 'Captcha',
  consent: 'Consent',
  deny: 'Deny',
  dummy: 'Dummy',
  email: 'Email',
  identification: 'Identification',
  invitation: 'InvitationStages',
  mtls: 'Mtls',
  password: 'Password',
  prompt: 'PromptStages',
  redirect: 'Redirect',
  source: 'Source',
  user_delete: 'UserDelete',
  user_login: 'UserLogin',
  user_logout: 'UserLogout',
  user_write: 'UserWrite',
};

/** Maps stage_type → request body key for create (e.g., { authenticatorDuoStageRequest: ... }) */
const STAGE_TYPE_REQUEST_KEY: Record<StageType, string> = {
  authenticator_duo: 'authenticatorDuoStageRequest',
  authenticator_email: 'authenticatorEmailStageRequest',
  authenticator_endpoint_gdtc: 'authenticatorEndpointGDTCStageRequest',
  authenticator_sms: 'authenticatorSMSStageRequest',
  authenticator_static: 'authenticatorStaticStageRequest',
  authenticator_totp: 'authenticatorTOTPStageRequest',
  authenticator_validate: 'authenticatorValidateStageRequest',
  authenticator_webauthn: 'authenticatorWebAuthnStageRequest',
  captcha: 'captchaStageRequest',
  consent: 'consentStageRequest',
  deny: 'denyStageRequest',
  dummy: 'dummyStageRequest',
  email: 'emailStageRequest',
  identification: 'identificationStageRequest',
  invitation: 'invitationStageRequest',
  mtls: 'mutualTLSStageRequest',
  password: 'passwordStageRequest',
  prompt: 'promptStageRequest',
  redirect: 'redirectStageRequest',
  source: 'sourceStageRequest',
  user_delete: 'userDeleteStageRequest',
  user_login: 'userLoginStageRequest',
  user_logout: 'userLogoutStageRequest',
  user_write: 'userWriteStageRequest',
};

/** Maps stage_type → patched request body key for update */
const STAGE_TYPE_PATCHED_KEY: Record<StageType, string> = {
  authenticator_duo: 'patchedAuthenticatorDuoStageRequest',
  authenticator_email: 'patchedAuthenticatorEmailStageRequest',
  authenticator_endpoint_gdtc: 'patchedAuthenticatorEndpointGDTCStageRequest',
  authenticator_sms: 'patchedAuthenticatorSMSStageRequest',
  authenticator_static: 'patchedAuthenticatorStaticStageRequest',
  authenticator_totp: 'patchedAuthenticatorTOTPStageRequest',
  authenticator_validate: 'patchedAuthenticatorValidateStageRequest',
  authenticator_webauthn: 'patchedAuthenticatorWebAuthnStageRequest',
  captcha: 'patchedCaptchaStageRequest',
  consent: 'patchedConsentStageRequest',
  deny: 'patchedDenyStageRequest',
  dummy: 'patchedDummyStageRequest',
  email: 'patchedEmailStageRequest',
  identification: 'patchedIdentificationStageRequest',
  invitation: 'patchedInvitationStageRequest',
  mtls: 'patchedMutualTLSStageRequest',
  password: 'patchedPasswordStageRequest',
  prompt: 'patchedPromptStageRequest',
  redirect: 'patchedRedirectStageRequest',
  source: 'patchedSourceStageRequest',
  user_delete: 'patchedUserDeleteStageRequest',
  user_login: 'patchedUserLoginStageRequest',
  user_logout: 'patchedUserLogoutStageRequest',
  user_write: 'patchedUserWriteStageRequest',
};

const stageTypeEnum = z.enum(STAGE_TYPES);

export function registerStageTools(
  server: McpServer,
  client: AuthentikClient,
  config: AppConfig,
): void {
  // ── Cross-type stage operations ─────────────────────────────────────

  // 1. List all stages (cross-type)
  registerTool(server, config, {
    name: 'authentik_stages_list',
    description: 'List all stages across all types with optional filters.',
    accessTier: 'read-only',
    category: 'stages',
    inputSchema: {
      name: z.string().optional().describe('Filter by exact stage name'),
      search: z.string().optional().describe('Search across stage fields'),
      ordering: z.string().optional().describe('Field to order by'),
      page: z.number().optional().describe('Page number'),
      page_size: z.number().optional().describe('Number of results per page'),
    },
    handler: async (args) => {
      const result = await client.stagesApi.stagesAllList({
        name: args.name as string | undefined,
        search: args.search as string | undefined,
        ordering: args.ordering as string | undefined,
        page: args.page as number | undefined,
        pageSize: args.page_size as number | undefined,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 2. Get stage (cross-type)
  registerTool(server, config, {
    name: 'authentik_stages_get',
    description: 'Get a single stage by its UUID (cross-type).',
    accessTier: 'read-only',
    category: 'stages',
    inputSchema: {
      stage_uuid: z.string().describe('Stage UUID'),
    },
    handler: async (args) => {
      const result = await client.stagesApi.stagesAllRetrieve({
        stageUuid: args.stage_uuid as string,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 3. Delete stage (cross-type)
  registerTool(server, config, {
    name: 'authentik_stages_delete',
    description: 'Delete a stage by its UUID (cross-type). This action is irreversible.',
    accessTier: 'full',
    category: 'stages',
    tags: ['destructive'],
    inputSchema: {
      stage_uuid: z.string().describe('Stage UUID to delete'),
    },
    handler: async (args) => {
      await client.stagesApi.stagesAllDestroy({ stageUuid: args.stage_uuid as string });
      return `Stage ${args.stage_uuid} deleted successfully.`;
    },
  });

  // 4. List stage types
  registerTool(server, config, {
    name: 'authentik_stages_types_list',
    description: 'List all available stage types.',
    accessTier: 'read-only',
    category: 'stages',
    handler: async () => {
      const result = await client.stagesApi.stagesAllTypesList();
      return JSON.stringify(result, null, 2);
    },
  });

  // ── Per-type stage dispatchers ──────────────────────────────────────

  // 5. List stages by type
  registerTool(server, config, {
    name: 'authentik_stages_by_type_list',
    description: 'List stages of a specific type with optional filters.',
    accessTier: 'read-only',
    category: 'stages',
    inputSchema: {
      stage_type: stageTypeEnum.describe('Stage type to list'),
      name: z.string().optional().describe('Filter by exact stage name'),
      ordering: z.string().optional().describe('Field to order by'),
      page: z.number().optional().describe('Page number'),
      page_size: z.number().optional().describe('Number of results per page'),
    },
    handler: async (args) => {
      const stageType = args.stage_type as StageType;
      const prefix = STAGE_TYPE_SDK_PREFIX[stageType];
      const method = `stages${prefix}List`;
      const result = await (client.stagesApi as any)[method]({
        name: args.name as string | undefined,
        ordering: args.ordering as string | undefined,
        page: args.page as number | undefined,
        pageSize: args.page_size as number | undefined,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 6. Get stage by type
  registerTool(server, config, {
    name: 'authentik_stages_by_type_get',
    description: 'Get a single stage of a specific type by its UUID.',
    accessTier: 'read-only',
    category: 'stages',
    inputSchema: {
      stage_type: stageTypeEnum.describe('Stage type'),
      stage_uuid: z.string().describe('Stage UUID'),
    },
    handler: async (args) => {
      const stageType = args.stage_type as StageType;
      const prefix = STAGE_TYPE_SDK_PREFIX[stageType];
      const method = `stages${prefix}Retrieve`;
      const result = await (client.stagesApi as any)[method]({
        stageUuid: args.stage_uuid as string,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 7. Create stage by type
  registerTool(server, config, {
    name: 'authentik_stages_by_type_create',
    description: 'Create a new stage of a specific type. Pass type-specific fields in the config object.',
    accessTier: 'full',
    category: 'stages',
    inputSchema: {
      stage_type: stageTypeEnum.describe('Stage type to create'),
      name: z.string().describe('Stage name (required)'),
      config: z.record(z.unknown()).optional().describe('Type-specific configuration fields (camelCase keys matching the SDK request type)'),
    },
    handler: async (args) => {
      const stageType = args.stage_type as StageType;
      const prefix = STAGE_TYPE_SDK_PREFIX[stageType];
      const method = `stages${prefix}Create`;
      const reqKey = STAGE_TYPE_REQUEST_KEY[stageType];
      const configObj = (args.config as Record<string, unknown>) ?? {};
      const result = await (client.stagesApi as any)[method]({
        [reqKey]: { name: args.name as string, ...configObj },
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 8. Update stage by type
  registerTool(server, config, {
    name: 'authentik_stages_by_type_update',
    description: 'Update an existing stage of a specific type. Pass type-specific fields in the config object.',
    accessTier: 'full',
    category: 'stages',
    inputSchema: {
      stage_type: stageTypeEnum.describe('Stage type'),
      stage_uuid: z.string().describe('Stage UUID (required)'),
      config: z.record(z.unknown()).optional().describe('Type-specific fields to update (camelCase keys matching the SDK patched request type)'),
    },
    handler: async (args) => {
      const stageType = args.stage_type as StageType;
      const prefix = STAGE_TYPE_SDK_PREFIX[stageType];
      const method = `stages${prefix}PartialUpdate`;
      const patchedKey = STAGE_TYPE_PATCHED_KEY[stageType];
      const configObj = (args.config as Record<string, unknown>) ?? {};
      const result = await (client.stagesApi as any)[method]({
        stageUuid: args.stage_uuid as string,
        [patchedKey]: { ...configObj },
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 9. Delete stage by type
  registerTool(server, config, {
    name: 'authentik_stages_by_type_delete',
    description: 'Delete a stage of a specific type by its UUID. This action is irreversible.',
    accessTier: 'full',
    category: 'stages',
    tags: ['destructive'],
    inputSchema: {
      stage_type: stageTypeEnum.describe('Stage type'),
      stage_uuid: z.string().describe('Stage UUID to delete'),
    },
    handler: async (args) => {
      const stageType = args.stage_type as StageType;
      const prefix = STAGE_TYPE_SDK_PREFIX[stageType];
      const method = `stages${prefix}Destroy`;
      await (client.stagesApi as any)[method]({
        stageUuid: args.stage_uuid as string,
      });
      return `Stage ${args.stage_uuid} (type: ${stageType}) deleted successfully.`;
    },
  });

  // ── Invitations CRUD ────────────────────────────────────────────────

  // 10. List invitations
  registerTool(server, config, {
    name: 'authentik_invitations_list',
    description: 'List invitations with optional filters.',
    accessTier: 'read-only',
    category: 'stages',
    inputSchema: {
      name: z.string().optional().describe('Filter by invitation name'),
      created_by_username: z.string().optional().describe('Filter by creator username'),
      flow_slug: z.string().optional().describe('Filter by flow slug'),
      search: z.string().optional().describe('Search across invitation fields'),
      ordering: z.string().optional().describe('Field to order by'),
      page: z.number().optional().describe('Page number'),
      page_size: z.number().optional().describe('Number of results per page'),
    },
    handler: async (args) => {
      const result = await client.stagesApi.stagesInvitationInvitationsList({
        name: args.name as string | undefined,
        createdByUsername: args.created_by_username as string | undefined,
        flowSlug: args.flow_slug as string | undefined,
        search: args.search as string | undefined,
        ordering: args.ordering as string | undefined,
        page: args.page as number | undefined,
        pageSize: args.page_size as number | undefined,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 11. Get invitation
  registerTool(server, config, {
    name: 'authentik_invitations_get',
    description: 'Get a single invitation by its UUID.',
    accessTier: 'read-only',
    category: 'stages',
    inputSchema: {
      invite_uuid: z.string().describe('Invitation UUID'),
    },
    handler: async (args) => {
      const result = await client.stagesApi.stagesInvitationInvitationsRetrieve({
        inviteUuid: args.invite_uuid as string,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 12. Create invitation
  registerTool(server, config, {
    name: 'authentik_invitations_create',
    description: 'Create a new invitation.',
    accessTier: 'full',
    category: 'stages',
    inputSchema: {
      name: z.string().describe('Invitation name (required)'),
      expires: z.string().optional().describe('Expiry date (ISO 8601 format)'),
      fixed_data: z.record(z.unknown()).optional().describe('Fixed data to pass to the flow context'),
      single_use: z.boolean().optional().describe('Whether the invitation can only be used once'),
      flow: z.string().optional().describe('Flow slug to use for this invitation'),
    },
    handler: async (args) => {
      const result = await client.stagesApi.stagesInvitationInvitationsCreate({
        invitationRequest: {
          name: args.name as string,
          expires: args.expires ? new Date(args.expires as string) : undefined,
          fixedData: args.fixed_data as Record<string, unknown> | undefined,
          singleUse: args.single_use as boolean | undefined,
          flow: args.flow as string | undefined,
        } as any,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 13. Update invitation
  registerTool(server, config, {
    name: 'authentik_invitations_update',
    description: 'Update an existing invitation. Only provided fields are modified.',
    accessTier: 'full',
    category: 'stages',
    inputSchema: {
      invite_uuid: z.string().describe('Invitation UUID (required)'),
      name: z.string().optional().describe('New invitation name'),
      expires: z.string().optional().describe('New expiry date (ISO 8601 format)'),
      fixed_data: z.record(z.unknown()).optional().describe('New fixed data'),
      single_use: z.boolean().optional().describe('Whether the invitation can only be used once'),
      flow: z.string().optional().describe('New flow slug'),
    },
    handler: async (args) => {
      const result = await client.stagesApi.stagesInvitationInvitationsPartialUpdate({
        inviteUuid: args.invite_uuid as string,
        patchedInvitationRequest: {
          name: args.name as string | undefined,
          expires: args.expires ? new Date(args.expires as string) : undefined,
          fixedData: args.fixed_data as Record<string, unknown> | undefined,
          singleUse: args.single_use as boolean | undefined,
          flow: args.flow as string | undefined,
        } as any,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 14. Delete invitation
  registerTool(server, config, {
    name: 'authentik_invitations_delete',
    description: 'Delete an invitation by its UUID. This action is irreversible.',
    accessTier: 'full',
    category: 'stages',
    tags: ['destructive'],
    inputSchema: {
      invite_uuid: z.string().describe('Invitation UUID to delete'),
    },
    handler: async (args) => {
      await client.stagesApi.stagesInvitationInvitationsDestroy({
        inviteUuid: args.invite_uuid as string,
      });
      return `Invitation ${args.invite_uuid} deleted successfully.`;
    },
  });

  // ── Prompts CRUD ────────────────────────────────────────────────────

  // 15. List prompts
  registerTool(server, config, {
    name: 'authentik_prompts_list',
    description: 'List prompt field definitions with optional filters.',
    accessTier: 'read-only',
    category: 'stages',
    inputSchema: {
      field_key: z.string().optional().describe('Filter by field key'),
      label: z.string().optional().describe('Filter by label'),
      name: z.string().optional().describe('Filter by name'),
      search: z.string().optional().describe('Search across prompt fields'),
      ordering: z.string().optional().describe('Field to order by'),
      page: z.number().optional().describe('Page number'),
      page_size: z.number().optional().describe('Number of results per page'),
    },
    handler: async (args) => {
      const result = await client.stagesApi.stagesPromptPromptsList({
        fieldKey: args.field_key as string | undefined,
        label: args.label as string | undefined,
        name: args.name as string | undefined,
        search: args.search as string | undefined,
        ordering: args.ordering as string | undefined,
        page: args.page as number | undefined,
        pageSize: args.page_size as number | undefined,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 16. Get prompt
  registerTool(server, config, {
    name: 'authentik_prompts_get',
    description: 'Get a single prompt field definition by its UUID.',
    accessTier: 'read-only',
    category: 'stages',
    inputSchema: {
      prompt_uuid: z.string().describe('Prompt UUID'),
    },
    handler: async (args) => {
      const result = await client.stagesApi.stagesPromptPromptsRetrieve({
        promptUuid: args.prompt_uuid as string,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 17. Create prompt
  registerTool(server, config, {
    name: 'authentik_prompts_create',
    description: 'Create a new prompt field definition.',
    accessTier: 'full',
    category: 'stages',
    inputSchema: {
      name: z.string().describe('Prompt name (required)'),
      field_key: z.string().describe('Field key for form data (required)'),
      label: z.string().describe('Display label (required)'),
      type: z.string().describe('Prompt type (e.g., text, email, password, number, checkbox, radio-button-group, dropdown, etc.) (required)'),
      required: z.boolean().optional().describe('Whether the field is required'),
      placeholder: z.string().optional().describe('Placeholder text'),
      initial_value: z.string().optional().describe('Initial value'),
      order: z.number().optional().describe('Display order'),
      placeholder_expression: z.boolean().optional().describe('Whether the placeholder is a Python expression'),
      initial_value_expression: z.boolean().optional().describe('Whether the initial value is a Python expression'),
      sub_text: z.string().optional().describe('Help text below the field'),
    },
    handler: async (args) => {
      const result = await client.stagesApi.stagesPromptPromptsCreate({
        promptRequest: {
          name: args.name as string,
          fieldKey: args.field_key as string,
          label: args.label as string,
          type: args.type as any,
          required: args.required as boolean | undefined,
          placeholder: args.placeholder as string | undefined,
          initialValue: args.initial_value as string | undefined,
          order: args.order as number | undefined,
          placeholderExpression: args.placeholder_expression as boolean | undefined,
          initialValueExpression: args.initial_value_expression as boolean | undefined,
          subText: args.sub_text as string | undefined,
        } as any,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 18. Update prompt
  registerTool(server, config, {
    name: 'authentik_prompts_update',
    description: 'Update an existing prompt field definition. Only provided fields are modified.',
    accessTier: 'full',
    category: 'stages',
    inputSchema: {
      prompt_uuid: z.string().describe('Prompt UUID (required)'),
      name: z.string().optional().describe('New prompt name'),
      field_key: z.string().optional().describe('New field key'),
      label: z.string().optional().describe('New display label'),
      type: z.string().optional().describe('New prompt type'),
      required: z.boolean().optional().describe('Whether the field is required'),
      placeholder: z.string().optional().describe('New placeholder text'),
      initial_value: z.string().optional().describe('New initial value'),
      order: z.number().optional().describe('New display order'),
      placeholder_expression: z.boolean().optional().describe('Whether the placeholder is a Python expression'),
      initial_value_expression: z.boolean().optional().describe('Whether the initial value is a Python expression'),
      sub_text: z.string().optional().describe('New help text'),
    },
    handler: async (args) => {
      const result = await client.stagesApi.stagesPromptPromptsPartialUpdate({
        promptUuid: args.prompt_uuid as string,
        patchedPromptRequest: {
          name: args.name as string | undefined,
          fieldKey: args.field_key as string | undefined,
          label: args.label as string | undefined,
          type: args.type as any,
          required: args.required as boolean | undefined,
          placeholder: args.placeholder as string | undefined,
          initialValue: args.initial_value as string | undefined,
          order: args.order as number | undefined,
          placeholderExpression: args.placeholder_expression as boolean | undefined,
          initialValueExpression: args.initial_value_expression as boolean | undefined,
          subText: args.sub_text as string | undefined,
        } as any,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 19. Delete prompt
  registerTool(server, config, {
    name: 'authentik_prompts_delete',
    description: 'Delete a prompt field definition by its UUID. This action is irreversible.',
    accessTier: 'full',
    category: 'stages',
    tags: ['destructive'],
    inputSchema: {
      prompt_uuid: z.string().describe('Prompt UUID to delete'),
    },
    handler: async (args) => {
      await client.stagesApi.stagesPromptPromptsDestroy({
        promptUuid: args.prompt_uuid as string,
      });
      return `Prompt ${args.prompt_uuid} deleted successfully.`;
    },
  });
}
