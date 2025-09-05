"use client";

import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Check for authenticated user on mount
  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        router.push("/workout/new");
      }
    };
    checkUser();
  }, [router]);

  const signInWithGoogle = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      console.error("Login error:", error.message);
      alert("Failed to sign in: " + error.message);
    }
    setLoading(false);
  };

  return (
    <div className='flex flex-col items-center justify-center min-h-screen'>
      <h1 className='text-2xl mb-4'>Login to Fitness Tracker</h1>
      <button
        onClick={signInWithGoogle}
        disabled={loading}
        className='bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400'
      >
        {loading ? "Logging in..." : "Sign in with Google"}
      </button>
    </div>
  );
}
