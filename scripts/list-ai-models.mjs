const provider = (process.env.AI_PROVIDER ?? "gemini").toLowerCase();

if (provider === "openai") {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    console.error("OPENAI_API_KEY is not set in .env");
    process.exit(1);
  }
  const response = await fetch("https://api.openai.com/v1/models", {
    headers: { Authorization: `Bearer ${key}` },
  });
  const data = await response.json();
  if (!response.ok) {
    console.error(response.status, data);
    process.exit(1);
  }
  console.log(
    data.data
      .map((model) => model.id)
      .sort()
      .join("\n"),
  );
} else if (provider === "gemini") {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    console.error("GEMINI_API_KEY is not set in .env");
    process.exit(1);
  }
  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models?pageSize=200",
    { headers: { "x-goog-api-key": key } },
  );
  const data = await response.json();
  if (!response.ok) {
    console.error(response.status, data);
    process.exit(1);
  }
  for (const model of data.models ?? []) {
    if ((model.supportedGenerationMethods ?? []).includes("generateContent")) {
      console.log(model.name.replace(/^models\//, ""));
    }
  }
} else {
  console.error(`Unsupported AI_PROVIDER "${provider}". Use gemini or openai.`);
  process.exit(1);
}
