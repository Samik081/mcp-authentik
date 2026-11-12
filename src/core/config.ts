import type { AccessTier, AppConfig } from "../types/index.js";

function normalizeUrl(url: string): string {
  // Strip trailing slashes
  let normalized = url.replace(/\/+$/, "");

  // Ensure URL ends with /api/v3
  if (!normalized.endsWith("/api/v3")) {
    // Remove partial /api or /api/v3/ suffixes if present
    normalized = normalized.replace(/\/api(\/v3)?$/, "");
    normalized += "/api/v3";
  }

  return normalized;
}

function parseAccessTier(value: string | undefined): AccessTier {
  if (value === undefined || value === "") {
    return "full";
  }
  if (value === "read-only" || value === "full") {
    return value;
  }
  throw new Error(
    `Invalid AUTHENTIK_ACCESS_TIER value: "${value}". Must be "read-only" or "full".`,
  );
}

function parseCategories(value: string | undefined): string[] | null {
  if (value === undefined || value === "") {
    return null;
  }
  return value
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/**
 * Parse MCP_ALLOWED_HOSTS: comma-separated hostnames accepted in the Host and
 * Origin headers of HTTP requests. Ports are ignored; IPv6 must be bracketed.
 */
export function parseAllowedHosts(value: string | undefined): string[] {
  const hosts: string[] = [];
  for (const entry of (value ?? "").split(",")) {
    const raw = entry.trim();
    if (raw === "") continue;
    let url: URL | undefined;
    try {
      url = new URL(`http://${raw}`);
    } catch {
      // handled below
    }
    if (
      !url ||
      raw.includes("/") ||
      url.username !== "" ||
      url.search !== "" ||
      url.hash !== ""
    ) {
      throw new Error(
        `Invalid MCP_ALLOWED_HOSTS entry: "${raw}". Expected a hostname or IP (e.g. "mcp.example.com", "[::1]"), without scheme or path.`,
      );
    }
    hosts.push(url.hostname.toLowerCase());
  }
  return hosts;
}

function parseToolList(value: string | undefined): string[] | null {
  if (value === undefined || value === "") {
    return null;
  }
  return value
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export function loadConfig(): AppConfig {
  const url = process.env.AUTHENTIK_URL;
  if (!url) {
    throw new Error("Missing required environment variable: AUTHENTIK_URL");
  }

  const token = process.env.AUTHENTIK_TOKEN;
  if (!token) {
    throw new Error("Missing required environment variable: AUTHENTIK_TOKEN");
  }

  const accessTier = parseAccessTier(process.env.AUTHENTIK_ACCESS_TIER);
  const categories = parseCategories(process.env.AUTHENTIK_CATEGORIES);
  const toolBlacklist = parseToolList(process.env.AUTHENTIK_TOOL_BLACKLIST);
  const toolWhitelist = parseToolList(process.env.AUTHENTIK_TOOL_WHITELIST);

  const excludeToolTitles = process.env.MCP_EXCLUDE_TOOL_TITLES === "true";

  const transport =
    process.env.MCP_TRANSPORT === "http"
      ? ("http" as const)
      : ("stdio" as const);
  const rawPort = process.env.MCP_PORT ?? "3000";
  const httpPort = parseInt(rawPort, 10);
  if (Number.isNaN(httpPort) || httpPort < 1 || httpPort > 65535) {
    throw new Error(
      `Invalid MCP_PORT: "${rawPort}". Must be an integer between 1 and 65535.`,
    );
  }
  const httpHost = process.env.MCP_HOST ?? "127.0.0.1";
  const allowedHosts = parseAllowedHosts(process.env.MCP_ALLOWED_HOSTS);

  // Idle HTTP sessions are closed after this many seconds (0 disables).
  const rawIdleTimeout = process.env.MCP_SESSION_IDLE_TIMEOUT ?? "1800";
  const sessionIdleTimeoutSec = Number(rawIdleTimeout);
  if (
    !Number.isInteger(sessionIdleTimeoutSec) ||
    sessionIdleTimeoutSec < 0 ||
    rawIdleTimeout.trim() === ""
  ) {
    throw new Error(
      `Invalid MCP_SESSION_IDLE_TIMEOUT: "${rawIdleTimeout}". Must be a non-negative integer (seconds, 0 disables).`,
    );
  }
  const sessionIdleTimeoutMs = sessionIdleTimeoutSec * 1000;

  return {
    url: normalizeUrl(url),
    token,
    accessTier,
    categories,
    toolBlacklist,
    toolWhitelist,
    excludeToolTitles,
    transport,
    httpPort,
    httpHost,
    allowedHosts,
    sessionIdleTimeoutMs,
  };
}
