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
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
.theme-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.theme-card { padding: 16px; border-radius: 12px; border: 1px solid var(--line); background: var(--surface); cursor: pointer; text-align: left; font-family: inherit; transition: all .15s ease; }
.theme-card:hover { border-color: var(--ink-faint); }
.theme-card.selected { border-color: var(--accent); background: var(--accent-soft); box-shadow: 0 0 0 3px rgba(61,90,39,0.10); }
.theme-card .name { font-weight: 600; color: var(--ink); font-size: 15px; margin-bottom: 4px; }
.theme-card .desc { font-size: 12.5px; color: var(--ink-soft); }
@media (max-width: 520px) { .theme-grid { grid-template-columns: 1fr; } }
`,
        }}
      />

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 28 }}>
          <label className="field-label" style={{ marginBottom: 10 }}>Theme</label>
          <div className="theme-grid">
            {THEMES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setTheme(t.value)}
                className={`theme-card ${theme === t.value ? "selected" : ""}`}
              >
                <div className="name">{t.label}</div>
                <div className="desc">{t.description}</div>
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <label className="field-label">Tagline</label>
          <input
            type="text"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            placeholder="e.g. Fresh ingredients, bold flavours"
            maxLength={120}
            className="input"
          />
        </div>

        {error && <p className="error-banner">{error}</p>}

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            type="submit"
            disabled={saving}
            className="btn-primary"
          >
            {saving ? "Saving…" : "Save"}
          </button>
          {saved && (
            <span style={{ fontSize: 13, color: "var(--positive)", fontWeight: 600 }}>
              Saved
            </span>
          )}
        </div>
      </form>
    </>
  );
}
