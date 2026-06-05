"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
      <path d="M3.964 10.707A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.96L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}

export default function LoginProto() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function login() {
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/admin/auth/callback` },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left: illustration panel */}
      <div
        className="w-[55%] hidden sm:flex flex-col items-center justify-center relative overflow-hidden"
        style={{ backgroundColor: "#fff9f3" }}
      >
        <img
          src="/6413870.jpg"
          alt="Restaurant dining illustration"
          className="w-full h-full object-contain"
        />
      </div>

      {/* Right: login panel */}
      <div className="flex-1 flex flex-col relative bg-white">
        <div className="absolute top-6 right-6">
          <button className="flex flex-col gap-1.5 p-2" aria-label="Menu">
            <span className="block w-6 h-0.5 bg-gray-900" />
            <span className="block w-6 h-0.5 bg-gray-900" />
            <span className="block w-6 h-0.5 bg-gray-900" />
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center px-10">
          <div className="w-full max-w-sm space-y-8">
            <div className="space-y-1 text-center">
              <h1
                className="text-5xl font-bold text-gray-900"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
              >
                Hey Tappi!
              </h1>
              <p className="text-xl font-bold text-gray-900">Login please</p>
            </div>

            <div className="space-y-4">
              <button
                onClick={login}
                disabled={loading}
                className="w-full bg-gray-900 text-white rounded-full py-4 flex items-center justify-center gap-3 font-semibold text-base hover:bg-gray-700 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                <GoogleIcon />
                <span>{loading ? "Redirecting…" : "Login with Google"}</span>
              </button>

              {error && (
                <p className="text-red-500 text-sm text-center" role="alert">
                  {error}
                </p>
              )}
            </div>

            <p className="text-center text-sm underline underline-offset-2 text-gray-500 cursor-pointer hover:text-gray-800 transition-colors">
              Admin access only
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
