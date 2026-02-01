"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AuthCallback() {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          setMessage("Error verifying email. Please try again.");
          console.error("Auth callback error:", error);
        } else if (data.session) {
          setMessage("Email verified successfully! Redirecting...");
          setTimeout(() => {
            router.push("/dashboard");
          }, 2000);
        } else {
          setMessage("No session found. Please sign in first.");
        }
      } catch (err) {
        setMessage("An unexpected error occurred.");
        console.error("Unexpected error:", err);
      } finally {
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">
            {loading ? "Verifying..." : "Email Verification"}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <p
              className={`text-sm ${message.includes("success") ? "text-green-600" : "text-destructive"}`}
            >
              {message}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
