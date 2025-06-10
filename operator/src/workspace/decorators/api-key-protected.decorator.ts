import { SetMetadata } from '@nestjs/common';

export const API_KEY_PROTECTED = 'apiKeyProtected';
export const ApiKeyProtected = () => SetMetadata(API_KEY_PROTECTED, true);