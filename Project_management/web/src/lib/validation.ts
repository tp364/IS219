import { z } from "zod";

const chatRoleSchema = z.enum(["user", "assistant"]);

export const chatMessageSchema = z.object({
  role: chatRoleSchema,
  content: z.string().trim().min(1).max(8000),
});

export const chatRequestSchema = z.object({
  messages: z.array(chatMessageSchema).min(1),
  conversationId: z.string().trim().min(1).optional(),
});

export const historyQuerySchema = z.object({
  conversationId: z.string().trim().min(1).optional(),
});

export const renameConversationSchema = z.object({
  conversationId: z.string().trim().min(1),
  title: z.string().trim().min(1).max(80),
});

export const deleteConversationSchema = z.object({
  conversationId: z.string().trim().min(1),
});

export type ChatRequestInput = z.infer<typeof chatRequestSchema>;
