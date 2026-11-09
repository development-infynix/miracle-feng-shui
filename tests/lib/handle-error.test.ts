import { afterEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { GENERIC_ERROR_MESSAGE, handleError } from '@/server/middlewares/handleError';
import { ApiError } from '@/server/utils/ApiError';

const body = async (res: Response) => ({ status: res.status, json: await res.json() });

afterEach(() => vi.restoreAllMocks());

describe('handleError', () => {
  it('keeps the messages we write ourselves', async () => {
    const { status, json } = await body(await handleError(ApiError.badRequest('Cart is empty')));
    expect(status).toBe(400);
    expect(json.error).toBe('Cart is empty');
  });

  it('keeps validation messages', async () => {
    const result = z.object({ name: z.string().min(2, 'Name is too short') }).safeParse({ name: 'a' });
    const { status, json } = await body(await handleError(result.error));
    expect(status).toBe(400);
    expect(json.details[0].message).toBe('Name is too short');
  });

  it('hides the message of an unexpected error, and logs it on the server', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    const leak = new Error('connect ECONNREFUSED db.internal:5432 password=hunter2');

    const { status, json } = await body(await handleError(leak));

    expect(status).toBe(500);
    expect(json.error).toBe(GENERIC_ERROR_MESSAGE);
    expect(JSON.stringify(json)).not.toContain('hunter2');
    expect(log).toHaveBeenCalledWith('Unhandled server error:', leak);
  });

  it('hides errors that are not Error objects, such as payment SDK failures', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const { status, json } = await body(await handleError({ statusCode: 401, error: { description: 'Authentication failed: key_secret=rzp_x' } }));
    expect(status).toBe(500);
    expect(json.error).toBe(GENERIC_ERROR_MESSAGE);
  });

  it('turns common database errors into plain messages without their internals', async () => {
    const notFound = Object.assign(new Error('Invalid `prisma.order.update()` invocation: record to update not found'), { code: 'P2025' });
    const duplicate = Object.assign(new Error('Unique constraint failed on the fields: (`slug`)'), { code: 'P2002' });

    expect(await body(await handleError(notFound))).toEqual({ status: 404, json: expect.objectContaining({ error: 'Not found.' }) });
    expect(await body(await handleError(duplicate))).toEqual({ status: 409, json: expect.objectContaining({ error: 'This already exists.' }) });
  });

  it('catches errors from a route passed as a function', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const { status, json } = await body(
      await handleError(() => {
        throw new Error('S3 bucket miracle-prod access denied');
      })
    );
    expect(status).toBe(500);
    expect(json.error).toBe(GENERIC_ERROR_MESSAGE);
  });
});
