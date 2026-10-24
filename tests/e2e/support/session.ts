import type { Browser, Page } from "@playwright/test";
import { USERS, PASSWORD, type AuthKey } from "./users";

export async function loginAs(page: Page, user: AuthKey) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(USERS[user]);
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByRole("button", { name: "Log in" }).click();
  await page.waitForURL(/\/(student|instructor|admin)\//);
}

export async function freshSession(browser: Browser, user: AuthKey) {
  const context = await browser.newContext();
  const page = await context.newPage();
  await loginAs(page, user);
  return { context, page };
}

export async function openAs(
  browser: Browser,
  user: AuthKey,
  path: string,
) {
  const session = await freshSession(browser, user);
  await session.page.goto(path);
  return session;
}
