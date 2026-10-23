import { AI_LIMITS } from "@/lib/ai/constants";

export type ChatTurn = { role: "user" | "assistant"; content: string };

export function normalizeMessages(messages: ChatTurn[]): ChatTurn[] {
  const merged: ChatTurn[] = [];
  for (const message of messages) {
    const previous = merged[merged.length - 1];
    if (previous && previous.role === message.role) {
      previous.content = `${previous.content}\n\n${message.content}`;
    } else {
      merged.push({ ...message });
    }
  }
  while (merged.length > 0 && merged[0].role !== "user") merged.shift();
  return merged;
}

export function prepareHistory(messages: ChatTurn[]): ChatTurn[] {
  const recent = messages
    .slice(-AI_LIMITS.maxHistoryMessages)
    .map((message) =>
      message.role === "assistant" &&
      message.content.length > AI_LIMITS.maxAssistantHistoryChars
        ? {
            ...message,
            content: message.content.slice(
              0,
              AI_LIMITS.maxAssistantHistoryChars,
            ),
          }
        : message,
    );
  return normalizeMessages(recent);
}
