import { ResponseError, FetchError } from '@goauthentik/api';
import { AppConfig } from '../types/index.js';

function sanitizeMessage(message: string, config: AppConfig): string {
  let sanitized = message;

  // Replace token occurrences
  if (config.token) {
    sanitized = sanitized.replaceAll(config.token, '[REDACTED]');
  }

  // Replace URL occurrences
  if (config.url) {
    sanitized = sanitized.replaceAll(config.url, '[AUTHENTIK_URL]');
  }

  // Replace Bearer token patterns
  sanitized = sanitized.replace(/Bearer\s+\S+/gi, 'Bearer [REDACTED]');

  // Replace Authorization header patterns
  sanitized = sanitized.replace(/Authorization:\s*\S+/gi, 'Authorization: [REDACTED]');

  return sanitized;
}

export async function sanitizeError(error: unknown, config: AppConfig): Promise<string> {
  if (error instanceof ResponseError) {
    const status = error.response.status;
    const statusText = error.response.statusText;
    try {
      const body = await error.response.json();
      if (typeof body === 'object' && body !== null) {
        const details = Object.entries(body)
          .map(([key, val]) => {
            if (Array.isArray(val)) return `${key}: ${val.join(', ')}`;
            if (typeof val === 'object' && val !== null) return `${key}: ${JSON.stringify(val)}`;
            return `${key}: ${val}`;
          })
          .join('; ');
        return sanitizeMessage(`${status} ${statusText}: ${details}`, config);
      }
    } catch {
      // Body not JSON or already consumed -- fall through
    }
    return sanitizeMessage(`${status} ${statusText}`, config);
  }

  if (error instanceof FetchError) {
    const causeMsg = error.cause?.message ?? 'Unknown fetch error';
    return sanitizeMessage(causeMsg, config);
  }

  if (error instanceof Error) {
    return sanitizeMessage(error.message, config);
  }

  return 'An unknown error occurred';
}
