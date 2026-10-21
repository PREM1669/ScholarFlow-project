import Link from "next/link";
import { AuthCard } from "@/components/shared/auth-card";
import { RegisterForm } from "./register-form";

export default function RegisterPage() {
  return (
    <AuthCard
      title="Create your account"
      description="Join as a student or instructor"
    >
      <RegisterForm />
      <p className="mt-4 text-center text-sm text-muted-foreground">
        Already registered?{" "}
        <Link href="/login" className="underline">
          Log in
        </Link>
      </p>
    </AuthCard>
  );
}
