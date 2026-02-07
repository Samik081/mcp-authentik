export type AccessTier = 'read-only' | 'full';

export interface AppConfig {
  url: string;
  token: string;
  accessTier: AccessTier;
  categories: string[] | null;
}
