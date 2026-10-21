import { Suspense } from "react";
import Link from "next/link";
import { AuthCard } from "@/components/shared/auth-card";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <AuthCard title="Welcome back" description="Log in to continue learning">
      <Suspense>
        <LoginForm />
      </Suspense>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        No account?{" "}
        <Link href="/register" className="underline">
          Register
        </Link>
      </p>
    </AuthCard>
  );
}
