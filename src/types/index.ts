export type AccessTier = "read-only" | "full";

export interface AppConfig {
  url: string;
  /**
   * Server-side token from AUTHENTIK_TOKEN. Optional when remoteAuthorization
   * is on, in which case every HTTP caller supplies its own instead.
   */
  token: string | undefined;
  /**
   * HTTP transport only: take the Authentik token from each request's
   * Authorization header rather than from the environment, so one deployment
   * can serve several users under their own identities.
   */
  remoteAuthorization: boolean;
  accessTier: AccessTier;
  categories: string[] | null;
  toolBlacklist: string[] | null;
  toolWhitelist: string[] | null;
  excludeToolTitles: boolean;
  transport: "stdio" | "http";
  httpPort: number;
  httpHost: string;
}
