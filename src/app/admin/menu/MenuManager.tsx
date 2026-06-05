"use client";

import { useState, useRef } from "react";
import {
  saveItemAction,
  toggleAvailableAction,
  deleteItemAction,
  toggleFeaturedAction,
  toggleCategoryAction,
} from "./actions";
import type { Database } from "@/lib/supabase/types";

type MenuItem = Database["public"]["Tables"]["menu_items"]["Row"];
type Restaurant = Database["public"]["Tables"]["restaurants"]["Row"];
type Category = Database["public"]["Enums"]["category"];

const CATEGORIES: Category[] = [
  "specials",
  "appetizers",
  "mains",
  "sides",
  "drinks",
  "desserts",
];

const CATEGORY_FLAG: Record<Category, keyof Pick<
  Restaurant,
  "has_specials" | "has_appetizers" | "has_mains" | "has_sides" | "has_drinks" | "has_desserts"
>> = {
  specials: "has_specials",
  appetizers: "has_appetizers",
  mains: "has_mains",
  sides: "has_sides",
  drinks: "has_drinks",
  desserts: "has_desserts",
};

interface Props {
  restaurantId: string;
  initialItems: MenuItem[];
  initialRestaurant: Restaurant;
}

export function MenuManager({ restaurantId: _restaurantId, initialItems, initialRestaurant }: Props) {
  const [items, setItems] = useState<MenuItem[]>(initialItems);
  const [restaurant, setRestaurant] = useState<Restaurant>(initialRestaurant);
  const [modalItem, setModalItem] = useState<MenuItem | null | "new">(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleToggle(item: MenuItem) {
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, is_available: !i.is_available } : i))
    );
    await toggleAvailableAction(item.id, item.is_available);
  }

  async function handleTogglePin(item: MenuItem) {
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, is_featured: !i.is_featured } : i))
    );
    await toggleFeaturedAction(item.id, item.is_featured);
  }

  async function handleToggleCategory(category: Category) {
    const flag = CATEGORY_FLAG[category];
    const next = !restaurant[flag];
    setRestaurant((prev) => ({ ...prev, [flag]: next }));
    await toggleCategoryAction(category, next);
  }

  async function handleDelete(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
    setConfirmDeleteId(null);
    await deleteItemAction(id);
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    const formData = new FormData(e.currentTarget);
    const itemId = modalItem !== "new" && modalItem ? modalItem.id : null;
    const result = await saveItemAction(itemId, formData);
    setSaving(false);
    if (result.error) {
      setFormError(result.error);
      return;
    }
    // Optimistic: close and rely on revalidatePath for a full refresh
    setModalItem(null);
    formRef.current?.reset();
    // Refresh page data by triggering a router refresh via a lightweight reload
    window.location.reload();
  }

  const editing = modalItem !== "new" && modalItem ? modalItem : null;

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
        <h2 style={{ marginTop: 0, fontSize: "1rem" }}>Categories shown on menu</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
          {CATEGORIES.map((cat) => {
            const enabled = restaurant[CATEGORY_FLAG[cat]];
            return (
              <label
                key={cat}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  cursor: "pointer",
                  padding: "0.25rem 0.5rem",
                }}
              >
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={() => handleToggleCategory(cat)}
                />
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </label>
            );
          })}
        </div>
      </section>

      <button
        onClick={() => setModalItem("new")}
        style={{ marginBottom: "1rem", padding: "0.5rem 1rem" }}
      >
        + Add Item
      </button>

      {items.length === 0 && <p>No menu items yet. Add your first item!</p>}

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "2px solid #ddd" }}>
            <th style={{ padding: "0.5rem" }}>Name</th>
            <th style={{ padding: "0.5rem" }}>Category</th>
            <th style={{ padding: "0.5rem" }}>Price</th>
            <th style={{ padding: "0.5rem" }}>Featured</th>
            <th style={{ padding: "0.5rem" }}>Available</th>
            <th style={{ padding: "0.5rem" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: "0.5rem" }}>
                {item.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.image_url}
                    alt={item.name}
                    width={40}
                    height={40}
                    style={{ objectFit: "cover", borderRadius: 4, marginRight: 8, verticalAlign: "middle" }}
                  />
                )}
                {item.name}
              </td>
              <td style={{ padding: "0.5rem" }}>{item.category}</td>
              <td style={{ padding: "0.5rem" }}>${item.price.toFixed(2)}</td>
              <td style={{ padding: "0.5rem" }}>
                <button
                  onClick={() => handleTogglePin(item)}
                  aria-label={item.is_featured ? "Unpin from featured" : "Pin as featured"}
                  title={item.is_featured ? "Unpin from featured" : "Pin as featured"}
                  style={{
                    padding: "0.25rem 0.5rem",
                    background: item.is_featured ? "#f59e0b" : "#e5e7eb",
                    color: item.is_featured ? "#fff" : "#374151",
                    border: "none",
                    borderRadius: 4,
                    cursor: "pointer",
                  }}
                >
                  {item.is_featured ? "★ Pinned" : "☆ Pin"}
                </button>
              </td>
              <td style={{ padding: "0.5rem" }}>
                <button
                  onClick={() => handleToggle(item)}
                  style={{
                    padding: "0.25rem 0.5rem",
                    background: item.is_available ? "#22c55e" : "#ef4444",
                    color: "#fff",
                    border: "none",
                    borderRadius: 4,
                    cursor: "pointer",
                  }}
                >
                  {item.is_available ? "Available" : "Unavailable"}
                </button>
              </td>
              <td style={{ padding: "0.5rem", display: "flex", gap: "0.5rem" }}>
                <button onClick={() => setModalItem(item)} style={{ cursor: "pointer" }}>
                  Edit
                </button>
                {confirmDeleteId === item.id ? (
                  <>
                    <span>Delete?</span>
                    <button
                      onClick={() => handleDelete(item.id)}
                      style={{ color: "red", cursor: "pointer" }}
                    >
                      Yes
                    </button>
                    <button onClick={() => setConfirmDeleteId(null)} style={{ cursor: "pointer" }}>
                      No
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setConfirmDeleteId(item.id)}
                    style={{ color: "red", cursor: "pointer" }}
                  >
                    Delete
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {modalItem !== null && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
          }}
          onClick={(e) => e.target === e.currentTarget && setModalItem(null)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 8,
              padding: "2rem",
              width: "100%",
              maxWidth: 480,
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <h2 style={{ marginTop: 0 }}>{editing ? "Edit Item" : "Add Item"}</h2>
            <form ref={formRef} onSubmit={handleSave}>
              <Field label="Name *">
                <input name="name" required defaultValue={editing?.name ?? ""} style={inputStyle} />
              </Field>
              <Field label="Description">
                <textarea
                  name="description"
                  rows={3}
                  defaultValue={editing?.description ?? ""}
                  style={inputStyle}
                />
              </Field>
              <Field label="Price *">
                <input
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  defaultValue={editing?.price ?? ""}
                  style={inputStyle}
                />
              </Field>
              <Field label="Category *">
                <select name="category" required defaultValue={editing?.category ?? ""} style={inputStyle}>
                  <option value="">Select category…</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Photo (image, max 5 MB)">
                {editing?.image_url && (
                  <div style={{ marginBottom: 8 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={editing.image_url} alt="current" width={80} height={80} style={{ objectFit: "cover", borderRadius: 4 }} />
                    <p style={{ fontSize: "0.75rem", margin: "4px 0 0" }}>
                      Upload a new file to replace
                    </p>
                  </div>
                )}
                <input name="photo" type="file" accept="image/*" style={{ width: "100%" }} />
              </Field>
              <Field label="">
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                  <input
                    name="is_available"
                    type="checkbox"
                    defaultChecked={editing ? editing.is_available : true}
                  />
                  Available
                </label>
              </Field>
              {formError && (
                <p style={{ color: "red", margin: "0.5rem 0" }}>{formError}</p>
              )}
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                <button
                  type="submit"
                  disabled={saving}
                  style={{ padding: "0.5rem 1.5rem", cursor: "pointer" }}
                >
                  {saving ? "Saving…" : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => { setModalItem(null); setFormError(null); }}
                  style={{ padding: "0.5rem 1rem", cursor: "pointer" }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      {label && <label style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>{label}</label>}
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.4rem 0.6rem",
  border: "1px solid #ccc",
  borderRadius: 4,
  fontSize: "1rem",
  boxSizing: "border-box",
};
