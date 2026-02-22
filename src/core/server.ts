import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { logger } from './logger.js';
import pkg from '../../package.json' with { type: 'json' };

export function createServer(): McpServer {
  return new McpServer(
    {
      name: 'mcp-authentik',
      version: pkg.version,
    },
    {
      capabilities: {
        tools: {},
      },
    },
  );
}

export async function startServer(server: McpServer): Promise<void> {
  const transport = new StdioServerTransport();
  logger.info('mcp-authentik listening on stdio');
  await server.connect(transport);
}
