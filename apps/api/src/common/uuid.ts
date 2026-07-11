import { BadRequestException } from '@nestjs/common';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function assertUuid(id: string, fieldName: string): void {
  if (!UUID_RE.test(id)) {
    throw new BadRequestException(
      `Invalid ${fieldName}: "${id}" is not a UUID. Stale mock-mode links (e.g. remix-abc123) are invalid — use Discover to add videos in the real API.`,
    );
  }
}
