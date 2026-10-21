"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { registerSchema, type RegisterInput } from "@/lib/validators/auth";

export function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", role: "STUDENT" },
  });

  async function onSubmit(values: RegisterInput) {
    setLoading(true);
    try {
      const response = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error ?? "Registration failed");
        return;
      }

      const login = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });
      if (login?.error) {
        toast.error("Account created. Please log in.");
        router.push("/login");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("Unable to register. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="name">Full name</Label>
        <Input
          id="name"
          autoComplete="name"
          aria-invalid={Boolean(form.formState.errors.name)}
          {...form.register("name")}
        />
        {form.formState.errors.name && (
          <p className="text-sm text-destructive">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          aria-invalid={Boolean(form.formState.errors.email)}
          {...form.register("email")}
        />
        {form.formState.errors.email && (
          <p className="text-sm text-destructive">
            {form.formState.errors.email.message}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          aria-invalid={Boolean(form.formState.errors.password)}
          {...form.register("password")}
        />
        {form.formState.errors.password && (
          <p className="text-sm text-destructive">
            {form.formState.errors.password.message}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label>I want to join as</Label>
        <RadioGroup
          value={form.watch("role")}
          onValueChange={(value) => {
            if (value === "STUDENT" || value === "INSTRUCTOR") {
              form.setValue("role", value, { shouldValidate: true });
            }
          }}
          className="grid grid-cols-2 gap-3"
          aria-invalid={Boolean(form.formState.errors.role)}
        >
          <label
            htmlFor="student"
            className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition-all ${
              form.watch("role") === "STUDENT"
                ? "border-primary/40 bg-primary/[0.04] ring-2 ring-primary/10"
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <RadioGroupItem value="STUDENT" id="student" />
            <span className="text-sm font-medium text-slate-700">Student</span>
          </label>
          <label
            htmlFor="instructor"
            className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition-all ${
              form.watch("role") === "INSTRUCTOR"
                ? "border-primary/40 bg-primary/[0.04] ring-2 ring-primary/10"
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <RadioGroupItem value="INSTRUCTOR" id="instructor" />
            <span className="text-sm font-medium text-slate-700">Instructor</span>
          </label>
        </RadioGroup>
        {form.formState.errors.role && (
          <p className="text-sm text-destructive">
            {form.formState.errors.role.message}
          </p>
        )}
      </div>
      <Button type="submit" size="lg" className="mt-2 w-full" disabled={loading}>
        {loading ? (
          <LoaderCircle className="animate-spin" aria-hidden="true" />
        ) : (
          <ArrowRight aria-hidden="true" />
        )}
        {loading ? "Creating account..." : "Create account"}
      </Button>
    </form>
  );
}
