import { expect, test } from "@playwright/test";
import { getFixtures, resetStudent } from "./support/db";
import { loginAs } from "./support/session";

test.beforeEach(async () => {
  await resetStudent();
});

test("a student submits text for an enrolled course assignment", async ({
  page,
}) => {
  const fixtures = await getFixtures();
  await loginAs(page, "student");
  await page.goto("/student/assignments");
  await page.getByRole("link", { name: /ScholarFlow E2E Assignment/ }).click();
  await page.getByLabel("Text answer").fill("Flexbox arranges items in a row or column.");
  await page.getByRole("button", { name: "Submit assignment" }).click();
  await expect(page.getByText("Submitted", { exact: true })).toBeVisible();
});

test("empty and oversized text-only submissions are rejected", async ({
  page,
}) => {
  const fixtures = await getFixtures();
  await loginAs(page, "student");
  const empty = await page.request.put(
    `/api/v1/assignments/${fixtures.assignmentId}/submission`,
    { multipart: { textAnswer: "" } },
  );
  expect(empty.status()).toBe(400);

  const oversized = await page.request.put(
    `/api/v1/assignments/${fixtures.assignmentId}/submission`,
    { multipart: { textAnswer: "x".repeat(5001) } },
  );
  expect(oversized.status()).toBe(400);
});
