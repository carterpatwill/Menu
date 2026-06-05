"use client";

import { useState, useEffect } from "react";
import { createTagAction, updateTagLabelAction } from "./actions";
import type { Database } from "@/lib/supabase/types";

type NfcTag = Database["public"]["Tables"]["nfc_tags"]["Row"];

interface Props {
  initialTags: NfcTag[];
}

export function TagsManager({ initialTags }: Props) {
  const [tags, setTags] = useState<NfcTag[]>(initialTags);
  const [addingLabel, setAddingLabel] = useState("");
  const [addError, setAddError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingLabel, setEditingLabel] = useState("");
  const [editError, setEditError] = useState<string | null>(null);
  const [origin, setOrigin] = useState<string>("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

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

  function urlFor(tagId: string) {
    const base = origin || "[domain]";
    return `${base}/r/${tagId}`;
  }

  async function copyUrl(tagId: string) {
    try {
      await navigator.clipboard.writeText(urlFor(tagId));
    } catch {
      // ignore — user can manually copy
    }
  }

  return (
    <div>
      <section
        style={{
          marginBottom: "1.5rem",
          padding: "1rem",
          border: "1px solid #ddd",
          borderRadius: 6,
        }}
      >
        <h2 style={{ marginTop: 0, fontSize: "1rem" }}>Add a tag</h2>
        <form
          onSubmit={handleAdd}
          style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}
        >
          <input
            name="label"
            value={addingLabel}
            onChange={(e) => setAddingLabel(e.target.value)}
            placeholder='Label (e.g. "Table 4")'
            required
            style={{
              padding: "0.4rem 0.6rem",
              border: "1px solid #ccc",
              borderRadius: 4,
              fontSize: "1rem",
              flex: 1,
              maxWidth: 320,
            }}
          />
          <button
            type="submit"
            disabled={adding}
            style={{ padding: "0.5rem 1rem", cursor: "pointer" }}
          >
            {adding ? "Adding…" : "+ Add tag"}
          </button>
        </form>
        {addError && (
          <p style={{ color: "red", margin: "0.5rem 0 0" }}>{addError}</p>
        )}
      </section>

      {tags.length === 0 && <p>No tags yet. Add your first NFC tag above.</p>}

      {tags.length > 0 && (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "2px solid #ddd" }}>
              <th style={{ padding: "0.5rem" }}>Label</th>
              <th style={{ padding: "0.5rem" }}>NFC URL (program this onto the tag)</th>
              <th style={{ padding: "0.5rem" }}>Created</th>
              <th style={{ padding: "0.5rem" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tags.map((tag) => {
              const isEditing = editingId === tag.id;
              return (
                <tr key={tag.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "0.5rem" }}>
                    {isEditing ? (
                      <input
                        value={editingLabel}
                        onChange={(e) => setEditingLabel(e.target.value)}
                        autoFocus
                        style={{
                          padding: "0.3rem 0.5rem",
                          border: "1px solid #ccc",
                          borderRadius: 4,
                        }}
                      />
                    ) : (
                      tag.label
                    )}
                  </td>
                  <td style={{ padding: "0.5rem", fontFamily: "monospace", fontSize: "0.85rem" }}>
                    {urlFor(tag.id)}
                  </td>
                  <td style={{ padding: "0.5rem" }}>
                    {new Date(tag.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: "0.5rem", display: "flex", gap: "0.5rem" }}>
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => saveEdit(tag.id)}
                          style={{ cursor: "pointer" }}
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(null);
                            setEditError(null);
                          }}
                          style={{ cursor: "pointer" }}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(tag)}
                          style={{ cursor: "pointer" }}
                        >
                          Edit label
                        </button>
                        <button
                          onClick={() => copyUrl(tag.id)}
                          style={{ cursor: "pointer" }}
                        >
                          Copy URL
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      {editError && (
        <p style={{ color: "red", margin: "0.5rem 0 0" }}>{editError}</p>
      )}
    </div>
  );
}
