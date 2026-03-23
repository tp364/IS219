"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Button } from "@/components/ui/button";
import { env } from "@/env";
import { useChat } from "@/hooks/use-chat";
import { cn } from "@/lib/utils";

type ChatShellProps = {
  userEmail: string;
};

function formatTime(createdAt?: string) {
  const date = createdAt ? new Date(createdAt) : new Date();

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function ChatShell({ userEmail }: ChatShellProps) {
  const {
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
  } = useChat();
  const [showThreads, setShowThreads] = useState(false);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#02040a] text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(37,99,235,0.28),transparent_40%),radial-gradient(circle_at_82%_100%,rgba(15,23,42,0.95),transparent_55%)]" />

      <header className="relative z-10 border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="mx-auto flex h-24 w-full max-w-[1600px] items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-content-center rounded-xl bg-gradient-to-b from-cyan-400 to-blue-600 text-sm font-bold text-white shadow-lg shadow-blue-600/35">
              CB
            </div>
            <div>
              <h1 className="text-4xl font-semibold tracking-tight text-white">
                {env.NEXT_PUBLIC_APP_NAME}
              </h1>
              <p className="text-xs text-slate-400">{userEmail}</p>
            </div>
          </div>

          <div className="relative flex items-center gap-3">
            <Button
              type="button"
              onClick={newConversation}
              className="h-14 rounded-2xl border border-white/20 bg-transparent px-8 text-xl text-white hover:bg-white/10"
            >
              New Chat
            </Button>
            <button
              type="button"
              aria-label="Show conversations"
              onClick={() => setShowThreads((value) => !value)}
              className="grid h-12 w-12 place-content-center rounded-xl text-3xl text-slate-300 hover:bg-white/10"
            >
              ...
            </button>

            {showThreads ? (
              <div className="absolute top-16 right-0 w-80 rounded-2xl border border-white/15 bg-slate-950/95 p-3 shadow-2xl">
                <p className="mb-2 px-2 text-xs font-semibold tracking-wide text-slate-400 uppercase">
                  Conversations
                </p>
                <div className="max-h-80 space-y-2 overflow-auto">
                  {conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={cn(
                        "rounded-lg border p-2",
                        conversation.id === conversationId
                          ? "border-blue-500/80 bg-blue-600/20"
                          : "border-white/10 bg-white/5",
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          void selectConversation(conversation.id);
                          setShowThreads(false);
                        }}
                        className="w-full truncate text-left text-sm font-medium text-slate-100"
                      >
                        {conversation.title}
                      </button>
                      <div className="mt-1 flex gap-2">
                        <button
                          type="button"
                          className="text-xs text-slate-300"
                          onClick={() => {
                            const title = window.prompt("Rename conversation", conversation.title);
                            if (title) void renameConversation(conversation.id, title);
                          }}
                        >
                          Rename
                        </button>
                        <button
                          type="button"
                          className="text-xs text-red-300"
                          onClick={() => void deleteConversation(conversation.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <section className="relative z-10 mx-auto flex w-full max-w-[1600px] flex-1 flex-col px-6 pb-40">
        <div className="mt-6 flex flex-col gap-6 overflow-y-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}
            >
              {message.role === "assistant" ? (
                <div className="flex max-w-4xl items-start gap-4">
                  <div className="mt-2 grid h-14 w-14 shrink-0 place-content-center rounded-full bg-emerald-500/20 text-lg font-semibold text-emerald-200">
                    AI
                  </div>
                  <div className="text-4 rounded-3xl border border-white/10 bg-white/10 px-6 py-4 leading-8 text-slate-100 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-md">
                    <div className="[&_a]:underline [&_code]:rounded [&_code]:bg-white/15 [&_code]:px-1 [&_code]:py-0.5 [&_pre]:overflow-x-auto [&_pre]:rounded [&_pre]:bg-black/30 [&_pre]:p-2">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                    </div>
                    <p className="mt-2 text-right text-sm text-slate-400">{formatTime(message.createdAt)}</p>
                  </div>
                </div>
              ) : (
                <div className="max-w-2xl">
                  <div className="text-4 rounded-3xl rounded-br-md bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-4 leading-8 text-white shadow-[0_12px_32px_rgba(37,99,235,0.45)]">
                    {message.content}
                  </div>
                  <p className="mt-2 text-right text-sm text-blue-200/80">{formatTime(message.createdAt)}</p>
                </div>
              )}
            </div>
          ))}
          {isLoading ? <p className="text-sm text-slate-400">Thinking...</p> : null}
        </div>
      </section>

      <form
        onSubmit={submitMessage}
        className="fixed right-0 bottom-0 left-0 z-20 border-t border-white/10 bg-black/35 p-4 backdrop-blur-xl"
      >
        <div className="mx-auto flex w-full max-w-[1600px] items-center gap-3 rounded-full border border-white/20 bg-[#020617]/90 px-4 py-3 shadow-2xl">
          <button
            type="button"
            className="grid h-12 w-12 place-content-center text-2xl text-slate-400"
          >
            +
          </button>
          <textarea
            id="chat-input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Type your message..."
            className="h-12 w-full resize-none bg-transparent px-2 py-3 text-xl text-slate-200 placeholder:text-slate-500 focus:outline-none"
          />
          <Button
            type="submit"
            className="h-12 w-12 rounded-full bg-blue-600 p-0 text-xl hover:bg-blue-500"
            disabled={!canSend || isLoading}
          >
            {"->"}
          </Button>
          <button
            type="button"
            className="grid h-12 w-12 place-content-center text-2xl text-slate-400"
          >
            o
          </button>
        </div>
        {error ? (
          <p className="mx-auto mt-2 w-full max-w-[1600px] text-sm text-red-300">{error}</p>
        ) : null}
      </form>
    </main>
  );
}
