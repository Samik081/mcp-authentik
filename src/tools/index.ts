import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { AuthentikClient } from '../core/client.js';
import type { AppConfig } from '../types/index.js';
import { registerUserTools } from './users.js';
import { registerGroupTools } from './groups.js';
import { registerApplicationTools } from './applications.js';
import { registerTokenTools } from './tokens.js';
import { registerBrandTools } from './brands.js';
import { registerAdminTools } from './admin.js';
import { registerTaskTools } from './tasks.js';
import { registerRootTools } from './root.js';
// Phase 3 Wave 1
import { registerFlowTools } from './flows.js';
import { registerStageTools } from './stages.js';
import { registerProviderTools } from './providers.js';
import { registerPolicyTools } from './policies.js';
// Phase 3 Wave 1 (Plan 02)
import { registerSourceTools } from './sources.js';
import { registerPropertyMappingTools } from './property-mappings.js';
import { registerRbacTools } from './rbac.js';
import { registerEventTools } from './events.js';
// Phase 3 Wave 2 (Plan 03)
import { registerCryptoTools } from './crypto.js';
import { registerOutpostTools } from './outposts.js';
import { registerManagedTools } from './managed.js';
import { registerOauth2Tools } from './oauth2.js';
import { registerAuthenticatorTools } from './authenticators.js';
import { registerEnterpriseTools } from './enterprise.js';
import { registerRacTools } from './rac.js';
import { registerSsfTools } from './ssf.js';
import { registerTenantTools } from './tenants.js';

export function registerAllTools(
  server: McpServer,
  client: AuthentikClient,
  config: AppConfig,
): void {
  // Phase 2: Core domain (8 modules)
  registerUserTools(server, client, config);
  registerGroupTools(server, client, config);
  registerApplicationTools(server, client, config);
  registerTokenTools(server, client, config);
  registerBrandTools(server, client, config);
  registerAdminTools(server, client, config);
  registerTaskTools(server, client, config);
  registerRootTools(server, client, config);
  // Phase 3 Wave 1: Plan 01 (4 modules)
  registerFlowTools(server, client, config);
  registerStageTools(server, client, config);
  registerProviderTools(server, client, config);
  registerPolicyTools(server, client, config);
  // Phase 3 Wave 1: Plan 02 (4 modules)
  registerSourceTools(server, client, config);
  registerPropertyMappingTools(server, client, config);
  registerRbacTools(server, client, config);
  registerEventTools(server, client, config);
  // Phase 3 Wave 2: Plan 03 (9 modules)
  registerCryptoTools(server, client, config);
  registerOutpostTools(server, client, config);
  registerManagedTools(server, client, config);
  registerOauth2Tools(server, client, config);
  registerAuthenticatorTools(server, client, config);
  registerEnterpriseTools(server, client, config);
  registerRacTools(server, client, config);
  registerSsfTools(server, client, config);
  registerTenantTools(server, client, config);
}
