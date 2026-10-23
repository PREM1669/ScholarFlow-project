export const REFUSAL_MESSAGE =
  "I can only help with questions about this course's material. Try asking about a topic from one of its sections.";

export const AI_LIMITS = {
  maxQuestionChars: 2000,
  maxHistoryMessages: 8,
  maxAssistantHistoryChars: 1500,
  maxContextChunks: 5,
  chunkChars: 1800,
  rateLimitCount: 20,
  rateLimitWindowMs: 10 * 60 * 1000,
} as const;
