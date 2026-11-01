import { z } from "npm:zod@3";
import { boundedJson } from "./request-auth.ts";

export const contextSchema = z.object({
  type: z.string().min(1).max(64), targetUserId: z.string().uuid().optional(),
  conversationId: z.string().uuid().optional(),
  lastMessages: z.array(z.object({ text: z.string().max(2000), isMine: z.boolean() })).max(6).optional(),
  context: z.unknown().optional(),
});
export const avatarSchema = z.object({ targetUserId: z.string().uuid(), question: z.string().min(1).max(2000),
  history: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(2000) })).max(6).optional() });

export async function parseAiRequest<T>(req: Request, schema: z.ZodType<T>) {
  return schema.parse(await boundedJson(req, 32768));
}