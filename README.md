[![npm version](https://img.shields.io/npm/v/@samik081/mcp-authentik)](https://www.npmjs.com/package/@samik081/mcp-authentik)
[![Docker image](https://ghcr-badge.egpl.dev/samik081/mcp-authentik/latest_tag?trim=major&label=docker)](https://ghcr.io/samik081/mcp-authentik)
[![License: MIT](https://img.shields.io/npm/l/@samik081/mcp-authentik)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/node/v/@samik081/mcp-authentik)](https://nodejs.org)

# MCP Authentik

MCP server for [Authentik](https://goauthentik.io/) identity management. Manage users, groups, applications, flows, policies, providers, and more through natural language in Cursor, Claude Code, and Claude Desktop.

> **Disclaimer:** Most of this code has been AI-generated and has not been fully tested yet. I created this project for my own needs and plan to continue improving its quality, but it may be buggy in the early stages. If you find a bug, feel free to [open an issue](https://github.com/Samik081/mcp-authentik/issues) -- I'll try to work on it in my spare time.

## Features

- **245 tools** across **20 API categories** covering the complete Authentik API
- **Read-only mode** via `AUTHENTIK_ACCESS_TIER=read-only` for safe monitoring
- **Category filtering** via `AUTHENTIK_CATEGORIES` to expose only the tools you need
- **Type-safe SDK client** via `@goauthentik/api`
- **Docker images** for `linux/amd64` and `linux/arm64` on [GHCR](https://ghcr.io/samik081/mcp-authentik)
- **Remote MCP** via HTTP transport (`MCP_TRANSPORT=http`) using the Streamable HTTP protocol
- **TypeScript/ESM** with full type safety

## Quick Start

Run the server directly with npx:

```bash
AUTHENTIK_URL="https://auth.example.com" \
AUTHENTIK_TOKEN="your-api-token" \
npx -y @samik081/mcp-authentik
```

The server validates your Authentik connection on startup and fails immediately with a clear error if credentials are missing or invalid.

### Docker

Run with Docker (stdio transport, same as npx):

```bash
docker run --rm -i \
  -e AUTHENTIK_URL=https://auth.example.com \
  -e AUTHENTIK_TOKEN=your-api-token \
  ghcr.io/samik081/mcp-authentik
```

To run as a remote MCP server with HTTP transport:

```bash
docker run -d -p 3000:3000 \
  -e MCP_TRANSPORT=http \
  -e AUTHENTIK_URL=https://auth.example.com \
  -e AUTHENTIK_TOKEN=your-api-token \
  ghcr.io/samik081/mcp-authentik
```

The MCP endpoint is available at `http://localhost:3000/mcp` and a health check at `http://localhost:3000/health`.

## Configuration

**Claude Code CLI (recommended):**

```bash
# Using npx
claude mcp add --transport stdio authentik \
  --env AUTHENTIK_URL=https://auth.example.com \
  --env AUTHENTIK_TOKEN=your-api-token \
  -- npx -y @samik081/mcp-authentik

# Using Docker
claude mcp add --transport stdio authentik \
  --env AUTHENTIK_URL=https://auth.example.com \
  --env AUTHENTIK_TOKEN=your-api-token \
  -- docker run --rm -i ghcr.io/samik081/mcp-authentik
```

**JSON config** (works with Claude Code `.mcp.json`, Claude Desktop `claude_desktop_config.json`, Cursor `.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "authentik": {
      "command": "npx",
      "args": ["-y", "@samik081/mcp-authentik"],
      "env": {
        "AUTHENTIK_URL": "https://auth.example.com",
        "AUTHENTIK_TOKEN": "your-api-token"
      }
    }
  }
}
```

**Docker (stdio):**

```json
{
  "mcpServers": {
    "authentik": {
      "command": "docker",
      "args": ["run", "--rm", "-i",
        "-e", "AUTHENTIK_URL=https://auth.example.com",
        "-e", "AUTHENTIK_TOKEN=your-api-token",
        "ghcr.io/samik081/mcp-authentik"
      ]
    }
  }
}
```

**Remote MCP** (connect to a running Docker container or HTTP server):

```json
{
  "mcpServers": {
    "authentik": {
      "type": "streamable-http",
      "url": "http://localhost:3000/mcp"
    }
  }
}
```

## Access Tiers

Control which tools are available using the `AUTHENTIK_ACCESS_TIER` environment variable:

| Tier | Tools | Description |
|------|-------|-------------|
| `full` (default) | 245 | Read and write -- full control |
| `read-only` | 121 | Read only -- safe for monitoring, no state changes |

- **full**: All 245 tools. Includes creating, updating, and deleting users, groups, applications, flows, providers, and all other resources.
- **read-only**: 121 tools. Listing and viewing resources only. No state changes.

Tools that are not available in your tier are not registered with the MCP server. They will not appear in your AI tool's tool list, keeping the context clean.

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `AUTHENTIK_URL` | Yes | -- | Authentik instance URL (e.g., `https://auth.example.com`) |
| `AUTHENTIK_TOKEN` | Yes | -- | API token with appropriate permissions |
| `AUTHENTIK_ACCESS_TIER` | No | `full` | `read-only` for read-only tools only, `full` for all tools |
| `AUTHENTIK_CATEGORIES` | No | *(all)* | Comma-separated category allowlist (e.g., `core,admin,flows`) |
| `MCP_TRANSPORT` | No | `stdio` | Transport mode: `stdio` (default) or `http` |
| `MCP_PORT` | No | `3000` | HTTP server port (only used when `MCP_TRANSPORT=http`) |
| `MCP_HOST` | No | `0.0.0.0` | HTTP server bind address (only used when `MCP_TRANSPORT=http`) |

### Available Categories

`admin`, `authenticators`, `core`, `crypto`, `enterprise`, `events`, `flows`, `managed`, `oauth2`, `outposts`, `policies`, `property-mappings`, `providers`, `rac`, `rbac`, `root`, `sources`, `ssf`, `stages`, `tenants`

## Tools

<details>
<summary>Admin (8 tools)</summary>

| Tool | Description | Access |
|------|-------------|--------|
| `authentik_admin_system_info` | Get system information including HTTP host, runtime environment, server time, and embedded outpost status | read-only |
| `authentik_admin_version` | Get Authentik version information including current version and build hash | read-only |
| `authentik_admin_settings_get` | Get current system settings | read-only |
| `authentik_admin_settings_update` | Update system settings (partial update) | full |
| `authentik_admin_apps` | List installed Django applications in the Authentik instance | read-only |
| `authentik_admin_models` | List all data models available in the Authentik instance | read-only |
| `authentik_admin_version_history` | List Authentik version history entries | read-only |
| `authentik_admin_system_task_trigger` | Trigger all system tasks (e.g., cleanup, cache clear) | full |

</details>

<details>
<summary>Authenticators (5 tools)</summary>

| Tool | Description | Access |
|------|-------------|--------|
| `authentik_authenticators_list` | List all authenticator devices across all types for the current user | read-only |
| `authentik_authenticators_admin_by_type_list` | List authenticator devices of a specific type (admin view) | read-only |
| `authentik_authenticators_admin_by_type_get` | Get a single authenticator device by type and ID (admin view) | read-only |
| `authentik_authenticators_admin_by_type_delete` | Delete an authenticator device by type and ID (admin view) | full |
| `authentik_authenticators_user_by_type_list` | List authenticator devices of a specific type for the current user | read-only |

</details>

<details>
<summary>Core (44 tools)</summary>

**Users**

| Tool | Description | Access |
|------|-------------|--------|
| `authentik_users_list` | List users with optional filters for username, email, name, active status, superuser status, path, groups, and search | read-only |
| `authentik_users_get` | Get a single user by their numeric ID | read-only |
| `authentik_users_create` | Create a new user | full |
| `authentik_users_update` | Update an existing user (partial update) | full |
| `authentik_users_delete` | Delete a user by their numeric ID | full |
| `authentik_users_me` | Get information about the currently authenticated user | read-only |
| `authentik_users_set_password` | Set a new password for a user | full |
| `authentik_users_create_service_account` | Create a new service account user with an optional associated group and token | full |
| `authentik_users_generate_recovery_link` | Generate a temporary recovery link for a user to regain account access | full |
| `authentik_users_send_recovery_email` | Send a recovery email to a user using a specified email stage | full |
| `authentik_users_list_paths` | List all user paths configured in the system | read-only |

**Groups**

| Tool | Description | Access |
|------|-------------|--------|
| `authentik_groups_list` | List groups with optional filters for name, superuser status, members, and search | read-only |
| `authentik_groups_get` | Get a single group by its UUID | read-only |
| `authentik_groups_create` | Create a new group with optional parent, superuser status, users, and custom attributes | full |
| `authentik_groups_update` | Update an existing group (partial update) | full |
| `authentik_groups_delete` | Delete a group by its UUID | full |
| `authentik_groups_add_user` | Add a user to a group by group UUID and user ID | full |
| `authentik_groups_remove_user` | Remove a user from a group by group UUID and user ID | full |

**Applications**

| Tool | Description | Access |
|------|-------------|--------|
| `authentik_apps_list` | List applications with optional filters for name, slug, group, search, and more | read-only |
| `authentik_apps_get` | Get a single application by its slug | read-only |
| `authentik_apps_create` | Create a new application with name, slug, and optional provider, group, and metadata | full |
| `authentik_apps_update` | Update an existing application (partial update) | full |
| `authentik_apps_set_icon_url` | Set an application icon from a URL, or clear it | full |
| `authentik_apps_delete` | Delete an application by its slug | full |
| `authentik_apps_check_access` | Check whether a specific user has access to an application | read-only |
| `authentik_apps_update_transactional` | Create or update an application and its provider in a single atomic transaction | full |
| `authentik_app_entitlements_list` | List application entitlements with optional filters | read-only |
| `authentik_app_entitlements_get` | Get a single application entitlement by its UUID | read-only |
| `authentik_app_entitlements_create` | Create a new application entitlement | full |
| `authentik_app_entitlements_update` | Update an existing application entitlement (partial update) | full |
| `authentik_app_entitlements_delete` | Delete an application entitlement by its UUID | full |

**Tokens**

| Tool | Description | Access |
|------|-------------|--------|
| `authentik_tokens_list` | List tokens with optional filters for identifier, intent, managed status, and search | read-only |
| `authentik_tokens_get` | Get a single token by its identifier | read-only |
| `authentik_tokens_create` | Create a new token with an identifier, optional intent, description, and expiration settings | full |
| `authentik_tokens_update` | Update an existing token (partial update) | full |
| `authentik_tokens_delete` | Delete a token by its identifier | full |
| `authentik_tokens_view_key` | View the raw key value of a token (privileged, logged) | full |
| `authentik_tokens_set_key` | Set a custom key value for a token | full |

**Brands**

| Tool | Description | Access |
|------|-------------|--------|
| `authentik_brands_list` | List brands with optional filters for UUID, domain, and search | read-only |
| `authentik_brands_get` | Get a single brand by its UUID | read-only |
| `authentik_brands_create` | Create a new brand with domain, branding settings, flow assignments, and optional attributes | full |
| `authentik_brands_update` | Update an existing brand (partial update) | full |
| `authentik_brands_delete` | Delete a brand by its UUID | full |
| `authentik_brands_current` | Get the brand configuration for the current domain | read-only |

</details>

<details>
<summary>Crypto (8 tools)</summary>

| Tool | Description | Access |
|------|-------------|--------|
| `authentik_crypto_list` | List certificate keypairs with optional filters | read-only |
| `authentik_crypto_get` | Get a single certificate keypair by its UUID | read-only |
| `authentik_crypto_create` | Create a new certificate keypair from PEM-encoded certificate and optional private key data | full |
| `authentik_crypto_update` | Update an existing certificate keypair (partial update) | full |
| `authentik_crypto_delete` | Delete a certificate keypair by its UUID | full |
| `authentik_crypto_generate` | Generate a new self-signed certificate keypair | full |
| `authentik_crypto_view_certificate` | View the PEM-encoded certificate data for a keypair | read-only |
| `authentik_crypto_view_private_key` | View the PEM-encoded private key data for a keypair (sensitive) | full |

</details>

<details>
<summary>Enterprise (8 tools)</summary>

| Tool | Description | Access |
|------|-------------|--------|
| `authentik_enterprise_license_list` | List enterprise licenses with optional filters | read-only |
| `authentik_enterprise_license_get` | Get a single enterprise license by its UUID | read-only |
| `authentik_enterprise_license_create` | Install a new enterprise license key | full |
| `authentik_enterprise_license_update` | Update an existing enterprise license (partial update) | full |
| `authentik_enterprise_license_delete` | Delete an enterprise license by its UUID | full |
| `authentik_enterprise_license_summary` | Get the total enterprise license status summary | read-only |
| `authentik_enterprise_license_forecast` | Forecast how many users will be required in a year based on current growth | read-only |
| `authentik_enterprise_install_id` | Get the authentik installation ID (used for license generation) | read-only |

</details>

<details>
<summary>Events (24 tools)</summary>

**Events**

| Tool | Description | Access |
|------|-------------|--------|
| `authentik_events_list` | List audit events with optional filters for action, username, client IP, and more | read-only |
| `authentik_events_get` | Get a single audit event by its UUID | read-only |
| `authentik_events_create` | Create a new audit event | full |
| `authentik_events_actions_list` | List all available event action types | read-only |
| `authentik_events_top_per_user` | Get the top N events grouped by user count | read-only |
| `authentik_events_volume` | Get event volume data for specified filters and timeframe | read-only |
| `authentik_events_rules_list` | List notification rules with optional filters | read-only |
| `authentik_events_rules_get` | Get a single notification rule by its UUID | read-only |
| `authentik_events_rules_create` | Create a new notification rule | full |
| `authentik_events_rules_update` | Update an existing notification rule (partial update) | full |
| `authentik_events_rules_delete` | Delete a notification rule by its UUID | full |
| `authentik_events_transports_list` | List notification transports with optional filters | read-only |
| `authentik_events_transports_get` | Get a single notification transport by its UUID | read-only |
| `authentik_events_transports_create` | Create a new notification transport | full |
| `authentik_events_transports_update` | Update an existing notification transport (partial update) | full |
| `authentik_events_transports_delete` | Delete a notification transport by its UUID | full |
| `authentik_events_transports_test` | Send a test notification using the specified transport | full |
| `authentik_events_notifications_list` | List notifications for the current user with optional filters | read-only |
| `authentik_events_notifications_update` | Update a notification, typically to mark it as seen or unseen | full |
| `authentik_events_notifications_delete` | Delete a notification by its UUID | full |
| `authentik_events_notifications_mark_all_seen` | Mark all notifications as seen for the current user | full |

**System Tasks**

| Tool | Description | Access |
|------|-------------|--------|
| `authentik_tasks_list` | List system tasks with optional filters by name, status, or UID | read-only |
| `authentik_tasks_get` | Get details of a specific system task by UUID | read-only |
| `authentik_tasks_retry` | Retry a failed system task by UUID | full |

</details>

<details>
<summary>Flows (15 tools)</summary>

| Tool | Description | Access |
|------|-------------|--------|
| `authentik_flows_list` | List flows with optional filters for search, designation, and ordering | read-only |
| `authentik_flows_get` | Get a single flow by its slug | read-only |
| `authentik_flows_create` | Create a new flow with name, slug, title, and designation | full |
| `authentik_flows_update` | Update an existing flow (partial update) | full |
| `authentik_flows_delete` | Delete a flow by its slug | full |
| `authentik_flows_diagram` | Get a visual diagram of a flow showing its stages and bindings | read-only |
| `authentik_flows_export` | Export a flow as YAML | read-only |
| `authentik_flows_import` | Import a flow from YAML content | full |
| `authentik_flows_cache_info` | Get information about cached flows | read-only |
| `authentik_flows_cache_clear` | Clear the flow cache | full |
| `authentik_flows_bindings_list` | List flow stage bindings with optional filters | read-only |
| `authentik_flows_bindings_get` | Get a single flow stage binding by its UUID | read-only |
| `authentik_flows_bindings_create` | Create a new flow stage binding to attach a stage to a flow | full |
| `authentik_flows_bindings_update` | Update an existing flow stage binding | full |
| `authentik_flows_bindings_delete` | Delete a flow stage binding by its UUID | full |

</details>

<details>
<summary>Managed (7 tools)</summary>

| Tool | Description | Access |
|------|-------------|--------|
| `authentik_blueprints_list` | List managed blueprint instances with optional filters | read-only |
| `authentik_blueprints_get` | Get a single blueprint instance by its UUID | read-only |
| `authentik_blueprints_create` | Create a new managed blueprint instance | full |
| `authentik_blueprints_update` | Update an existing blueprint instance (partial update) | full |
| `authentik_blueprints_delete` | Delete a blueprint instance by its UUID | full |
| `authentik_blueprints_available` | List all available blueprint files that can be used to create blueprint instances | read-only |
| `authentik_blueprints_apply` | Apply a blueprint instance, executing its configuration | full |

</details>

<details>
<summary>OAuth2 (9 tools)</summary>

| Tool | Description | Access |
|------|-------------|--------|
| `authentik_oauth2_access_tokens_list` | List OAuth2 access tokens with optional filters | read-only |
| `authentik_oauth2_access_tokens_get` | Get a single OAuth2 access token by its numeric ID | read-only |
| `authentik_oauth2_access_tokens_delete` | Delete (revoke) an OAuth2 access token by its ID | full |
| `authentik_oauth2_auth_codes_list` | List OAuth2 authorization codes with optional filters | read-only |
| `authentik_oauth2_auth_codes_get` | Get a single OAuth2 authorization code by its numeric ID | read-only |
| `authentik_oauth2_auth_codes_delete` | Delete an OAuth2 authorization code by its ID | full |
| `authentik_oauth2_refresh_tokens_list` | List OAuth2 refresh tokens with optional filters | read-only |
| `authentik_oauth2_refresh_tokens_get` | Get a single OAuth2 refresh token by its numeric ID | read-only |
| `authentik_oauth2_refresh_tokens_delete` | Delete (revoke) an OAuth2 refresh token by its ID | full |

</details>

<details>
<summary>Outposts (15 tools)</summary>

| Tool | Description | Access |
|------|-------------|--------|
| `authentik_outposts_list` | List outpost instances with optional filters | read-only |
| `authentik_outposts_get` | Get a single outpost instance by its UUID | read-only |
| `authentik_outposts_create` | Create a new outpost instance | full |
| `authentik_outposts_update` | Update an existing outpost instance (partial update) | full |
| `authentik_outposts_delete` | Delete an outpost instance by its UUID | full |
| `authentik_outposts_health` | Get the current health status of an outpost | read-only |
| `authentik_outposts_default_settings` | Get the global default outpost configuration | read-only |
| `authentik_outposts_service_connections_list` | List all service connections (Docker and Kubernetes) with optional filters | read-only |
| `authentik_outposts_service_connections_state` | Get the current state of a service connection | read-only |
| `authentik_outposts_service_connections_types` | List all available service connection types | read-only |
| `authentik_outposts_docker_create` | Create a new Docker service connection | full |
| `authentik_outposts_docker_update` | Update an existing Docker service connection (partial update) | full |
| `authentik_outposts_kubernetes_create` | Create a new Kubernetes service connection | full |
| `authentik_outposts_kubernetes_update` | Update an existing Kubernetes service connection (partial update) | full |
| `authentik_outposts_service_connections_delete` | Delete a service connection by its UUID | full |

</details>

<details>
<summary>Policies (19 tools)</summary>

Policies use a type+config pattern. Cross-type tools operate on any policy, while per-type tools accept a `policy_type` parameter. Available types: `dummy`, `event_matcher`, `expression`, `geoip`, `password`, `password_expiry`, `reputation`, `unique_password`.

| Tool | Description | Access |
|------|-------------|--------|
| `authentik_policies_list` | List all policies across all types with optional filters | read-only |
| `authentik_policies_get` | Get a single policy by its UUID (cross-type) | read-only |
| `authentik_policies_delete` | Delete a policy by its UUID (cross-type) | full |
| `authentik_policies_types_list` | List all available policy types | read-only |
| `authentik_policies_test` | Test a policy against a specific user to see if it passes or fails | read-only |
| `authentik_policies_cache_info` | Get information about cached policies | read-only |
| `authentik_policies_cache_clear` | Clear the policy cache | full |
| `authentik_policies_by_type_list` | List policies of a specific type with optional filters | read-only |
| `authentik_policies_by_type_get` | Get a single policy of a specific type by its UUID | read-only |
| `authentik_policies_by_type_create` | Create a new policy of a specific type | full |
| `authentik_policies_by_type_update` | Update an existing policy of a specific type | full |
| `authentik_policies_by_type_delete` | Delete a policy of a specific type by its UUID | full |
| `authentik_policy_bindings_list` | List policy bindings with optional filters | read-only |
| `authentik_policy_bindings_get` | Get a single policy binding by its UUID | read-only |
| `authentik_policy_bindings_create` | Create a new policy binding to attach a policy to a target | full |
| `authentik_policy_bindings_update` | Update an existing policy binding | full |
| `authentik_policy_bindings_delete` | Delete a policy binding by its UUID | full |
| `authentik_reputation_scores_list` | List reputation scores with optional filters | read-only |
| `authentik_reputation_scores_delete` | Delete a reputation score by its UUID | full |

</details>

<details>
<summary>Property Mappings (10 tools)</summary>

Property mappings use a type+config pattern. Cross-type tools operate on any mapping, while per-type tools accept a `mapping_type` parameter. Available types: `notification`, `provider_google_workspace`, `provider_microsoft_entra`, `provider_rac`, `provider_radius`, `provider_saml`, `provider_scim`, `provider_scope`, `source_kerberos`, `source_ldap`, `source_oauth`, `source_plex`, `source_saml`, `source_scim`.

| Tool | Description | Access |
|------|-------------|--------|
| `authentik_property_mappings_list` | List all property mappings across all types | read-only |
| `authentik_property_mappings_get` | Get a single property mapping by its UUID (cross-type) | read-only |
| `authentik_property_mappings_delete` | Delete a property mapping by its UUID | full |
| `authentik_property_mappings_types_list` | List all available property mapping types | read-only |
| `authentik_property_mappings_test` | Test a property mapping by UUID | full |
| `authentik_property_mappings_by_type_list` | List property mappings of a specific type | read-only |
| `authentik_property_mappings_by_type_get` | Get a single property mapping by type and UUID | read-only |
| `authentik_property_mappings_by_type_create` | Create a new property mapping of a specific type | full |
| `authentik_property_mappings_by_type_update` | Update an existing property mapping by type and UUID | full |
| `authentik_property_mappings_by_type_delete` | Delete a property mapping by type and UUID | full |

</details>

<details>
<summary>Providers (11 tools)</summary>

Providers use a type+config pattern. Cross-type tools operate on any provider, while per-type tools accept a `provider_type` parameter. Available types: `oauth2`, `saml`, `ldap`, `proxy`, `radius`, `scim`, `rac`, `google_workspace`, `microsoft_entra`.

| Tool | Description | Access |
|------|-------------|--------|
| `authentik_providers_list` | List all providers across all types with optional filters | read-only |
| `authentik_providers_get` | Get a single provider by its numeric ID (cross-type) | read-only |
| `authentik_providers_delete` | Delete a provider by its numeric ID (cross-type) | full |
| `authentik_providers_types_list` | List all available provider types | read-only |
| `authentik_providers_by_type_list` | List providers of a specific type with optional filters | read-only |
| `authentik_providers_by_type_get` | Get a single provider of a specific type by its numeric ID | read-only |
| `authentik_providers_by_type_create` | Create a new provider of a specific type | full |
| `authentik_providers_by_type_update` | Update an existing provider of a specific type | full |
| `authentik_providers_by_type_delete` | Delete a provider of a specific type by its numeric ID | full |
| `authentik_providers_oauth2_setup_urls` | Get OAuth2 provider setup URLs (authorize, token, userinfo, etc.) | read-only |
| `authentik_providers_saml_metadata` | Get SAML provider metadata XML | read-only |

</details>

<details>
<summary>RAC (8 tools)</summary>

| Tool | Description | Access |
|------|-------------|--------|
| `authentik_rac_endpoints_list` | List RAC (Remote Access Control) endpoints with optional filters | read-only |
| `authentik_rac_endpoints_get` | Get a single RAC endpoint by its UUID | read-only |
| `authentik_rac_endpoints_create` | Create a new RAC endpoint for remote access | full |
| `authentik_rac_endpoints_update` | Update an existing RAC endpoint (partial update) | full |
| `authentik_rac_endpoints_delete` | Delete a RAC endpoint by its UUID | full |
| `authentik_rac_connection_tokens_list` | List RAC connection tokens with optional filters (system-managed, no create) | read-only |
| `authentik_rac_connection_tokens_get` | Get a single RAC connection token by its UUID | read-only |
| `authentik_rac_connection_tokens_delete` | Delete a RAC connection token by its UUID | full |

</details>

<details>
<summary>RBAC (12 tools)</summary>

| Tool | Description | Access |
|------|-------------|--------|
| `authentik_rbac_roles_list` | List RBAC roles with optional filters | read-only |
| `authentik_rbac_roles_get` | Get a single RBAC role by its UUID | read-only |
| `authentik_rbac_roles_create` | Create a new RBAC role | full |
| `authentik_rbac_roles_update` | Update an existing RBAC role (partial update) | full |
| `authentik_rbac_roles_delete` | Delete an RBAC role by its UUID | full |
| `authentik_rbac_permissions_list` | List all available permissions, filterable by model and app | read-only |
| `authentik_rbac_permissions_by_role_list` | List object permissions assigned to a specific model, filterable by role | read-only |
| `authentik_rbac_permissions_by_role_assign` | Assign permission(s) to a role | full |
| `authentik_rbac_permissions_by_role_unassign` | Unassign permission(s) from a role | full |
| `authentik_rbac_permissions_by_user_list` | List object permissions assigned to a specific model, filterable by user | read-only |
| `authentik_rbac_permissions_by_user_assign` | Assign permission(s) to a user | full |
| `authentik_rbac_permissions_by_user_unassign` | Unassign permission(s) from a user | full |

</details>

<details>
<summary>Root (1 tool)</summary>

| Tool | Description | Access |
|------|-------------|--------|
| `authentik_root_config` | Get root configuration including capabilities, error reporting settings, and UI configuration | read-only |

</details>

<details>
<summary>Sources (10 tools)</summary>

Sources use a type+config pattern. Cross-type tools operate on any source, while per-type tools accept a `source_type` parameter. Available types: `oauth`, `saml`, `ldap`, `plex`, `kerberos`, `scim`.

| Tool | Description | Access |
|------|-------------|--------|
| `authentik_sources_list` | List all sources across all types (OAuth, SAML, LDAP, Plex, Kerberos, SCIM) | read-only |
| `authentik_sources_get` | Get a single source by its slug (cross-type) | read-only |
| `authentik_sources_delete` | Delete a source by its slug | full |
| `authentik_sources_types_list` | List all available source types | read-only |
| `authentik_sources_by_type_list` | List sources of a specific type | read-only |
| `authentik_sources_by_type_get` | Get a single source by type and slug | read-only |
| `authentik_sources_by_type_create` | Create a new source of a specific type | full |
| `authentik_sources_by_type_update` | Update an existing source by type and slug | full |
| `authentik_sources_by_type_delete` | Delete a source by type and slug | full |
| `authentik_sources_user_connections_list` | List user-source connections across all source types | read-only |

</details>

<details>
<summary>SSF (2 tools)</summary>

| Tool | Description | Access |
|------|-------------|--------|
| `authentik_ssf_streams_list` | List Shared Signals Framework (SSF) event streams with optional filters | read-only |
| `authentik_ssf_streams_get` | Get a single SSF event stream by its UUID | read-only |

</details>

<details>
<summary>Stages (19 tools)</summary>

Stages use a type+config pattern. Cross-type tools operate on any stage, while per-type tools accept a `stage_type` parameter. Available types: `authenticator_duo`, `authenticator_email`, `authenticator_endpoint_gdtc`, `authenticator_sms`, `authenticator_static`, `authenticator_totp`, `authenticator_validate`, `authenticator_webauthn`, `captcha`, `consent`, `deny`, `dummy`, `email`, `identification`, `invitation`, `mtls`, `password`, `prompt`, `redirect`, `source`, `user_delete`, `user_login`, `user_logout`, `user_write`.

| Tool | Description | Access |
|------|-------------|--------|
| `authentik_stages_list` | List all stages across all types with optional filters | read-only |
| `authentik_stages_get` | Get a single stage by its UUID (cross-type) | read-only |
| `authentik_stages_delete` | Delete a stage by its UUID (cross-type) | full |
| `authentik_stages_types_list` | List all available stage types | read-only |
| `authentik_stages_by_type_list` | List stages of a specific type with optional filters | read-only |
| `authentik_stages_by_type_get` | Get a single stage of a specific type by its UUID | read-only |
| `authentik_stages_by_type_create` | Create a new stage of a specific type | full |
| `authentik_stages_by_type_update` | Update an existing stage of a specific type | full |
| `authentik_stages_by_type_delete` | Delete a stage of a specific type by its UUID | full |
| `authentik_invitations_list` | List invitations with optional filters | read-only |
| `authentik_invitations_get` | Get a single invitation by its UUID | read-only |
| `authentik_invitations_create` | Create a new invitation | full |
| `authentik_invitations_update` | Update an existing invitation | full |
| `authentik_invitations_delete` | Delete an invitation by its UUID | full |
| `authentik_prompts_list` | List prompt field definitions with optional filters | read-only |
| `authentik_prompts_get` | Get a single prompt field definition by its UUID | read-only |
| `authentik_prompts_create` | Create a new prompt field definition | full |
| `authentik_prompts_update` | Update an existing prompt field definition | full |
| `authentik_prompts_delete` | Delete a prompt field definition by its UUID | full |

</details>

<details>
<summary>Tenants (10 tools)</summary>

| Tool | Description | Access |
|------|-------------|--------|
| `authentik_tenants_list` | List tenants with optional filters | read-only |
| `authentik_tenants_get` | Get a single tenant by its UUID | read-only |
| `authentik_tenants_create` | Create a new tenant | full |
| `authentik_tenants_update` | Update an existing tenant (partial update) | full |
| `authentik_tenants_delete` | Delete a tenant by its UUID (irreversible, removes all tenant data) | full |
| `authentik_tenants_create_admin_group` | Create an admin group for a tenant and add a user to it | full |
| `authentik_tenants_create_recovery_key` | Create a recovery key for a user in a tenant | full |
| `authentik_tenants_domains_list` | List tenant domains with optional filters | read-only |
| `authentik_tenants_domains_create` | Create a new domain for a tenant | full |
| `authentik_tenants_domains_delete` | Delete a tenant domain by its numeric ID | full |

</details>

## Known Limitations

The following enterprise endpoint features are not available in the `@goauthentik/api` SDK:

- **ENDP-01:** Agent connectors CRUD
- **ENDP-02:** Enrollment tokens CRUD
- **ENDP-03:** Enrollment key viewing
- **ENDP-06:** Device access groups CRUD
- **ENDP-07:** Fleet connectors CRUD
- **ENDP-08:** Connector types list

These enterprise endpoint features require SDK support that is not yet available.

## Verify It Works

After configuring your MCP client, ask your AI assistant:

> "What version of Authentik is running?"

If the connection is working, the assistant will call `authentik_admin_version` and return your server version and build hash.

## Usage Examples

- **"List all users in the admin group"** -- calls `authentik_users_list` and `authentik_groups_list` to find and display admin group members.
- **"What applications are configured?"** -- calls `authentik_apps_list` to show all applications with their providers and groups.
- **"Create a new user for john.doe@example.com"** -- calls `authentik_users_create` to set up the new user account.

## Troubleshooting

### Connection errors

- Verify `AUTHENTIK_URL` is reachable from the machine running the MCP server
- Ensure there is no trailing slash on the URL (use `https://auth.example.com` not `https://auth.example.com/`)
- Verify HTTPS is configured correctly if your instance uses TLS

### Token permissions

- The API token must have sufficient permissions for the tools you intend to use
- Tools with `full` access tier will fail if your token only has read permissions -- set `AUTHENTIK_ACCESS_TIER=read-only` to limit exposure
- Create tokens in the Authentik admin interface under Directory > Tokens and App passwords

### Category filtering

- Use `AUTHENTIK_CATEGORIES` with the actual category values listed above (e.g., `core,admin,flows`), not source file names
- Users, groups, applications, tokens, and brands are all under the `core` category, not separate categories
- Use comma-separated values with no spaces (e.g., `core,admin,events`)

## Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run in development mode (auto-reload)
npm run dev

# Open the MCP Inspector for interactive testing
npm run inspect
```

## License

[MIT](LICENSE)
