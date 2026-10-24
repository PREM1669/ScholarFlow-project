import { expect, test } from "@playwright/test";
import { getFixtures } from "./support/db";
import { loginAs } from "./support/session";

const viewports = [
  { name: "mobile", width: 375, height: 812 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1280, height: 900 },
] as const;

for (const viewport of viewports) {
  test(`student pages fit without horizontal overflow at ${viewport.width}px`, async ({
    page,
  }) => {
    const fixtures = await getFixtures();
    await loginAs(page, "student");
    await page.setViewportSize(viewport);

    const paths = [
      "/student/courses",
      `/student/courses/${fixtures.courseId}`,
      `/student/courses/${fixtures.courseId}/learn?section=${fixtures.introSectionId}`,
      `/student/courses/${fixtures.courseId}/assistant?section=${fixtures.introSectionId}`,
    ];
    for (const path of paths) {
      await page.goto(path);
      await expect
        .poll(() =>
          page.evaluate(
            () =>
              document.documentElement.scrollWidth <=
              document.documentElement.clientWidth,
          ),
        )
        .toBe(true);
    }

    if (viewport.width < 1024) {
      const menu = page.getByRole("button", { name: "Open navigation menu" });
      await expect(menu).toBeVisible();
      await menu.click();
      await expect(
        page.getByRole("navigation", { name: "Mobile navigation" }),
      ).toBeVisible();
    } else {
      await expect(
        page.getByRole("navigation", { name: "Main navigation" }),
      ).toBeVisible();
    }
  });
}
