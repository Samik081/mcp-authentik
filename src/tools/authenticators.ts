import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { AuthentikClient } from '../core/client.js';
import type { AppConfig } from '../types/index.js';
import { registerTool } from '../core/tools.js';

// SDK method name prefixes for each authenticator device type
const DEVICE_TYPES = ['duo', 'email', 'endpoint', 'sms', 'static', 'totp', 'webauthn'] as const;
type DeviceType = (typeof DEVICE_TYPES)[number];

// SDK method name prefixes: authenticatorsAdmin{Prefix}List, etc.
const ADMIN_PREFIX: Record<DeviceType, string> = {
  duo: 'AdminDuo',
  email: 'AdminEmail',
  endpoint: 'AdminEndpoint',
  sms: 'AdminSms',
  static: 'AdminStatic',
  totp: 'AdminTotp',
  webauthn: 'AdminWebauthn',
};

// User-facing method prefixes: authenticators{Prefix}List
const USER_PREFIX: Record<DeviceType, string> = {
  duo: 'Duo',
  email: 'Email',
  endpoint: 'Endpoint',
  sms: 'Sms',
  static: 'Static',
  totp: 'Totp',
  webauthn: 'Webauthn',
};

// Endpoint uses uuid (string), all others use id (number)
function isEndpointType(deviceType: string): boolean {
  return deviceType === 'endpoint';
}

export function registerAuthenticatorTools(
  server: McpServer,
  client: AuthentikClient,
  config: AppConfig,
): void {
  // 1. List all authenticator devices (cross-type)
  registerTool(server, config, {
    name: 'authentik_authenticators_list',
    description: 'List all authenticator devices across all types for the current user.',
    accessTier: 'read-only',
    category: 'authenticators',
    handler: async () => {
      const result = await client.authenticatorsApi.authenticatorsAllList();
      return JSON.stringify(result, null, 2);
    },
  });

  // 2. Admin list devices by type
  registerTool(server, config, {
    name: 'authentik_authenticators_admin_by_type_list',
    description: 'List authenticator devices of a specific type (admin view). Supports: duo, email, endpoint, sms, static, totp, webauthn.',
    accessTier: 'read-only',
    category: 'authenticators',
    inputSchema: {
      device_type: z.enum(DEVICE_TYPES).describe('Authenticator device type'),
      name: z.string().optional().describe('Filter by device name'),
      ordering: z.string().optional().describe('Field to order by'),
      page: z.number().optional().describe('Page number'),
      page_size: z.number().optional().describe('Number of results per page'),
    },
    handler: async (args) => {
      const prefix = ADMIN_PREFIX[args.device_type as DeviceType];
      const method = `authenticators${prefix}List` as keyof typeof client.authenticatorsApi;
      const fn = client.authenticatorsApi[method] as Function;
      const result = await fn.call(client.authenticatorsApi, {
        name: args.name as string | undefined,
        ordering: args.ordering as string | undefined,
        page: args.page as number | undefined,
        pageSize: args.page_size as number | undefined,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 3. Admin get device by type
  registerTool(server, config, {
    name: 'authentik_authenticators_admin_by_type_get',
    description: 'Get a single authenticator device by type and ID (admin view). Use numeric id for most types, uuid string for endpoint type.',
    accessTier: 'read-only',
    category: 'authenticators',
    inputSchema: {
      device_type: z.enum(DEVICE_TYPES).describe('Authenticator device type'),
      id: z.union([z.number(), z.string()]).describe('Device ID (number for most types, UUID string for endpoint)'),
    },
    handler: async (args) => {
      const prefix = ADMIN_PREFIX[args.device_type as DeviceType];
      const method = `authenticators${prefix}Retrieve` as keyof typeof client.authenticatorsApi;
      const fn = client.authenticatorsApi[method] as Function;
      const idParam = isEndpointType(args.device_type as string)
        ? { uuid: args.id as string }
        : { id: args.id as number };
      const result = await fn.call(client.authenticatorsApi, idParam);
      return JSON.stringify(result, null, 2);
    },
  });

  // 4. Admin delete device by type
  registerTool(server, config, {
    name: 'authentik_authenticators_admin_by_type_delete',
    description: 'Delete an authenticator device by type and ID (admin view). This action is irreversible.',
    accessTier: 'full',
    category: 'authenticators',
    tags: ['destructive'],
    inputSchema: {
      device_type: z.enum(DEVICE_TYPES).describe('Authenticator device type'),
      id: z.union([z.number(), z.string()]).describe('Device ID (number for most types, UUID string for endpoint)'),
    },
    handler: async (args) => {
      const prefix = ADMIN_PREFIX[args.device_type as DeviceType];
      const method = `authenticators${prefix}Destroy` as keyof typeof client.authenticatorsApi;
      const fn = client.authenticatorsApi[method] as Function;
      const idParam = isEndpointType(args.device_type as string)
        ? { uuid: args.id as string }
        : { id: args.id as number };
      await fn.call(client.authenticatorsApi, idParam);
      return `Authenticator device (${args.device_type}) ${args.id} deleted successfully.`;
    },
  });

  // 5. User list devices by type
  registerTool(server, config, {
    name: 'authentik_authenticators_user_by_type_list',
    description: 'List authenticator devices of a specific type for the current user. Supports: duo, email, endpoint, sms, static, totp, webauthn.',
    accessTier: 'read-only',
    category: 'authenticators',
    inputSchema: {
      device_type: z.enum(DEVICE_TYPES).describe('Authenticator device type'),
      name: z.string().optional().describe('Filter by device name'),
      ordering: z.string().optional().describe('Field to order by'),
      page: z.number().optional().describe('Page number'),
      page_size: z.number().optional().describe('Number of results per page'),
    },
    handler: async (args) => {
      const prefix = USER_PREFIX[args.device_type as DeviceType];
      const method = `authenticators${prefix}List` as keyof typeof client.authenticatorsApi;
      const fn = client.authenticatorsApi[method] as Function;
      const result = await fn.call(client.authenticatorsApi, {
        name: args.name as string | undefined,
        ordering: args.ordering as string | undefined,
        page: args.page as number | undefined,
        pageSize: args.page_size as number | undefined,
      });
      return JSON.stringify(result, null, 2);
    },
  });
}
