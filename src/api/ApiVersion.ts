import type { VersionValue } from '@nestjs/common/interfaces';

/**
 * Version served by a controller of the first version of the public API.
 *
 * The API is versioned in the URI (`/api/v1/...`) and only there: the unversioned URLs
 * (`/api/...`) are not served. A breaking change is made by adding a controller with
 * `version: '2'` next to the v1 one.
 */
export const API_V1: VersionValue = '1';

/** Prefix of the whole public API, applied globally (see `main.ts`). */
export const API_PREFIX = 'api';
