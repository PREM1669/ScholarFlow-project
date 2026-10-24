import { expect, test } from "@playwright/test";
import { getFixtures } from "./support/db";
import { loginAs } from "./support/session";

test("instructors can see only their own courses", async ({ page, browser }) => {
  const fixtures = await getFixtures();
  await loginAs(page, "instructor");
  const ownCourses = await page.request.get("/api/v1/courses");
  expect(ownCourses.status()).toBe(200);
  expect(await ownCourses.text()).toContain("ScholarFlow E2E Course");

  const other = await browser.newPage();
  await loginAs(other, "otherInstructor");
  const denied = await other.request.get(`/api/v1/courses/${fixtures.courseId}`);
  expect(denied.status()).toBe(403);
  await other.close();
});

test("instructors can create an unpublished course through the course API", async ({
  page,
}) => {
  await loginAs(page, "instructor");
  const response = await page.request.post("/api/v1/courses", {
    data: {
      title: `E2E Draft ${Date.now()}`,
      description: "A temporary course used to verify the authoring API.",
      category: "Programming",
      price: 0,
    },
  });
  expect(response.status()).toBe(201);
  expect((await response.json()).published).toBe(false);
});
