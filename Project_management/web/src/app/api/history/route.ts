import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getStore } from "@/lib/store";
import { historyQuerySchema } from "@/lib/validation";
import { ChatHistoryResponse } from "@/types/chat";

export async function GET(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const parsedQuery = historyQuerySchema.safeParse({
    conversationId: searchParams.get("conversationId") ?? undefined,
  });

  if (!parsedQuery.success) {
    return NextResponse.json({ error: "Invalid conversationId." }, { status: 400 });
  }

  const store = getStore();
  const requestedConversationId = parsedQuery.data.conversationId;
  const payload = requestedConversationId
    ? store.getConversationWithMessages(userId, requestedConversationId)
    : store.getLatestConversationWithMessages(userId);
  const conversations = store.listConversations(userId);

  const response: ChatHistoryResponse = {
    conversationId: payload?.conversation.id ?? null,
    messages:
      payload?.messages.map((message) => ({
        id: message.id,
        role: message.role,
        content: message.content,
        createdAt: message.created_at,
      })) ?? [],
    conversations: conversations.map((conversation) => ({
      id: conversation.id,
      title: conversation.title,
      updatedAt: conversation.updated_at,
    })),
  };

  return NextResponse.json(response);
}
