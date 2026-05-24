import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { AuthentikClient } from "../core/client.js";
import { registerTool } from "../core/tools.js";
import type { AppConfig } from "../types/index.js";

export function registerOauth2Tools(
  server: McpServer,
  client: AuthentikClient,
  config: AppConfig,
): void {
  // ── Access Tokens ──

  // 1. List OAuth2 access tokens
  registerTool(server, config, {
    name: "authentik_oauth2_access_tokens_list",
    title: "List OAuth2 Access Tokens",
    description:
      "List OAuth2 access tokens with optional filters. Tokens are system-managed.",
    accessTier: "read-only",
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
    },
    category: "oauth2",
    inputSchema: {
      user: z.number().optional().describe("Filter by user ID"),
      provider: z.number().optional().describe("Filter by provider ID"),
      search: z.string().optional().describe("Search across fields"),
      ordering: z.string().optional().describe("Field to order by"),
      page: z.number().optional().describe("Page number"),
      page_size: z.number().optional().describe("Number of results per page"),
    },
    handler: async (args) => {
      const result = await client.oauth2Api.oauth2AccessTokensList({
        user: args.user as number | undefined,
        provider: args.provider as number | undefined,
        search: args.search as string | undefined,
        ordering: args.ordering as string | undefined,
        page: args.page as number | undefined,
        pageSize: args.page_size as number | undefined,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 2. Get OAuth2 access token
  registerTool(server, config, {
    name: "authentik_oauth2_access_tokens_get",
    title: "Get OAuth2 Access Token",
    description: "Get a single OAuth2 access token by its numeric ID.",
    accessTier: "read-only",
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
    },
    category: "oauth2",
    inputSchema: {
      id: z.number().describe("Access token ID"),
    },
    handler: async (args) => {
      const result = await client.oauth2Api.oauth2AccessTokensRetrieve({
        id: args.id as number,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 3. Delete OAuth2 access token
  registerTool(server, config, {
    name: "authentik_oauth2_access_tokens_delete",
    title: "Delete OAuth2 Access Token",
    description:
      "Delete (revoke) an OAuth2 access token by its ID. This action is irreversible.",
    accessTier: "full",
    annotations: {
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: false,
    },
    category: "oauth2",
    inputSchema: {
      id: z.number().describe("Access token ID to delete"),
    },
    handler: async (args) => {
      await client.oauth2Api.oauth2AccessTokensDestroy({
        id: args.id as number,
      });
      return `OAuth2 access token ${args.id} deleted successfully.`;
    },
  });

  // ── Authorization Codes ──

  // 4. List OAuth2 authorization codes
  registerTool(server, config, {
    name: "authentik_oauth2_auth_codes_list",
    title: "List OAuth2 Authorization Codes",
    description:
      "List OAuth2 authorization codes with optional filters. Codes are system-managed.",
    accessTier: "read-only",
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
    },
    category: "oauth2",
    inputSchema: {
      user: z.number().optional().describe("Filter by user ID"),
      provider: z.number().optional().describe("Filter by provider ID"),
      search: z.string().optional().describe("Search across fields"),
      ordering: z.string().optional().describe("Field to order by"),
      page: z.number().optional().describe("Page number"),
      page_size: z.number().optional().describe("Number of results per page"),
    },
    handler: async (args) => {
      const result = await client.oauth2Api.oauth2AuthorizationCodesList({
        user: args.user as number | undefined,
        provider: args.provider as number | undefined,
        search: args.search as string | undefined,
        ordering: args.ordering as string | undefined,
        page: args.page as number | undefined,
        pageSize: args.page_size as number | undefined,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 5. Get OAuth2 authorization code
  registerTool(server, config, {
    name: "authentik_oauth2_auth_codes_get",
    title: "Get OAuth2 Authorization Code",
    description: "Get a single OAuth2 authorization code by its numeric ID.",
    accessTier: "read-only",
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
    },
    category: "oauth2",
    inputSchema: {
      id: z.number().describe("Authorization code ID"),
    },
    handler: async (args) => {
      const result = await client.oauth2Api.oauth2AuthorizationCodesRetrieve({
        id: args.id as number,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 6. Delete OAuth2 authorization code
  registerTool(server, config, {
    name: "authentik_oauth2_auth_codes_delete",
    title: "Delete OAuth2 Authorization Code",
    description:
      "Delete an OAuth2 authorization code by its ID. This action is irreversible.",
    accessTier: "full",
    annotations: {
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: false,
    },
    category: "oauth2",
    inputSchema: {
      id: z.number().describe("Authorization code ID to delete"),
    },
    handler: async (args) => {
      await client.oauth2Api.oauth2AuthorizationCodesDestroy({
        id: args.id as number,
      });
      return `OAuth2 authorization code ${args.id} deleted successfully.`;
    },
  });

  // ── Refresh Tokens ──

  // 7. List OAuth2 refresh tokens
  registerTool(server, config, {
    name: "authentik_oauth2_refresh_tokens_list",
    title: "List OAuth2 Refresh Tokens",
    description:
      "List OAuth2 refresh tokens with optional filters. Tokens are system-managed.",
    accessTier: "read-only",
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
    },
    category: "oauth2",
    inputSchema: {
      user: z.number().optional().describe("Filter by user ID"),
      provider: z.number().optional().describe("Filter by provider ID"),
      search: z.string().optional().describe("Search across fields"),
      ordering: z.string().optional().describe("Field to order by"),
      page: z.number().optional().describe("Page number"),
      page_size: z.number().optional().describe("Number of results per page"),
    },
    handler: async (args) => {
      const result = await client.oauth2Api.oauth2RefreshTokensList({
        user: args.user as number | undefined,
        provider: args.provider as number | undefined,
        search: args.search as string | undefined,
        ordering: args.ordering as string | undefined,
        page: args.page as number | undefined,
        pageSize: args.page_size as number | undefined,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 8. Get OAuth2 refresh token
  registerTool(server, config, {
    name: "authentik_oauth2_refresh_tokens_get",
    title: "Get OAuth2 Refresh Token",
    description: "Get a single OAuth2 refresh token by its numeric ID.",
    accessTier: "read-only",
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
    },
    category: "oauth2",
    inputSchema: {
      id: z.number().describe("Refresh token ID"),
    },
    handler: async (args) => {
      const result = await client.oauth2Api.oauth2RefreshTokensRetrieve({
        id: args.id as number,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 9. Delete OAuth2 refresh token
  registerTool(server, config, {
    name: "authentik_oauth2_refresh_tokens_delete",
    title: "Delete OAuth2 Refresh Token",
    description:
      "Delete (revoke) an OAuth2 refresh token by its ID. This action is irreversible.",
    accessTier: "full",
    annotations: {
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: false,
    },
    category: "oauth2",
    inputSchema: {
      id: z.number().describe("Refresh token ID to delete"),
    },
    handler: async (args) => {
      await client.oauth2Api.oauth2RefreshTokensDestroy({
        id: args.id as number,
      });
      return `OAuth2 refresh token ${args.id} deleted successfully.`;
    },
  });

  // ── OAuth2 Providers ──

  // Allowed OAuth2 grant types (matches SDK GrantTypesEnum). As of 2026.5
  // grant types are individually configurable per provider.
  const GRANT_TYPES = [
    "authorization_code",
    "implicit",
    "hybrid",
    "refresh_token",
    "client_credentials",
    "password",
    "urn:ietf:params:oauth:grant-type:device_code",
  ] as const;

  // 10. Create OAuth2 provider
  registerTool(server, config, {
    name: "authentik_oauth2_provider_create",
    title: "Create OAuth2 Provider",
    description:
      "Create a new OAuth2/OpenID provider. Grant types are individually configurable.",
    accessTier: "full",
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
    },
    category: "oauth2",
    inputSchema: {
      name: z.string().describe("Provider name (required)"),
      authorization_flow: z
        .string()
        .describe("Authorization flow UUID, used when authorizing (required)"),
      invalidation_flow: z
        .string()
        .describe("Invalidation flow UUID, used ending the session (required)"),
      redirect_uris: z
        .array(
          z.object({
            matching_mode: z
              .enum(["strict", "regex"])
              .describe("How the URL is matched"),
            url: z.string().describe("Redirect URI"),
          }),
        )
        .describe("Allowed redirect URIs (required)"),
      grant_types: z
        .array(z.enum(GRANT_TYPES))
        .optional()
        .describe(
          "OAuth2 grant types to enable for this provider (individually configurable as of 2026.5)",
        ),
      client_type: z
        .enum(["confidential", "public"])
        .optional()
        .describe("OAuth2 client type"),
      client_id: z.string().optional().describe("Client ID"),
      client_secret: z.string().optional().describe("Client secret"),
      signing_key: z
        .string()
        .optional()
        .describe("Keypair UUID used to sign tokens"),
      property_mappings: z
        .array(z.string())
        .optional()
        .describe("Property mapping (scope) UUIDs"),
    },
    handler: async (args) => {
      const redirectUris = (
        (args.redirect_uris as
          | Array<{ matching_mode: string; url: string }>
          | undefined) ?? []
      ).map((r) => ({
        matchingMode: r.matching_mode as any,
        url: r.url,
      }));
      const result = await client.providersApi.providersOauth2Create({
        oAuth2ProviderRequest: {
          name: args.name as string,
          authorizationFlow: args.authorization_flow as string,
          invalidationFlow: args.invalidation_flow as string,
          redirectUris,
          grantTypes: args.grant_types as any,
          clientType: args.client_type as any,
          clientId: args.client_id as string | undefined,
          clientSecret: args.client_secret as string | undefined,
          signingKey: args.signing_key as string | undefined,
          propertyMappings: args.property_mappings as string[] | undefined,
        },
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 11. Update OAuth2 provider
  registerTool(server, config, {
    name: "authentik_oauth2_provider_update",
    title: "Update OAuth2 Provider",
    description:
      "Update an existing OAuth2/OpenID provider. Only provided fields are modified (partial update). Grant types are individually configurable.",
    accessTier: "full",
    annotations: {
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: true,
    },
    category: "oauth2",
    inputSchema: {
      id: z.number().describe("OAuth2 provider ID (required)"),
      name: z.string().optional().describe("Provider name"),
      authorization_flow: z
        .string()
        .optional()
        .describe("Authorization flow UUID, used when authorizing"),
      invalidation_flow: z
        .string()
        .optional()
        .describe("Invalidation flow UUID, used ending the session"),
      redirect_uris: z
        .array(
          z.object({
            matching_mode: z
              .enum(["strict", "regex"])
              .describe("How the URL is matched"),
            url: z.string().describe("Redirect URI"),
          }),
        )
        .optional()
        .describe("Allowed redirect URIs"),
      grant_types: z
        .array(z.enum(GRANT_TYPES))
        .optional()
        .describe(
          "OAuth2 grant types to enable for this provider (individually configurable as of 2026.5)",
        ),
      client_type: z
        .enum(["confidential", "public"])
        .optional()
        .describe("OAuth2 client type"),
      client_id: z.string().optional().describe("Client ID"),
      client_secret: z.string().optional().describe("Client secret"),
      signing_key: z
        .string()
        .optional()
        .describe("Keypair UUID used to sign tokens"),
      property_mappings: z
        .array(z.string())
        .optional()
        .describe("Property mapping (scope) UUIDs"),
    },
    handler: async (args) => {
      const rawRedirects = args.redirect_uris as
        | Array<{ matching_mode: string; url: string }>
        | undefined;
      const redirectUris = rawRedirects?.map((r) => ({
        matchingMode: r.matching_mode as any,
        url: r.url,
      }));
      const result = await client.providersApi.providersOauth2PartialUpdate({
        id: args.id as number,
        patchedOAuth2ProviderRequest: {
          name: args.name as string | undefined,
          authorizationFlow: args.authorization_flow as string | undefined,
          invalidationFlow: args.invalidation_flow as string | undefined,
          redirectUris,
          grantTypes: args.grant_types as any,
          clientType: args.client_type as any,
          clientId: args.client_id as string | undefined,
          clientSecret: args.client_secret as string | undefined,
          signingKey: args.signing_key as string | undefined,
          propertyMappings: args.property_mappings as string[] | undefined,
        },
      });
      return JSON.stringify(result, null, 2);
    },
  });
}
