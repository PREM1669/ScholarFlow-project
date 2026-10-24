export const E2E_DOMAIN = "e2e.scholarflow.dev";
export const PASSWORD = "ScholarFlow-E2E-Password-2026!";
export const USERS = {
  student: `sf-e2e-student@${E2E_DOMAIN}`,
  instructor: `sf-e2e-instructor@${E2E_DOMAIN}`,
  admin: `sf-e2e-admin@${E2E_DOMAIN}`,
  outsider: `sf-e2e-outsider@${E2E_DOMAIN}`,
  otherInstructor: `sf-e2e-other-instructor@${E2E_DOMAIN}`,
} as const;

export type AuthKey = keyof typeof USERS;
