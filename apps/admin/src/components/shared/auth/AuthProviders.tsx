"use client";

import { FaGithub } from "react-icons/fa6";
import { FcGoogle } from "react-icons/fc";

import { Button } from "@/components/ui/button";

type AuthProvider = "github" | "google";

type Props = {
  authType?: "Login" | "Signup";
};

export default function AuthProviders({ authType = "Login" }: Props) {
  // OAuth providers disabled — using JWT email/password auth only
  const handleAuth = (_authProvider: AuthProvider) => {
    // TODO: Implement OAuth when needed
  };

  return (
    <div className="space-y-4 mb-10">
      <Button
        onClick={() => handleAuth("github")}
        variant="secondary"
        className="w-full min-h-14"
        disabled
      >
        <FaGithub className="mr-3 size-4" />
        {authType} With Github
      </Button>

      <Button
        onClick={() => handleAuth("google")}
        variant="secondary"
        className="w-full min-h-14"
        disabled
      >
        <FcGoogle className="mr-3 size-4" />
        {authType} With Google
      </Button>
    </div>
  );
}
