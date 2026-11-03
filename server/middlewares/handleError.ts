import { ZodError } from 'zod';
import { ApiError } from '../utils/ApiError';
import { apiResponse } from '../utils/apiResponse';

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

  if (error instanceof Error) {
    console.error('Unhandled server error:', error.message);
    return apiResponse.error(error.message || 'Internal server error', 500);
  }

  console.error('Non-Error thrown:', error);
  return apiResponse.error('An unexpected error occurred', 500);
}
