export type AccessTier = "read-only" | "full";

export interface AppConfig {
  url: string;
  token: string;
  accessTier: AccessTier;
  categories: string[] | null;
  toolBlacklist: string[] | null;
  toolWhitelist: string[] | null;
  excludeToolTitles: boolean;
  transport: "stdio" | "http";
  httpPort: number;
  httpHost: string;
  /**
   * Extra hostnames accepted in Host/Origin headers (MCP_ALLOWED_HOSTS), on
   * top of the loopback names implied by a loopback httpHost.
   */
  allowedHosts: string[];
  /** Idle time after which an HTTP session is closed. 0 disables reaping. */
  sessionIdleTimeoutMs: number;
}
