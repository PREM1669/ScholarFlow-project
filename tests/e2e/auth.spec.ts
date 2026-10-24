import { expect, test } from "@playwright/test";
import { USERS } from "./support/users";
import { loginAs } from "./support/session";

test("a student session survives reload and sign out ends it", async ({
  page,
}) => {
  await loginAs(page, "student");
  await expect(page.getByRole("button", { name: "Sign out" })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("button", { name: "Sign out" })).toBeVisible();
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/login/);
});

test("visitors are redirected away from protected portals", async ({ page }) => {
  await page.goto("/admin/dashboard");
  await expect(page).toHaveURL(/\/login/);
});

test("registration rejects admin role assignment", async ({ request }) => {
  const response = await request.post("/api/v1/auth/register", {
    data: {
      name: "E2E Admin Attempt",
      email: `sf-e2e-admin-attempt-${Date.now()}@e2e.scholarflow.dev`,
      password: "ScholarFlow-E2E-Password-2026!",
      role: "ADMIN",
    },
  });
  expect(response.status()).toBe(400);
});

test("the registered account fixtures use isolated E2E addresses", () => {
  expect(USERS.student).toMatch(/@e2e\.scholarflow\.dev$/);
});
