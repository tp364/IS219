import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { DEFAULT_OPENAI_MODEL } from "@/config/chat";
import { logger } from "@/lib/logger";
import { calculateViaMcp } from "@/lib/mcp-client";
import { getOpenAIClient, getOpenAIModel } from "@/lib/openai";
import { getStore } from "@/lib/store";
import { chatRequestSchema } from "@/lib/validation";
import { createChatTurn } from "@/services/chat.use-case";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let client;
  let model = DEFAULT_OPENAI_MODEL;

  try {
    client = getOpenAIClient();
    model = getOpenAIModel();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid OpenAI configuration.";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const parsedBody = chatRequestSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsedBody.success) {
    return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
  }

  try {
    const store = getStore();
    const turn = await createChatTurn({
      repo: store,
      calculator: {
        calculate: calculateViaMcp,
      },
      client,
      model,
      userId,
      messages: parsedBody.data.messages,
      conversationId: parsedBody.data.conversationId,
    });

    logger.info({ model, messageCount: parsedBody.data.messages.length }, "processing chat request");

    const encoder = new TextEncoder();
    const responseStream = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const token of turn.stream) {
            controller.enqueue(encoder.encode(token));
          }

          controller.close();
        } catch (streamError) {
          if (streamError instanceof Error && streamError.message.includes("No response")) {
            logger.warn("model returned empty reply");
          }
          controller.error(streamError);
        }
      },
    });

    return new Response(responseStream, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Conversation-Id": turn.conversationId,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected server error.";
    logger.error({ err: error }, "chat request failed");
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
