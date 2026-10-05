import { VERSION_NEUTRAL } from '@nestjs/common';
import type { VersionValue } from '@nestjs/common/interfaces';

/**
 * Versions served by a controller of the first version of the public API.
 *
 * The API is versioned in the URI (`/api/v1/...`). `VERSION_NEUTRAL` additionally keeps the
 * unversioned URLs (`/api/...`) answering, so that clients written before versioning existed
 * are not broken. A breaking change is made by adding a controller with `version: '2'` next to
 * the v1 one; the unversioned alias stays on v1.
 */
export const API_V1: VersionValue = ['1', VERSION_NEUTRAL];

/** Prefix of the whole public API, applied globally (see `main.ts`). */
export const API_PREFIX = 'api';
