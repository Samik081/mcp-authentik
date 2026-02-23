import { AccessTier, AppConfig } from '../types/index.js';

function normalizeUrl(url: string): string {
  // Strip trailing slashes
  let normalized = url.replace(/\/+$/, '');

  // Ensure URL ends with /api/v3
  if (!normalized.endsWith('/api/v3')) {
    // Remove partial /api or /api/v3/ suffixes if present
    normalized = normalized.replace(/\/api(\/v3)?$/, '');
    normalized += '/api/v3';
  }

  return normalized;
}

function parseAccessTier(value: string | undefined): AccessTier {
  if (value === undefined || value === '') {
    return 'full';
  }
  if (value === 'read-only' || value === 'full') {
    return value;
  }
  throw new Error(
    `Invalid AUTHENTIK_ACCESS_TIER value: "${value}". Must be "read-only" or "full".`
  );
}

function parseCategories(value: string | undefined): string[] | null {
  if (value === undefined || value === '') {
    return null;
  }
  return value
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export function loadConfig(): AppConfig {
  const url = process.env.AUTHENTIK_URL;
  if (!url) {
    throw new Error('Missing required environment variable: AUTHENTIK_URL');
  }

  const token = process.env.AUTHENTIK_TOKEN;
  if (!token) {
    throw new Error('Missing required environment variable: AUTHENTIK_TOKEN');
  }

  const accessTier = parseAccessTier(process.env.AUTHENTIK_ACCESS_TIER);
  const categories = parseCategories(process.env.AUTHENTIK_CATEGORIES);

  const transport =
    process.env.MCP_TRANSPORT === 'http' ? ('http' as const) : ('stdio' as const);
  const rawPort = process.env.MCP_PORT ?? '3000';
  const httpPort = parseInt(rawPort, 10);
  if (isNaN(httpPort) || httpPort < 1 || httpPort > 65535) {
    throw new Error(
      `Invalid MCP_PORT: "${rawPort}". Must be an integer between 1 and 65535.`,
    );
  }
  const httpHost = process.env.MCP_HOST ?? '0.0.0.0';

  return {
    url: normalizeUrl(url),
    token,
    accessTier,
    categories,
    transport,
    httpPort,
    httpHost,
  };
}
