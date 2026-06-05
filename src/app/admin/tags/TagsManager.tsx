"use client";

import { useState, useEffect } from "react";
import { createTagAction, updateTagLabelAction } from "./actions";
import type { Database } from "@/lib/supabase/types";

type NfcTag = Database["public"]["Tables"]["nfc_tags"]["Row"];

interface Props {
  initialTags: NfcTag[];
  restaurantName: string;
}

export function TagsManager({ initialTags, restaurantName }: Props) {
  const [tags, setTags] = useState<NfcTag[]>(initialTags);
  const [showAdd, setShowAdd] = useState(false);
  const [addingLabel, setAddingLabel] = useState("");
  const [addError, setAddError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingLabel, setEditingLabel] = useState("");
  const [editError, setEditError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [origin, setOrigin] = useState<string>("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  function urlFor(tagId: string) {
    return `${origin || "[domain]"}/r/${tagId}`;
  }

  async function copyUrl(tagId: string) {
    try {
      await navigator.clipboard.writeText(urlFor(tagId));
      setCopiedId(tagId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // ignore
    }
  }

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAdding(true);
    setAddError(null);
    const formData = new FormData(e.currentTarget);
    const result = await createTagAction(formData);
    setAdding(false);
    if (result.error) {
      setAddError(result.error);
      return;
    }
    setAddingLabel("");
    setShowAdd(false);
    window.location.reload();
  }

  function startEdit(tag: NfcTag) {
    setEditingId(tag.id);
    setEditingLabel(tag.label);
    setEditError(null);
  }

  async function saveEdit(id: string) {
    const result = await updateTagLabelAction(id, editingLabel);
    if (result.error) {
      setEditError(result.error);
      return;
    }
    setTags((prev) =>
      prev.map((t) => (t.id === id ? { ...t, label: editingLabel.trim() } : t))
    );
    setEditingId(null);
    setEditError(null);
  }

  return (
    <>
      <div style={{ minHeight: "100vh", backgroundColor: "#ffffff" }}>
        {/* Header */}
        <div
          style={{
            padding: "2.75rem 2.5rem 0",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          <div>
            <a
              href="/admin"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.3rem",
                fontFamily: "var(--font-geist-sans)",
                fontSize: "0.8125rem",
                color: "#a8a09a",
                textDecoration: "none",
                margin: "0 0 0.5rem",
                letterSpacing: "0.02em",
              }}
            >
              ← Admin
            </a>
            <p
              style={{
                fontFamily: "var(--font-geist-sans)",
                fontSize: "0.8125rem",
                color: "#a8a09a",
                margin: "0 0 0.25rem",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              {restaurantName}
            </p>
            <h1
              style={{
                fontFamily: "var(--font-geist-sans)",
                fontSize: "2.875rem",
                fontWeight: "bold",
                color: "#111827",
                margin: 0,
                lineHeight: 1.08,
                letterSpacing: "-0.025em",
              }}
            >
              NFC Tags
            </h1>
            <p style={{ color: "#9ca3af", margin: "0.5rem 0 0", fontSize: "0.9375rem" }}>
              {tags.length} tag{tags.length !== 1 ? "s" : ""} &middot; Program each URL onto its physical tag
            </p>
          </div>

          <button
            onClick={() => setShowAdd(true)}
            style={{
              backgroundColor: "#111827",
              color: "#fff",
              borderRadius: "9999px",
              padding: "0.8125rem 1.75rem",
              fontSize: "0.9375rem",
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              whiteSpace: "nowrap",
            }}
          >
            <span style={{ fontSize: "1.15rem", lineHeight: 1, marginTop: -1 }}>+</span>
            Add Tag
          </button>
        </div>

        {/* Divider */}
        <div style={{ height: 1, backgroundColor: "#e5ddd5", margin: "2rem 2.5rem 0" }} />

        {/* Tag list */}
        <div style={{ padding: "2rem 2.5rem 3.5rem" }}>
          {tags.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "5rem 2rem",
                color: "#c4baaf",
                fontFamily: "var(--font-geist-sans)",
                fontSize: "1.125rem",
              }}
            >
              No tags yet. Add your first NFC tag above.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxWidth: 720 }}>
              {tags.map((tag) => {
                const isEditing = editingId === tag.id;
                const isCopied = copiedId === tag.id;

                return (
                  <div
                    key={tag.id}
                    style={{
                      background: "#fff",
                      borderRadius: 12,
                      padding: "0.875rem 1.125rem",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.04)",
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                    }}
                  >
                    {/* Icon */}
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 8,
                        backgroundColor: "#faf9f7",
                        border: "1px solid #ece7e0",
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.25rem",
                      }}
                    >
                      📡
                    </div>

                    {/* Label + URL */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {isEditing ? (
                        <input
                          value={editingLabel}
                          onChange={(e) => setEditingLabel(e.target.value)}
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveEdit(tag.id);
                            if (e.key === "Escape") {
                              setEditingId(null);
                              setEditError(null);
                            }
                          }}
                          style={{
                            padding: "0.3rem 0.6rem",
                            border: "1.5px solid #111827",
                            borderRadius: 8,
                            fontSize: "0.9375rem",
                            fontWeight: 600,
                            color: "#111827",
                            outline: "none",
                            width: "100%",
                            maxWidth: 240,
                            boxSizing: "border-box",
                          }}
                        />
                      ) : (
                        <p
                          style={{
                            fontWeight: 600,
                            color: "#111827",
                            fontSize: "0.9375rem",
                            margin: 0,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {tag.label}
                        </p>
                      )}
                      <p
                        style={{
                          fontSize: "0.6875rem",
                          color: "#a8a09a",
                          margin: "0.2rem 0 0",
                          fontFamily: "monospace",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {urlFor(tag.id)}
                      </p>
                    </div>

                    {/* Created date — desktop only */}
                    <p
                      className="hidden sm:block"
                      style={{
                        fontSize: "0.75rem",
                        color: "#c4baaf",
                        flexShrink: 0,
                        margin: 0,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {new Date(tag.created_at).toLocaleDateString()}
                    </p>

                    {/* Actions */}
                    <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", flexShrink: 0 }}>
                      {isEditing ? (
                        <>
                          <button
                            onClick={() => saveEdit(tag.id)}
                            style={{
                              padding: "0.3rem 0.875rem",
                              borderRadius: "9999px",
                              border: "none",
                              background: "#111827",
                              color: "#fff",
                              fontSize: "0.75rem",
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingId(null);
                              setEditError(null);
                            }}
                            style={{
                              padding: "0.3rem 0.75rem",
                              borderRadius: "9999px",
                              border: "1.5px solid #e5ddd5",
                              background: "transparent",
                              color: "#9ca3af",
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => copyUrl(tag.id)}
                            style={{
                              padding: "0.3rem 0.875rem",
                              borderRadius: "9999px",
                              border: "none",
                              background: isCopied ? "#f0fdf4" : "#f3f4f6",
                              color: isCopied ? "#16a34a" : "#374151",
                              fontSize: "0.75rem",
                              fontWeight: 700,
                              cursor: "pointer",
                              letterSpacing: "0.02em",
                            }}
                          >
                            {isCopied ? "Copied!" : "Copy URL"}
                          </button>
                          <button
                            onClick={() => startEdit(tag)}
                            style={{
                              width: 30,
                              height: 30,
                              borderRadius: "50%",
                              border: "1.5px solid #e5ddd5",
                              background: "transparent",
                              color: "#9ca3af",
                              fontSize: "0.8125rem",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            ✎
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {editError && (
            <p
              style={{
                color: "#ef4444",
                margin: "0.75rem 0 0",
                fontSize: "0.875rem",
                padding: "0.625rem 0.875rem",
                background: "#fef2f2",
                borderRadius: 8,
                maxWidth: 720,
              }}
            >
              {editError}
            </p>
          )}
        </div>
      </div>

      {/* Add tag modal */}
      {showAdd && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(17,24,39,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
          }}
          onClick={(e) => e.target === e.currentTarget && setShowAdd(false)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              padding: "2.25rem",
              width: "100%",
              maxWidth: 400,
              margin: "1rem",
            }}
          >
            <h2
              style={{
                fontFamily: "var(--font-geist-sans)",
                fontSize: "1.875rem",
                fontWeight: "bold",
                color: "#111827",
                marginTop: 0,
                marginBottom: "1.5rem",
              }}
            >
              Add Tag
            </h2>

            <form onSubmit={handleAdd}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.375rem",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  color: "#374151",
                  letterSpacing: "0.02em",
                }}
              >
                Label
              </label>
              <input
                name="label"
                value={addingLabel}
                onChange={(e) => setAddingLabel(e.target.value)}
                placeholder='e.g. "Table 4" or "Bar Seat 2"'
                required
                autoFocus
                style={{
                  width: "100%",
                  padding: "0.65rem 0.875rem",
                  border: "1.5px solid #e5e7eb",
                  borderRadius: 10,
                  fontSize: "0.9375rem",
                  boxSizing: "border-box",
                  color: "#111827",
                  backgroundColor: "#fafafa",
                  outline: "none",
                  marginBottom: "1.5rem",
                }}
              />

              {addError && (
                <p
                  style={{
                    color: "#ef4444",
                    margin: "0 0 1rem",
                    fontSize: "0.875rem",
                    padding: "0.625rem 0.875rem",
                    background: "#fef2f2",
                    borderRadius: 8,
                  }}
                >
                  {addError}
                </p>
              )}

              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button
                  type="submit"
                  disabled={adding}
                  style={{
                    flex: 1,
                    backgroundColor: "#111827",
                    color: "#fff",
                    borderRadius: "9999px",
                    padding: "0.9375rem",
                    fontSize: "0.9375rem",
                    fontWeight: 600,
                    border: "none",
                    cursor: adding ? "not-allowed" : "pointer",
                    opacity: adding ? 0.6 : 1,
                  }}
                >
                  {adding ? "Adding…" : "Add Tag"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAdd(false);
                    setAddError(null);
                  }}
                  style={{
                    padding: "0.9375rem 1.5rem",
                    borderRadius: "9999px",
                    border: "1.5px solid #e5e7eb",
                    background: "transparent",
                    color: "#374151",
                    fontSize: "0.9375rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
