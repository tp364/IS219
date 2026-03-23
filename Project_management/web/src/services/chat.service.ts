import { SYSTEM_PROMPT } from "@/config/chat";
import { ChatApiMessage } from "@/types/chat";

type ChatStreamChunk = {
  choices?: Array<{
    delta?: {
      content?: string | null;
    };
  }>;
};

type CreateReplyParams = {
  client: unknown;
  model: string;
  messages: Array<ChatApiMessage | { role: "system"; content: string }>;
};

export async function* createAssistantReplyStream({ client, model, messages }: CreateReplyParams) {
  const typedClient = client as {
    chat: {
      completions: {
        create: (...args: unknown[]) => Promise<AsyncIterable<ChatStreamChunk>>;
      };
    };
  };

  const stream = await typedClient.chat.completions.create({
    model,
    messages: [
      {
        role: "system",
        content: SYSTEM_PROMPT,
      },
      ...messages,
    ],
    temperature: 0.7,
    stream: true,
  });

  for await (const chunk of stream) {
    const token = chunk.choices?.[0]?.delta?.content ?? "";
    if (token) {
      yield token;
    }
  }
}
