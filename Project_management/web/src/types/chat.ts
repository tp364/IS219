export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt?: string;
};

export type ChatApiMessage = {
  role: ChatRole;
  content: string;
};

export type ChatApiRequest = {
  messages?: ChatApiMessage[];
  conversationId?: string;
};

export type ChatApiResponse = {
  reply?: string;
  error?: string;
  conversationId?: string;
};

export type ChatHistoryResponse = {
  conversationId: string | null;
  messages: ChatMessage[];
  conversations: ChatConversationSummary[];
};

export type ChatConversationSummary = {
  id: string;
  title: string;
  updatedAt: string;
};
