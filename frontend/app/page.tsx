"use client";

import { useState } from "react";
import { Github } from "lucide-react";
import { login } from "@/api/auth";

export default function LoginPage() {
  const [error, setError] = useState<Error | null>(null);

  const handleLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_URL}/github/login`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)]">
      <h2 className="text-2xl font-semibold mb-6">Sign In or Sign Up</h2>
      <button
        onClick={handleLogin}
        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors border border-gray-600"
      >
        <Github className="w-5 h-5" />
        Sign in with GitHub
      </button>
      <p className="text-gray-500 text-sm mt-4">
        {"(Requires a GitHub OAuth App setup with Client ID)"}
      </p>
    </div>
  );
}
