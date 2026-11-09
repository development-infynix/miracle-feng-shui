import { ZodError } from 'zod';
import { ApiError } from '../utils/ApiError';
import { apiResponse } from '../utils/apiResponse';

/** What the browser sees for any error we didn't write a message for. The details go to the server log. */
export const GENERIC_ERROR_MESSAGE = 'Something went wrong. Please try again.';

/** Prisma's error code (like "P2002"), when the error came from the database. */
export function prismaErrorCode(error: unknown): string | undefined {
  const code = (error as { code?: unknown } | null)?.code;
  return typeof code === 'string' && /^P\d{4}$/.test(code) ? code : undefined;
}

// Database errors with a plain-language meaning. Everything else from the database stays generic.
const PRISMA_ERRORS: Record<string, { status: number; message: string }> = {
  P2025: { status: 404, message: 'Not found.' },
  P2002: { status: 409, message: 'This already exists.' },
  P2003: { status: 409, message: "This can't be changed because other records depend on it." },
};

export async function handleError(input: unknown): Promise<Response> {
  // Allow routes to pass a thunk: handleError(() => controller.action())
  if (typeof input === 'function') {
    try {
      return await (input as () => any)();
    } catch (error) {
      return handleError(error);
    }
  }

  const error = input;

  if (error instanceof ApiError) {
    return apiResponse.error(error.message, error.statusCode, error.details);
  }

  if (error instanceof ZodError) {
    const formatted = error.issues.map((i) => ({
      field: i.path.join('.'),
      message: i.message,
    }));
    return apiResponse.error('Validation error', 400, formatted);
  }

  const known = PRISMA_ERRORS[prismaErrorCode(error) ?? ''];
  if (known) {
    return apiResponse.error(known.message, known.status);
  }

  // Never the raw message: it can carry database, payment or storage internals. The log keeps all of it.
  console.error('Unhandled server error:', error);
  return apiResponse.error(GENERIC_ERROR_MESSAGE, 500);
}
