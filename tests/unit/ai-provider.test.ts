import { streamChat } from "@/lib/ai/provider";

const originalEnv = { ...process.env };
const createSseResponse = (lines: string[]) =>
  new Response(
    lines.map((line) => `data: ${line}\n\n`).join(""),
    { status: 200, headers: { "Content-Type": "text/event-stream" } },
  );
const collect = async (stream: AsyncGenerator<string>) => {
  const chunks: string[] = [];
  for await (const chunk of stream) chunks.push(chunk);
  return chunks;
};

beforeEach(() => {
  jest.restoreAllMocks();
  process.env.AI_PROVIDER = "gemini";
  process.env.GEMINI_API_KEY = "unit-test-key";
  process.env.GEMINI_MODEL = "models/gemini-test";
  process.env.OPENAI_API_KEY = "unit-test-openai-key";
  process.env.OPENAI_MODEL = "test-model";
});

afterAll(() => {
  process.env = originalEnv;
});

describe("Gemini adapter", () => {
  it("sends a Gemini request and emits non-thought response text", async () => {
    const fetchMock = jest.spyOn(globalThis, "fetch").mockResolvedValue(
      createSseResponse([
        '{"candidates":[{"content":{"parts":[{"text":"Hello"},{"text":"secret thought","thought":true},{"text":" there"}]}}]}',
      ]),
    );
    await expect(
      collect(streamChat({ system: "system", messages: [{ role: "user", content: "hi" }] })),
    ).resolves.toEqual(["Hello there"]);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/models/gemini-test:streamGenerateContent"),
      expect.objectContaining({
        headers: expect.objectContaining({ "x-goog-api-key": "unit-test-key" }),
      }),
    );
  });

  it("reports missing config, blocked prompts, and HTTP failures", async () => {
    const log = jest.spyOn(console, "error").mockImplementation(() => {});
    delete process.env.GEMINI_API_KEY;
    await expect(collect(streamChat({ system: "", messages: [] }))).rejects.toMatchObject({
      status: 503,
    });

    process.env.GEMINI_API_KEY = "unit-test-key";
    jest.spyOn(globalThis, "fetch").mockResolvedValue(
      createSseResponse(['{"promptFeedback":{"blockReason":"SAFETY"}}']),
    );
    await expect(collect(streamChat({ system: "", messages: [] }))).rejects.toMatchObject({
      status: 422,
    });

    jest.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("request failed unit-test-key", { status: 429 }),
    );
    await expect(collect(streamChat({ system: "", messages: [] }))).rejects.toMatchObject({
      status: 429,
    });
    expect(JSON.stringify(log.mock.calls)).not.toContain("unit-test-key");
  });
});

describe("OpenAI adapter and provider selection", () => {
  it("emits streamed deltas until the done marker", async () => {
    process.env.AI_PROVIDER = " OpenAI ";
    const fetchMock = jest.spyOn(globalThis, "fetch").mockResolvedValue(
      createSseResponse([
        '{"choices":[{"delta":{"content":"Hello"}}]}',
        '{"choices":[{"delta":{"content":"!"}}]}',
        "[DONE]",
      ]),
    );
    await expect(
      collect(streamChat({ system: "system", messages: [{ role: "assistant", content: "earlier" }] })),
    ).resolves.toEqual(["Hello", "!"]);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.openai.com/v1/chat/completions",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer unit-test-openai-key",
        }),
      }),
    );
  });

  it("rejects unknown providers and missing response bodies", async () => {
    const log = jest.spyOn(console, "error").mockImplementation(() => {});
    process.env.AI_PROVIDER = "unknown";
    expect(() => streamChat({ system: "", messages: [] })).toThrow(
      "The AI assistant is not configured yet",
    );

    process.env.AI_PROVIDER = "openai";
    jest
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(null, { status: 200 }));
    await expect(collect(streamChat({ system: "", messages: [] }))).rejects.toMatchObject({
      status: 502,
    });
    expect(log).toHaveBeenCalled();
  });
});
