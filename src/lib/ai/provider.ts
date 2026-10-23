import { HttpError } from "@/lib/api-error";
import { readSseData } from "@/lib/ai/sse";
import type { ChatTurn } from "@/lib/ai/messages";

type StreamArgs = {
  system: string;
  messages: ChatTurn[];
  signal?: AbortSignal;
};

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    console.error(`[ai] ${name} is not set`);
    throw new HttpError(503, "The AI assistant is not configured yet");
  }
  return value;
}

function redact(value: string, secret: string) {
  return secret ? value.split(secret).join("[redacted]") : value;
}

async function assertOk(response: Response, provider: string, key: string) {
  if (response.ok) return;
  const detail = redact(await response.text(), key);
  console.error(
    `[ai] ${provider} responded ${response.status}: ${detail.slice(0, 500)}`,
  );
  if (response.status === 429) {
    throw new HttpError(
      429,
      "The AI service is busy right now. Please try again in a moment.",
    );
  }
  throw new HttpError(503, "The AI assistant is temporarily unavailable");
}

type GeminiChunk = {
  candidates?: {
    content?: { parts?: { text?: string; thought?: boolean }[] };
  }[];
  promptFeedback?: { blockReason?: string };
};

async function* geminiStream({
  system,
  messages,
  signal,
}: StreamArgs): AsyncGenerator<string> {
  const key = requireEnv("GEMINI_API_KEY");
  const model = requireEnv("GEMINI_MODEL").replace(/^models\//, "");
  let response: Response;
  try {
    response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:streamGenerateContent?alt=sse`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": key,
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: messages.map((message) => ({
            role: message.role === "assistant" ? "model" : "user",
            parts: [{ text: message.content }],
          })),
        }),
        signal,
      },
    );
  } catch (error) {
    if (signal?.aborted) throw error;
    console.error("[ai] Gemini request failed", error);
    throw new HttpError(503, "The AI assistant is temporarily unavailable");
  }
  await assertOk(response, "gemini", key);
  if (!response.body) {
    throw new HttpError(502, "The AI service returned an empty response");
  }

  for await (const data of readSseData(response.body)) {
    let json: GeminiChunk;
    try {
      json = JSON.parse(data) as GeminiChunk;
    } catch {
      continue;
    }
    if (json.promptFeedback?.blockReason) {
      throw new HttpError(
        422,
        "The assistant couldn't answer that. Try rephrasing your question.",
      );
    }
    const parts = json.candidates?.[0]?.content?.parts ?? [];
    const text = parts
      .filter((part) => !part.thought && typeof part.text === "string")
      .map((part) => part.text)
      .join("");
    if (text) yield text;
  }
}

async function* openaiStream({
  system,
  messages,
  signal,
}: StreamArgs): AsyncGenerator<string> {
  const key = requireEnv("OPENAI_API_KEY");
  const model = requireEnv("OPENAI_MODEL");
  let response: Response;
  try {
    response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model,
        stream: true,
        messages: [{ role: "system", content: system }, ...messages],
      }),
      signal,
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    console.error("[ai] OpenAI request failed", error);
    throw new HttpError(503, "The AI assistant is temporarily unavailable");
  }
  await assertOk(response, "openai", key);
  if (!response.body) {
    throw new HttpError(502, "The AI service returned an empty response");
  }

  for await (const data of readSseData(response.body)) {
    if (data === "[DONE]") return;
    let json: { choices?: { delta?: { content?: string } }[] };
    try {
      json = JSON.parse(data) as typeof json;
    } catch {
      continue;
    }
    const text = json.choices?.[0]?.delta?.content;
    if (typeof text === "string" && text) yield text;
  }
}

export function streamChat(args: StreamArgs): AsyncGenerator<string> {
  const provider = (process.env.AI_PROVIDER ?? "gemini").trim().toLowerCase();
  if (provider === "gemini") return geminiStream(args);
  if (provider === "openai") return openaiStream(args);
  console.error(`[ai] Unknown AI_PROVIDER "${provider}"`);
  throw new HttpError(503, "The AI assistant is not configured yet");
}
