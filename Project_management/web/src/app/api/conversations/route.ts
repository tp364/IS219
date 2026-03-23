import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getStore } from "@/lib/store";
import { deleteConversationSchema, renameConversationSchema } from "@/lib/validation";

export async function PATCH(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsedBody = renameConversationSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsedBody.success) {
    return NextResponse.json({ error: "conversationId and title are required." }, { status: 400 });
  }

  const store = getStore();
  const updated = store.renameConversation(
    userId,
    parsedBody.data.conversationId,
    parsedBody.data.title,
  );
  if (!updated) {
    return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const parsedQuery = deleteConversationSchema.safeParse({
    conversationId: searchParams.get("conversationId") ?? undefined,
  });

  if (!parsedQuery.success) {
    return NextResponse.json({ error: "conversationId is required." }, { status: 400 });
  }

  const store = getStore();
  const deleted = store.deleteConversation(userId, parsedQuery.data.conversationId);
  if (!deleted) {
    return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
