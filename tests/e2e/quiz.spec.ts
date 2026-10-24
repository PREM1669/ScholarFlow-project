import { expect, test } from "@playwright/test";
import { getFixtures, resetStudent } from "./support/db";
import { loginAs } from "./support/session";

test.beforeEach(async () => {
  await resetStudent();
});

test("a student submits a quiz and sees the server-graded result", async ({
  page,
}) => {
  const fixtures = await getFixtures();
  await loginAs(page, "student");
  await page.goto(
    `/student/courses/${fixtures.courseId}/learn?section=${fixtures.quizSectionId}`,
  );
  await page.getByLabel("Flexbox", { exact: true }).check();
  await expect(page.getByText("Selected answer")).toBeVisible();
  await page.getByRole("button", { name: "Submit answers" }).click();
  await expect(page.getByText("Correct", { exact: true })).toBeVisible();
  await expect(page.getByText("1/1 · 100%")).toBeVisible();
});

test("a student cannot retrieve lesson content before enrollment", async ({
  page,
}) => {
  const fixtures = await getFixtures();
  await loginAs(page, "outsider");
  const response = await page.request.get(
    `/api/v1/learn/${fixtures.courseId}`,
  );
  expect(response.status()).toBe(403);
});
