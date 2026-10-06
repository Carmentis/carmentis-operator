import { BadRequestException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Response } from 'express';

/**
 * Helpers shared by the admin UI form handlers.
 *
 * Errors raised while handling a form POST must never bubble up to `AllExceptionsFilter`
 * (it can only answer with JSON for these routes), so handlers catch them and bring the user
 * back to a page that renders the message through the `flash` partial.
 */

export type FlashType = 'success' | 'error';

/** Extracts a human-readable message from whatever was thrown (Nest exceptions included). */
export function getErrorMessage(error: any, fallback: string): string {
	const response = error?.response?.message ?? error?.message;
	if (Array.isArray(response)) return response.join('; ');
	return typeof response === 'string' && response.length > 0 ? response : fallback;
}

export function redirectWithFlash(res: Response, path: string, message: string, type: FlashType) {
	const separator = path.includes('?') ? '&' : '?';
	const query = new URLSearchParams({ flash: message, flashType: type }).toString();
	return res.redirect(`${path}${separator}${query}`);
}

/** Validates already-typed form values against a class-validator DTO. */
export async function validateForm<T extends object>(dtoClass: new () => T, plain: object): Promise<T> {
	const instance = plainToInstance(dtoClass, plain);
	const errors = await validate(instance);
	if (errors.length > 0) {
		const messages = errors.flatMap(error => Object.values(error.constraints ?? {}));
		throw new BadRequestException(messages);
	}
	return instance;
}

/** An empty form field means "not provided". */
export function emptyToUndefined(value: unknown): string | undefined {
	return typeof value === 'string' && value.trim() !== '' ? value : undefined;
}

export function toOptionalNumber(value: unknown): number | undefined {
	const text = emptyToUndefined(value);
	if (text === undefined) return undefined;
	const parsed = Number(text);
	if (Number.isNaN(parsed)) {
		throw new BadRequestException(`"${text}" is not a valid number`);
	}
	return parsed;
}
