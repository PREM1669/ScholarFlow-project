"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { LogOut, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await signOut({ callbackUrl: "/login" });
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleSignOut}
      disabled={signingOut}
    >
      {signingOut ? (
        <LoaderCircle className="animate-spin" aria-hidden="true" />
      ) : (
        <LogOut aria-hidden="true" />
      )}
      <span>{signingOut ? "Signing out" : "Sign out"}</span>
    </Button>
  );
}
