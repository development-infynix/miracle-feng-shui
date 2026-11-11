import { z } from 'zod';

/** Marks one notification read with `id`, or all of them without it. */
export const markNotificationsReadSchema = z.object({ id: z.string().min(1).max(100).optional() });
