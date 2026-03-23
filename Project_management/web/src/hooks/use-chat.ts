import { FormEvent, useEffect, useMemo, useState } from "react";
import { nanoid } from "nanoid";

import { ChatConversationSummary, ChatHistoryResponse, ChatMessage } from "@/types/chat";

const starterMessage: ChatMessage = {
  id: "assistant-welcome",
  role: "assistant",
  content: "Your chat is connected. Add your API key in .env.local and start talking.",
  createdAt: new Date().toISOString(),
};

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([starterMessage]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<ChatConversationSummary[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSend = useMemo(() => input.trim().length > 0 && !isLoading, [input, isLoading]);

  useEffect(() => {
    async function loadHistory(conversationIdParam?: string) {
      try {
        const query = conversationIdParam
          ? `?conversationId=${encodeURIComponent(conversationIdParam)}`
          : "";
        const response = await fetch(`/api/history${query}`);
        if (!response.ok) return;
        const data = (await response.json()) as ChatHistoryResponse;
        if (data.messages.length > 0) {
          setMessages(data.messages);
        } else {
          setMessages([starterMessage]);
        }
        setConversationId(data.conversationId);
        setConversations(data.conversations);
      } catch {
        // ignore history load failures in UI bootstrap
      }
    }

    void loadHistory();
  }, []);

  async function refreshConversations(conversationIdParam?: string) {
    const query = conversationIdParam
      ? `?conversationId=${encodeURIComponent(conversationIdParam)}`
      : "";
    const response = await fetch(`/api/history${query}`);
    if (!response.ok) return;
    const data = (await response.json()) as ChatHistoryResponse;
    setConversations(data.conversations);
    setConversationId(data.conversationId);
    setMessages(data.messages.length > 0 ? data.messages : [starterMessage]);
  }

  async function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSend) return;

    const userMessage: ChatMessage = {
      id: nanoid(),
      role: "user",
      content: input.trim(),
      createdAt: new Date().toISOString(),
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      const assistantMessageId = nanoid();
      setMessages((prev) => [
        ...prev,
        {
          id: assistantMessageId,
          role: "assistant",
          content: "",
          createdAt: new Date().toISOString(),
        },
      ]);

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversationId,
          messages: nextMessages.map((message) => ({
            role: message.role,
            content: message.content,
          })),
        }),
      });

      if (!response.ok || !response.body) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? "Failed to get a response from the API.");
      }

      const nextConversationId = response.headers.get("X-Conversation-Id");
      if (nextConversationId) {
        setConversationId(nextConversationId);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullReply = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const token = decoder.decode(value, { stream: true });
        fullReply += token;
        setMessages((prev) =>
          prev.map((message) =>
            message.id === assistantMessageId ? { ...message, content: fullReply } : message,
          ),
        );
      }

      await refreshConversations(nextConversationId ?? conversationId ?? undefined);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected error.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  function newConversation() {
    setConversationId(null);
    setMessages([starterMessage]);
    setError(null);
  }

  async function selectConversation(nextConversationId: string) {
    await refreshConversations(nextConversationId);
  }

  async function renameConversation(targetConversationId: string, title: string) {
    if (!title.trim()) return;
    const response = await fetch("/api/conversations", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        conversationId: targetConversationId,
        title,
      }),
    });
    if (!response.ok) return;
    await refreshConversations(conversationId ?? undefined);
  }

  async function deleteConversation(targetConversationId: string) {
    const response = await fetch(
      `/api/conversations?conversationId=${encodeURIComponent(targetConversationId)}`,
      { method: "DELETE" },
    );
    if (!response.ok) return;
    const nextId =
      conversationId === targetConversationId ? undefined : (conversationId ?? undefined);
    await refreshConversations(nextId);
  }

  return {
    conversations,
    conversationId,
    messages,
    input,
    setInput,
    isLoading,
    error,
    canSend,
    submitMessage,
    newConversation,
    selectConversation,
    renameConversation,
    deleteConversation,
  };
}
