import { z } from "zod";

const uniqueIds = z
  .array(z.string().uuid())
  .max(200, "Demasiado material en una sola sesión")
  .transform((ids) => [...new Set(ids)]);

export const createSessionSchema = z.object({
  title: z.string().trim().max(120).nullable(),
  folderIds: uniqueIds,
  noteIds: uniqueIds,
  targetMinutes: z.number().int().min(1).max(240),
});

export const settleSessionSchema = z.object({
  sessionId: z.string().uuid(),
  studyMinutes: z
    .number()
    .finite()
    .nonnegative()
    .max(24 * 60),
  breakMinutes: z
    .number()
    .finite()
    .nonnegative()
    .max(24 * 60)
    .default(0),
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>;
