import { vi } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { AppConfig } from '../types/index.js';
import type { AuthentikClient } from '../core/client.js';

export function makeConfig(overrides: Partial<AppConfig> = {}): AppConfig {
  return {
    url: 'https://authentik.test',
    token: 'test-api-token',
    accessTier: 'full',
    categories: null,
    transport: 'stdio',
    httpPort: 3000,
    httpHost: '0.0.0.0',
    ...overrides,
  };
}

/**
 * Create a mock AuthentikClient with stub API getters.
 * Each sub-API (coreApi, adminApi, etc.) returns an object
 * whose methods are vi.fn() stubs returning empty results.
 */
export function makeMockClient(): AuthentikClient {
  const makeApiProxy = () =>
    new Proxy(
      {},
      {
        get: (_target, prop) => {
          if (typeof prop === 'string') {
            // Lazily create and cache mock functions per method name
            const cache = _target as Record<string, ReturnType<typeof vi.fn>>;
            if (!cache[prop]) {
              cache[prop] = vi.fn().mockResolvedValue({});
            }
            return cache[prop];
          }
          return undefined;
        },
      },
    );

  return new Proxy({} as AuthentikClient, {
    get: (_target, prop) => {
      if (typeof prop === 'string' && prop.endsWith('Api')) {
        const cache = _target as Record<string, unknown>;
        if (!cache[prop]) {
          cache[prop] = makeApiProxy();
        }
        return cache[prop];
      }
      if (prop === 'validateConnection') {
        return vi.fn().mockResolvedValue('ok');
      }
      return undefined;
    },
  });
}

export async function connectTestClient(server: McpServer) {
  const [clientTransport, serverTransport] =
    InMemoryTransport.createLinkedPair();
  await server.connect(serverTransport);
  const client = new Client({ name: 'test-client', version: '1.0.0' });
  await client.connect(clientTransport);
  return {
    client,
    cleanup: async () => {
      await client.close();
    },
  };
}
