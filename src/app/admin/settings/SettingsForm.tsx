"use client";

import { useState } from "react";
import { saveSettingsAction } from "./actions";
import type { Theme } from "@/themes/types";

const THEMES: { value: Theme; label: string; description: string }[] = [
  { value: "warm", label: "Warm", description: "Earthy tones, serif headings" },
  { value: "minimal", label: "Minimal", description: "Clean, lots of whitespace" },
  { value: "bold", label: "Bold", description: "High contrast, strong typography" },
];

interface Props {
  initialTheme: Theme;
  initialTagline: string;
}

export function SettingsForm({ initialTheme, initialTagline }: Props) {
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const [tagline, setTagline] = useState(initialTagline);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError(null);

    const formData = new FormData();
    formData.set("theme", theme);
    formData.set("tagline", tagline);

    const result = await saveSettingsAction(formData);
    setSaving(false);
    if (result.error) {
      setError(result.error);
    } else {
      setSaved(true);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: "2rem" }}>
        <label style={{ display: "block", fontWeight: 600, color: "#111827", marginBottom: "0.75rem" }}>
          Theme
        </label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.75rem" }}>
          {THEMES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setTheme(t.value)}
              style={{
                padding: "1rem",
                borderRadius: 10,
                border: theme === t.value ? "2px solid #111827" : "1.5px solid #e5e7eb",
                background: theme === t.value ? "#f9fafb" : "#ffffff",
                cursor: "pointer",
                textAlign: "left",
                fontFamily: "inherit",
              }}
            >
              <div style={{ fontWeight: 600, color: "#111827", fontSize: "0.95rem", marginBottom: "0.25rem" }}>
                {t.label}
              </div>
              <div style={{ fontSize: "0.8rem", color: "#9ca3af" }}>{t.description}</div>
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: "2rem" }}>
        <label style={{ display: "block", fontWeight: 600, color: "#111827", marginBottom: "0.5rem" }}>
          Tagline
        </label>
        <input
          type="text"
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
          placeholder="e.g. Fresh ingredients, bold flavours"
          maxLength={120}
          style={{
            width: "100%",
            padding: "0.6rem 0.85rem",
            borderRadius: 8,
            border: "1.5px solid #e5e7eb",
            fontSize: "0.95rem",
            fontFamily: "inherit",
            color: "#111827",
            boxSizing: "border-box",
          }}
        />
      </div>

      {error && (
        <p style={{ color: "#ef4444", fontSize: "0.875rem", marginBottom: "1rem" }}>{error}</p>
      )}

      <button
        type="submit"
        disabled={saving}
        style={{
          background: "#111827",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          padding: "0.6rem 1.5rem",
          fontSize: "0.95rem",
          fontWeight: 600,
          cursor: saving ? "not-allowed" : "pointer",
          opacity: saving ? 0.6 : 1,
          fontFamily: "inherit",
        }}
      >
        {saving ? "Saving…" : saved ? "Saved" : "Save"}
      </button>
    </form>
  );
}
