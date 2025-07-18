"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { verifyToken } from "@/api/auth";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("Authenticating...");

  useEffect(() => {
    const handleAuthentication = async () => {
      try {
        // Check for error parameters first
        const errorParam = searchParams.get("error");
        if (errorParam) {
          throw new Error(
            searchParams.get("error_description") || "Authentication failed"
          );
        }

        // Get and validate token
        const token = searchParams.get("token");
        if (!token) {
          throw new Error("No authorization token received");
        }

        setStatus("Verifying your credentials...");

        // Verify token with backend
        const response = await verifyToken(token);
        if (!response.valid) {
          throw new Error("Invalid token");
        }

        // Store the token and user data
        localStorage.setItem("github_token", token);
        localStorage.setItem("user_data", JSON.stringify(response.userData));

        setStatus("Authentication successful! Redirecting...");

        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push("/pr");
        }, 1000);
      } catch (error) {
        console.error("Authentication error:", error);
        setStatus(
          error instanceof Error ? error.message : "Authentication failed"
        );
        // Redirect to login after error
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
    };

    handleAuthentication();
  }, [searchParams, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
      <div className="space-y-6 text-center">
        {/* Loading spinner */}
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>

        {/* Status message */}
        <div className="text-xl font-medium text-gray-200">{status}</div>
      </div>
    </div>
  );
}
