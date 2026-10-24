import { expect, test } from "@playwright/test";
import { getFixtures, resetOutsider } from "./support/db";
import { loginAs } from "./support/session";

test("an un-enrolled student enrolls in a published free course", async ({
  page,
}) => {
  const fixtures = await getFixtures();
  await resetOutsider();
  await loginAs(page, "outsider");
  await page.goto(`/student/courses/${fixtures.courseId}`);
  await page.getByRole("button", { name: "Enroll for free" }).click();
  await expect(page).toHaveURL(
    new RegExp(`/student/courses/${fixtures.courseId}/learn`),
  );
  await expect(page.getByRole("heading", { name: "E2E Intro" })).toBeVisible();
});
