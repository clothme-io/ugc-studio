const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** True for Postgres UUIDs; false for mock IDs like remix-mre5tii8 or vid-001. */
export function isUuid(value: string | null | undefined): value is string {
  return !!value && UUID_RE.test(value);
}

/** Use URL query params only when they are real API UUIDs (ignore stale mock-mode links). */
export function uuidFromQuery(value: string | null | undefined): string {
  return isUuid(value) ? value : '';
}
