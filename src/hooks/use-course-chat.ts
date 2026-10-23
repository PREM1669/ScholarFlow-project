"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError } from "@/lib/api-client";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: string[];
};

function parseSources(value: string | null): string[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(decodeURIComponent(value));
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

export function useCourseChat(courseId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesRef = useRef<ChatMessage[]>([]);
  const streamingRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);
  const requestVersion = useRef(0);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);
  useEffect(() => () => abortRef.current?.abort(), []);

  const send = useCallback(
    async (text: string): Promise<boolean> => {
      const question = text.trim();
      if (!question || streamingRef.current) return false;

      const previous = messagesRef.current;
      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: question,
      };
      const assistantId = crypto.randomUUID();
      const history = [...previous, userMessage];
      const version = ++requestVersion.current;

      messagesRef.current = [
        ...history,
        { id: assistantId, role: "assistant", content: "" },
      ];
      setMessages(messagesRef.current);
      setError(null);
      streamingRef.current = true;
      setIsStreaming(true);

      const controller = new AbortController();
      abortRef.current = controller;
      const patch = (content: string, sources?: string[]) => {
        if (version !== requestVersion.current) return;
        const next = messagesRef.current.map((message) =>
          message.id === assistantId
            ? {
                ...message,
                content,
                ...(sources ? { sources } : {}),
              }
            : message,
        );
        messagesRef.current = next;
        setMessages(next);
      };

      let received = "";
      try {
        const response = await fetch("/api/v1/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            courseId,
            messages: history
              .slice(-12)
              .map(({ role, content }) => ({ role, content })),
          }),
          signal: controller.signal,
        });
        if (!response.ok) {
          let message = "The assistant is unavailable";
          try {
            const data: unknown = await response.json();
            if (
              typeof data === "object" &&
              data !== null &&
              "error" in data &&
              typeof data.error === "string"
            ) {
              message = data.error;
            }
          } catch {
            // Keep the generic message when the error response is not JSON.
          }
          throw new ApiError(response.status, message);
        }
        if (!response.body) {
          throw new Error("Your browser does not support streaming responses");
        }

        const sources = parseSources(response.headers.get("X-Sources"));
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          received += decoder.decode(value, { stream: true });
          patch(received);
        }
        received += decoder.decode();
        if (!received) throw new Error("The assistant returned an empty answer");
        patch(received, sources);
        return true;
      } catch (requestError) {
        if (version !== requestVersion.current) return true;
        if (controller.signal.aborted) {
          if (received) return true;
          messagesRef.current = previous;
          setMessages(previous);
          return false;
        }
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Something went wrong",
        );
        if (received) return true;
        messagesRef.current = previous;
        setMessages(previous);
        return false;
      } finally {
        if (version === requestVersion.current) {
          streamingRef.current = false;
          setIsStreaming(false);
          abortRef.current = null;
        }
      }
    },
    [courseId],
  );

  const stop = useCallback(() => abortRef.current?.abort(), []);
  const reset = useCallback(() => {
    requestVersion.current += 1;
    abortRef.current?.abort();
    abortRef.current = null;
    messagesRef.current = [];
    streamingRef.current = false;
    setMessages([]);
    setIsStreaming(false);
    setError(null);
  }, []);

  return { messages, isStreaming, error, send, stop, reset };
}
