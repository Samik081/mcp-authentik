/**
 * Parse an ISO 8601 date string into a Date, throwing a clear error for
 * invalid input (otherwise the SDK serializer throws an opaque
 * "Invalid time value" RangeError).
 */
export function parseDate(value: string): Date {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(
      `Invalid date: "${value}" (expected ISO 8601, e.g. 2026-05-25T00:00:00Z)`,
    );
  }
  return date;
}
