import { expect, test } from "@playwright/test";
import { getFixtures, resetOutsider } from "./support/db";
import { loginAs } from "./support/session";

test("greetings are handled locally and unavailable topics are refused", async ({
  page,
}) => {
  const fixtures = await getFixtures();
  await loginAs(page, "student");

  const greeting = await page.request.post("/api/v1/ai/chat", {
    data: {
      courseId: fixtures.courseId,
      messages: [{ role: "user", content: "hello" }],
    },
  });
  expect(greeting.status()).toBe(200);
  expect(await greeting.text()).toContain("assistant for");

  const unrelated = await page.request.post("/api/v1/ai/chat", {
    data: {
      courseId: fixtures.courseId,
      messages: [{ role: "user", content: "What is the weather in Paris?" }],
    },
  });
  expect(unrelated.status()).toBe(200);
  expect(await unrelated.text()).toContain("course material");
});

test("an un-enrolled student cannot use the course assistant", async ({
  page,
}) => {
  const fixtures = await getFixtures();
  await resetOutsider();
  await loginAs(page, "outsider");
  const response = await page.request.post("/api/v1/ai/chat", {
    data: {
      courseId: fixtures.courseId,
      messages: [{ role: "user", content: "hello" }],
    },
  });
  expect(response.status()).toBe(403);
});

test("the assistant endpoint validates message shape", async ({ page }) => {
  await loginAs(page, "student");
  const response = await page.request.post("/api/v1/ai/chat", {
    data: { courseId: "x", messages: [{ role: "user", content: " " }] },
  });
  expect(response.status()).toBe(400);
});
