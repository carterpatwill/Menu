"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Pencil, Copy, ExternalLink, Radio } from "lucide-react";
import { createTagAction, updateTagLabelAction } from "./actions";
import type { Database } from "@/lib/supabase/types";

type NfcTag = Database["public"]["Tables"]["nfc_tags"]["Row"];

interface Props {
  initialTags: NfcTag[];
}

export function TagsManager({ initialTags }: Props) {
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
      <style
        dangerouslySetInnerHTML={{
          __html: `
.tag-row { background: var(--surface); border: 1px solid var(--line); border-radius: 12px; padding: 14px 18px; display: flex; align-items: center; gap: 16px; box-shadow: var(--shadow); }
.tag-icon { width: 44px; height: 44px; border-radius: 10px; background: var(--accent-soft); color: var(--accent); display: grid; place-items: center; flex-shrink: 0; }
.tag-url { font-size: 12px; color: var(--ink-faint); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block; margin-top: 2px; }
.tag-date { font-size: 12px; color: var(--ink-faint); white-space: nowrap; flex-shrink: 0; }
.tag-edit-input { padding: 6px 10px; border: 1px solid var(--accent); border-radius: 8px; font-size: 14.5px; font-weight: 600; color: var(--ink); outline: none; width: 100%; max-width: 240px; background: var(--surface); font-family: inherit; }
@media (max-width: 600px) { .tag-date { display: none; } }
`,
        }}
      />

      <main className="wrap">
        <div className="page-head">
          <div>
            <Link href="/admin" className="back-link">← Overview</Link>
            <h1 className="greeting display">NFC tags</h1>
            <p className="subhead">
              {tags.length} tag{tags.length !== 1 ? "s" : ""} · Program each URL onto its physical tag.
            </p>
          </div>
          <button onClick={() => setShowAdd(true)} className="btn-primary">
            <Plus size={16} strokeWidth={2.4} />
            Add tag
          </button>
        </div>

        {tags.length === 0 ? (
          <div className="panel">
            <div className="empty">No tags yet. Add your first NFC tag.</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 820 }}>
            {tags.map((tag) => {
              const isEditing = editingId === tag.id;
              const isCopied = copiedId === tag.id;

              return (
                <div key={tag.id} className="tag-row">
                  <div className="tag-icon">
                    <Radio size={20} strokeWidth={2} />
                  </div>

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
                        className="tag-edit-input"
                      />
                    ) : (
                      <div
                        style={{
                          fontWeight: 600,
                          color: "var(--ink)",
                          fontSize: 14.5,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {tag.label}
                      </div>
                    )}
                    <a
                      href={urlFor(tag.id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="tag-url"
                    >
                      {urlFor(tag.id)}
                    </a>
                  </div>

                  <span className="tag-date">
                    {new Date(tag.created_at).toLocaleDateString()}
                  </span>

                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => saveEdit(tag.id)}
                          className="btn-primary"
                          style={{ padding: "7px 14px", fontSize: 13 }}
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(null);
                            setEditError(null);
                          }}
                          className="btn-ghost"
                          style={{ padding: "7px 12px", fontSize: 13 }}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => copyUrl(tag.id)}
                          className={`chip ${isCopied ? "positive" : ""}`}
                        >
                          <Copy size={12} strokeWidth={2.2} style={{ marginRight: 4 }} />
                          {isCopied ? "Copied" : "Copy"}
                        </button>
                        <a
                          href={urlFor(tag.id)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="chip"
                          style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}
                        >
                          <ExternalLink size={12} strokeWidth={2.2} style={{ marginRight: 4 }} />
                          Open
                        </a>
                        <button
                          onClick={() => startEdit(tag)}
                          aria-label="Edit"
                          className="icon-btn"
                        >
                          <Pencil size={13} strokeWidth={2} />
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
          <p className="error-banner" style={{ marginTop: 12, maxWidth: 820 }}>{editError}</p>
        )}
      </main>

      {showAdd && (
        <div
          className="modal-backdrop"
          onClick={(e) => e.target === e.currentTarget && setShowAdd(false)}
        >
          <div className="modal" style={{ maxWidth: 400 }}>
            <h2 className="modal-title display">Add tag</h2>

            <form onSubmit={handleAdd}>
              <div style={{ marginBottom: 24 }}>
                <label className="field-label">Label</label>
                <input
                  name="label"
                  value={addingLabel}
                  onChange={(e) => setAddingLabel(e.target.value)}
                  placeholder='e.g. "Table 4" or "Bar seat 2"'
                  required
                  autoFocus
                  className="input"
                />
              </div>

              {addError && <p className="error-banner">{addError}</p>}

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  type="submit"
                  disabled={adding}
                  className="btn-primary"
                  style={{ flex: 1, justifyContent: "center" }}
                >
                  {adding ? "Adding…" : "Add tag"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAdd(false);
                    setAddError(null);
                  }}
                  className="btn-ghost"
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
