import { z } from "zod";
import { HttpError, handleApiError } from "@/lib/api-error";
import { ApiError, apiFetch } from "@/lib/api-client";
import {
  cn,
  formatMoney,
  formatPrice,
  isActivePath,
} from "@/lib/utils";

afterEach(() => jest.restoreAllMocks());

describe("handleApiError", () => {
  it("returns the status and message for HttpError", async () => {
    const response = handleApiError(new HttpError(404, "Course not found"));
    expect(response.status).toBe(404);
    expect(await response.json()).toMatchObject({ error: "Course not found" });
  });

  it("returns structured validation errors for ZodError", async () => {
    const parsed = z.object({ title: z.string().min(3) }).safeParse({ title: "x" });
    if (parsed.success) throw new Error("Expected validation to fail");
    const response = handleApiError(parsed.error);
    const body = await response.json();
    expect(response.status).toBe(400);
    expect(body.error).toContain("string");
    expect(body.issues.title).toHaveLength(1);
  });

  it("hides unexpected error details behind a generic response", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    const response = handleApiError(new Error("private database detail"));
    expect(response.status).toBe(500);
    expect(JSON.stringify(await response.json())).not.toContain("private");
  });
});

describe("apiFetch", () => {
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    });

  it("returns JSON on success", async () => {
    jest.spyOn(globalThis, "fetch").mockResolvedValue(json({ ok: true }));
    await expect(apiFetch("/x")).resolves.toEqual({ ok: true });
  });

  it("preserves API status and message for failed requests", async () => {
    jest
      .spyOn(globalThis, "fetch")
      .mockImplementation(async () => json({ error: "Forbidden" }, 403));
    await expect(apiFetch("/x")).rejects.toBeInstanceOf(ApiError);
    await expect(apiFetch("/x")).rejects.toMatchObject({ status: 403 });
    await expect(apiFetch("/x")).rejects.toHaveProperty("message", "Forbidden");
  });

  it("uses a generic error for non-JSON failure bodies", async () => {
    jest.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("not json", { status: 500 }),
    );
    await expect(apiFetch("/x")).rejects.toMatchObject({
      status: 500,
      message: "Request failed",
    });
  });

  it("adds JSON headers for JSON bodies and leaves FormData alone", async () => {
    const fetchSpy = jest
      .spyOn(globalThis, "fetch")
      .mockImplementation(async () => json({}));
    await apiFetch("/x", { method: "POST", body: JSON.stringify({ a: 1 }) });
    expect(
      (fetchSpy.mock.calls[0][1]?.headers as Headers).get("Content-Type"),
    ).toBe("application/json");
    await apiFetch("/x", { method: "POST", body: new FormData() });
    expect((fetchSpy.mock.calls[1][1]?.headers as Headers).has("Content-Type")).toBe(
      false,
    );
  });
});

describe("utility formatting", () => {
  it("merges Tailwind classes and formats money", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
    expect(cn("a", false && "b", "c")).toBe("a c");
    expect(formatPrice(0)).toBe("Free");
    expect(formatPrice(19.5)).toBe("$19.50");
    expect(formatMoney(1234.5)).toMatch(/\$1.?234.?50/);
  });

  it("matches path segment boundaries", () => {
    expect(isActivePath("/student/courses/abc", "/student/courses")).toBe(true);
    expect(isActivePath("/student/courses", "/student/courses")).toBe(true);
    expect(isActivePath("/student/courses-old", "/student/courses")).toBe(false);
  });
});
