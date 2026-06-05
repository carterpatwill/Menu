"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);

  async function handleGoogleLogin() {
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/admin/auth/callback` },
    });
    if (error) {
      setError(error.message);
    }
  }

  return (
    <main style={{ padding: "2rem" }}>
      <h1>Admin Login</h1>
      <button onClick={handleGoogleLogin}>Sign in with Google</button>
      {error && <p role="alert">{error}</p>}
    </main>
  );
}
