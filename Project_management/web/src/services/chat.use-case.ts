import { createAssistantReplyStream } from "@/services/chat.service";
import { ChatApiMessage } from "@/types/chat";

type ChatRepoPort = {
  findConversationById(userId: string, conversationId: string): { id: string } | undefined;
  createConversation(userId: string, title: string): { id: string };
  createMessage(input: { conversationId: string; role: "user" | "assistant"; content: string }): unknown;
  touchConversation(conversationId: string): void;
};

type CalculatorPort = {
  calculate(input: string): Promise<{ expression: string; result: number } | null>;
};

type CreateChatTurnParams = {
  repo: ChatRepoPort;
  calculator: CalculatorPort;
  client: unknown;
  model: string;
  userId: string;
  messages: ChatApiMessage[];
  conversationId?: string;
};

type ChatTurnResult = {
  conversationId: string;
  stream: AsyncGenerator<string, void, unknown>;
};

export async function createChatTurn({
  repo,
  calculator,
  client,
  model,
  userId,
  messages,
  conversationId,
}: CreateChatTurnParams): Promise<ChatTurnResult> {
  const lastUserMessage = [...messages].reverse().find((message) => message.role === "user");
  if (!lastUserMessage) {
    throw new Error("No user message found.");
  }

  const existingConversation = conversationId
    ? repo.findConversationById(userId, conversationId)
    : null;
  const resolvedConversationId =
    existingConversation?.id ??
    repo.createConversation(userId, lastUserMessage.content.slice(0, 80) || "New conversation").id;

  repo.createMessage({
    conversationId: resolvedConversationId,
    role: "user",
    content: lastUserMessage.content,
  });

  const mcpResult = await calculator.calculate(lastUserMessage.content).catch(() => null);
  const modelMessages = mcpResult
    ? [
        ...messages,
        {
          role: "system" as const,
          content: `Tool result from calculator: ${mcpResult.expression} = ${mcpResult.result}. Use this exact result when answering.`,
        },
      ]
    : messages;

  const modelStream = createAssistantReplyStream({
    client,
    model,
    messages: modelMessages,
  });

  async function* streamAndPersist() {
    let assistantReply = "";

    for await (const token of modelStream) {
      assistantReply += token;
      yield token;
    }

    if (!assistantReply.trim()) {
      throw new Error("No response returned from model.");
    }

    repo.createMessage({
      conversationId: resolvedConversationId,
      role: "assistant",
      content: assistantReply,
    });
    repo.touchConversation(resolvedConversationId);
  }

  return {
    conversationId: resolvedConversationId,
    stream: streamAndPersist(),
  };
}
