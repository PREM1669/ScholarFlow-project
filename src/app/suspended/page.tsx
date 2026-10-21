import { SignOutButton } from "@/components/shared/sign-out-button";

export default function SuspendedPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-4 text-center">
      <h1 className="text-2xl font-bold">Account suspended</h1>
      <p className="text-muted-foreground">
        Contact an administrator if you think this is a mistake.
      </p>
      <SignOutButton />
    </main>
  );
}
