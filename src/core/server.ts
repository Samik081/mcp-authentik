import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { logger } from './logger.js';

export function createServer(): McpServer {
  return new McpServer(
    {
      name: 'mcp-authentik',
      version: '0.1.0',
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
