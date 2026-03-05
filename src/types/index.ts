export type AccessTier = 'read-only' | 'full';

export interface AppConfig {
  url: string;
  token: string;
  accessTier: AccessTier;
  categories: string[] | null;
  excludeToolTitles: boolean;
  transport: 'stdio' | 'http';
  httpPort: number;
  httpHost: string;
}
