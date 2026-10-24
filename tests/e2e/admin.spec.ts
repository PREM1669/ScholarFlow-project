import { expect, test } from "@playwright/test";
import { loginAs } from "./support/session";

test("an admin can access analytics and user-management pages", async ({
  page,
}) => {
  await loginAs(page, "admin");
  await page.goto("/admin/dashboard");
  await expect(
    page.getByRole("heading", { name: /Analytics/ }),
  ).toBeVisible();
  await expect(page.getByText("Total users")).toBeVisible();
  const analytics = await page.request.get("/api/v1/admin/analytics?days=7");
  expect(analytics.status()).toBe(200);

  await page.goto("/admin/users");
  await expect(
    page.getByRole("heading", { name: /User management|Users/ }),
  ).toBeVisible();
});

test("student role is refused by admin APIs", async ({ page }) => {
  await loginAs(page, "student");
  const response = await page.request.get("/api/v1/admin/analytics?days=7");
  expect(response.status()).toBe(403);
});
