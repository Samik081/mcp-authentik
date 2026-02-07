import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { AuthentikClient } from '../core/client.js';
import type { AppConfig } from '../types/index.js';
import { registerTool } from '../core/tools.js';

export function registerCryptoTools(
  server: McpServer,
  client: AuthentikClient,
  config: AppConfig,
): void {
  // 1. List certificate keypairs
  registerTool(server, config, {
    name: 'authentik_crypto_list',
    description: 'List certificate keypairs with optional filters.',
    accessTier: 'read-only',
    category: 'crypto',
    inputSchema: {
      name: z.string().optional().describe('Filter by exact name'),
      search: z.string().optional().describe('Search across fields'),
      has_key: z.boolean().optional().describe('Filter by whether keypair has a private key'),
      ordering: z.string().optional().describe('Field to order by (prefix with - for descending)'),
      page: z.number().optional().describe('Page number'),
      page_size: z.number().optional().describe('Number of results per page'),
    },
    handler: async (args) => {
      const result = await client.cryptoApi.cryptoCertificatekeypairsList({
        name: args.name as string | undefined,
        search: args.search as string | undefined,
        hasKey: args.has_key as boolean | undefined,
        ordering: args.ordering as string | undefined,
        page: args.page as number | undefined,
        pageSize: args.page_size as number | undefined,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 2. Get certificate keypair
  registerTool(server, config, {
    name: 'authentik_crypto_get',
    description: 'Get a single certificate keypair by its UUID.',
    accessTier: 'read-only',
    category: 'crypto',
    inputSchema: {
      kp_uuid: z.string().describe('Certificate keypair UUID'),
    },
    handler: async (args) => {
      const result = await client.cryptoApi.cryptoCertificatekeypairsRetrieve({
        kpUuid: args.kp_uuid as string,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 3. Create certificate keypair
  registerTool(server, config, {
    name: 'authentik_crypto_create',
    description: 'Create a new certificate keypair from PEM-encoded certificate and optional private key data.',
    accessTier: 'full',
    category: 'crypto',
    inputSchema: {
      name: z.string().describe('Keypair name (required)'),
      certificate_data: z.string().describe('PEM-encoded certificate data (required)'),
      key_data: z.string().optional().describe('PEM-encoded private key data (optional, enables encryption)'),
    },
    handler: async (args) => {
      const result = await client.cryptoApi.cryptoCertificatekeypairsCreate({
        certificateKeyPairRequest: {
          name: args.name as string,
          certificateData: args.certificate_data as string,
          keyData: args.key_data as string | undefined,
        },
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 4. Update certificate keypair
  registerTool(server, config, {
    name: 'authentik_crypto_update',
    description: 'Update an existing certificate keypair. Only provided fields are modified (partial update).',
    accessTier: 'full',
    category: 'crypto',
    inputSchema: {
      kp_uuid: z.string().describe('Certificate keypair UUID (required)'),
      name: z.string().optional().describe('New keypair name'),
      certificate_data: z.string().optional().describe('New PEM-encoded certificate data'),
      key_data: z.string().optional().describe('New PEM-encoded private key data'),
    },
    handler: async (args) => {
      const result = await client.cryptoApi.cryptoCertificatekeypairsPartialUpdate({
        kpUuid: args.kp_uuid as string,
        patchedCertificateKeyPairRequest: {
          name: args.name as string | undefined,
          certificateData: args.certificate_data as string | undefined,
          keyData: args.key_data as string | undefined,
        },
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 5. Delete certificate keypair
  registerTool(server, config, {
    name: 'authentik_crypto_delete',
    description: 'Delete a certificate keypair by its UUID. This action is irreversible.',
    accessTier: 'full',
    category: 'crypto',
    tags: ['destructive'],
    inputSchema: {
      kp_uuid: z.string().describe('Certificate keypair UUID to delete'),
    },
    handler: async (args) => {
      await client.cryptoApi.cryptoCertificatekeypairsDestroy({
        kpUuid: args.kp_uuid as string,
      });
      return `Certificate keypair "${args.kp_uuid}" deleted successfully.`;
    },
  });

  // 6. Generate self-signed certificate
  registerTool(server, config, {
    name: 'authentik_crypto_generate',
    description: 'Generate a new self-signed certificate keypair.',
    accessTier: 'full',
    category: 'crypto',
    inputSchema: {
      common_name: z.string().describe('Certificate common name (CN) (required)'),
      subject_alt_name: z.string().optional().describe('Subject alternative name (SAN)'),
      validity_days: z.number().describe('Number of days the certificate is valid (required)'),
    },
    handler: async (args) => {
      const result = await client.cryptoApi.cryptoCertificatekeypairsGenerateCreate({
        certificateGenerationRequest: {
          commonName: args.common_name as string,
          subjectAltName: args.subject_alt_name as string | undefined,
          validityDays: args.validity_days as number,
        },
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 7. View certificate PEM data
  registerTool(server, config, {
    name: 'authentik_crypto_view_certificate',
    description: 'View the PEM-encoded certificate data for a keypair. Access is logged.',
    accessTier: 'read-only',
    category: 'crypto',
    inputSchema: {
      kp_uuid: z.string().describe('Certificate keypair UUID'),
    },
    handler: async (args) => {
      const result = await client.cryptoApi.cryptoCertificatekeypairsViewCertificateRetrieve({
        kpUuid: args.kp_uuid as string,
      });
      return JSON.stringify(result, null, 2);
    },
  });

  // 8. View private key PEM data
  registerTool(server, config, {
    name: 'authentik_crypto_view_private_key',
    description: 'View the PEM-encoded private key data for a keypair. Access is logged. Sensitive operation.',
    accessTier: 'full',
    category: 'crypto',
    inputSchema: {
      kp_uuid: z.string().describe('Certificate keypair UUID'),
    },
    handler: async (args) => {
      const result = await client.cryptoApi.cryptoCertificatekeypairsViewPrivateKeyRetrieve({
        kpUuid: args.kp_uuid as string,
      });
      return JSON.stringify(result, null, 2);
    },
  });
}
