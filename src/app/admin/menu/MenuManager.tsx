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

const CATEGORY_FLAG: Record<
  Category,
  keyof Pick<
    Restaurant,
    | "has_specials"
    | "has_appetizers"
    | "has_mains"
    | "has_sides"
    | "has_drinks"
    | "has_desserts"
  >
> = {
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
  previewTagId: string | null;
}

export function MenuManager({
  restaurantId: _restaurantId,
  initialItems,
  initialRestaurant,
  previewTagId,
}: Props) {
  const [items, setItems] = useState<MenuItem[]>(initialItems);
  const [restaurant, setRestaurant] = useState<Restaurant>(initialRestaurant);
  const [modalItem, setModalItem] = useState<MenuItem | null | "new">(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  function refreshPreview() {
    try {
      iframeRef.current?.contentWindow?.location.reload();
    } catch {
      // cross-origin guard — shouldn't happen on same origin
    }
  }

  async function handleToggle(item: MenuItem) {
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, is_available: !i.is_available } : i))
    );
    await toggleAvailableAction(item.id, item.is_available);
    refreshPreview();
  }

  async function handleTogglePin(item: MenuItem) {
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, is_featured: !i.is_featured } : i))
    );
    await toggleFeaturedAction(item.id, item.is_featured);
    refreshPreview();
  }

  async function handleToggleCategory(category: Category) {
    const flag = CATEGORY_FLAG[category];
    const next = !restaurant[flag];
    setRestaurant((prev) => ({ ...prev, [flag]: next }));
    await toggleCategoryAction(category, next);
    refreshPreview();
  }

  async function handleDelete(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
    setConfirmDeleteId(null);
    await deleteItemAction(id);
    refreshPreview();
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
    setModalItem(null);
    formRef.current?.reset();
    window.location.reload();
  }

  const editing = modalItem !== "new" && modalItem ? modalItem : null;

  const grouped = CATEGORIES.reduce<Record<Category, MenuItem[]>>(
    (acc, cat) => {
      acc[cat] = items.filter((i) => i.category === cat);
      return acc;
    },
    {} as Record<Category, MenuItem[]>
  );

  const activeCount = CATEGORIES.filter((c) => restaurant[CATEGORY_FLAG[c]]).length;

  return (
    <>
      {/* ── Two-panel layout ── */}
      <div style={{ display: "flex", alignItems: "flex-start" }}>

        {/* ── Left: admin controls ── */}
        <div style={{ flex: 1, minWidth: 0, minHeight: "100vh", backgroundColor: "#ffffff" }}>

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
                {restaurant.name}
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
                Menu Items
              </h1>
              <p style={{ color: "#9ca3af", margin: "0.5rem 0 0", fontSize: "0.9375rem" }}>
                {items.length} item{items.length !== 1 ? "s" : ""} &middot;{" "}
                {activeCount} active{" "}
                {activeCount === 1 ? "category" : "categories"}
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
              <a
                href={previewTagId ? `/r/${previewTagId}` : "/admin/tags"}
                target={previewTagId ? "_blank" : undefined}
                rel="noopener noreferrer"
                title={
                  previewTagId
                    ? "Open customer menu in new tab"
                    : "Create an NFC tag to get a preview link"
                }
                style={{
                  borderRadius: "9999px",
                  padding: "0.8125rem 1.5rem",
                  fontSize: "0.9375rem",
                  fontWeight: 600,
                  border: "1.5px solid #d6cfc8",
                  background: "transparent",
                  color: "#6b7280",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  whiteSpace: "nowrap",
                  textDecoration: "none",
                }}
              >
                View Menu
                <span style={{ fontSize: "0.8125rem", opacity: 0.7 }}>↗</span>
              </a>

              <button
                onClick={() => setModalItem("new")}
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
                Add Item
              </button>
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, backgroundColor: "#e5ddd5", margin: "2rem 2.5rem 0" }} />

          {/* Category toggles */}
          <div style={{ padding: "1.5rem 2.5rem" }}>
            <p
              style={{
                fontSize: "0.6875rem",
                fontWeight: 700,
                color: "#a8a09a",
                letterSpacing: "0.09em",
                textTransform: "uppercase",
                margin: "0 0 0.75rem",
              }}
            >
              Visible on menu
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {CATEGORIES.map((cat) => {
                const enabled = restaurant[CATEGORY_FLAG[cat]];
                return (
                  <button
                    key={cat}
                    onClick={() => handleToggleCategory(cat)}
                    style={{
                      padding: "0.4rem 1.125rem",
                      borderRadius: "9999px",
                      border: enabled ? "none" : "1.5px solid #d6cfc8",
                      background: enabled ? "#111827" : "transparent",
                      color: enabled ? "#fff" : "#a8a09a",
                      fontSize: "0.8125rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      letterSpacing: "0.02em",
                    }}
                  >
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, backgroundColor: "#e5ddd5", margin: "0 2.5rem 2rem" }} />

          {/* Items */}
          <div style={{ padding: "0 2.5rem 3.5rem" }}>
            {items.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "5rem 2rem",
                  color: "#c4baaf",
                  fontFamily: "var(--font-geist-sans)",
                  fontSize: "1.125rem",
                }}
              >
                No menu items yet. Add your first item!
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "2.25rem" }}>
                {CATEGORIES.map((cat) => {
                  const catItems = grouped[cat];
                  if (catItems.length === 0) return null;
                  return (
                    <section key={cat}>
                      <h2
                        style={{
                          fontFamily: "var(--font-geist-sans)",
                          fontSize: "1.125rem",
                          fontWeight: "bold",
                          color: "#374151",
                          margin: "0 0 0.875rem",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.625rem",
                        }}
                      >
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        <span
                          style={{
                            fontSize: "0.75rem",
                            fontFamily: "var(--font-geist-sans)",
                            fontWeight: 500,
                            color: "#9ca3af",
                            backgroundColor: "#f3f4f6",
                            padding: "0.125rem 0.5rem",
                            borderRadius: "9999px",
                          }}
                        >
                          {catItems.length}
                        </span>
                        {!restaurant[CATEGORY_FLAG[cat]] && (
                          <span
                            style={{
                              fontSize: "0.6875rem",
                              fontFamily: "var(--font-geist-sans)",
                              fontWeight: 700,
                              color: "#d97706",
                              backgroundColor: "#fef3c7",
                              padding: "0.125rem 0.5rem",
                              borderRadius: "9999px",
                              letterSpacing: "0.05em",
                              textTransform: "uppercase",
                            }}
                          >
                            Hidden
                          </span>
                        )}
                      </h2>

                      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        {catItems.map((item) => (
                          <ItemRow
                            key={item.id}
                            item={item}
                            confirmDeleteId={confirmDeleteId}
                            onToggle={handleToggle}
                            onTogglePin={handleTogglePin}
                            onEdit={(i) => setModalItem(i)}
                            onDeleteRequest={(id) => setConfirmDeleteId(id)}
                            onDeleteCancel={() => setConfirmDeleteId(null)}
                            onDeleteConfirm={handleDelete}
                          />
                        ))}
                      </div>
                    </section>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Right: live preview (desktop only) ── */}
        <div
          className="hidden lg:flex flex-col"
          style={{
            width: 420,
            flexShrink: 0,
            position: "sticky",
            top: 0,
            height: "100vh",
            borderLeft: "1px solid #e5ddd5",
            backgroundColor: "#faf9f7",
          }}
        >
          {/* Preview header */}
          <div
            style={{
              padding: "1rem 1.25rem",
              borderBottom: "1px solid #e5ddd5",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexShrink: 0,
            }}
          >
            <div>
              <p
                style={{
                  fontSize: "0.6875rem",
                  fontWeight: 700,
                  color: "#a8a09a",
                  letterSpacing: "0.09em",
                  textTransform: "uppercase",
                  margin: 0,
                }}
              >
                Customer View
              </p>
              <p style={{ fontSize: "0.8125rem", color: "#c4baaf", margin: "0.15rem 0 0" }}>
                {previewTagId ? "Live preview" : "No tag linked yet"}
              </p>
            </div>
            {previewTagId && (
              <button
                onClick={refreshPreview}
                title="Refresh preview"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  border: "1.5px solid #e5ddd5",
                  background: "transparent",
                  color: "#9ca3af",
                  fontSize: "1rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ↺
              </button>
            )}
          </div>

          {/* Preview body */}
          {previewTagId ? (
            <iframe
              ref={iframeRef}
              src={`/r/${previewTagId}?preview=1`}
              style={{ flex: 1, border: "none", width: "100%" }}
              title="Customer menu preview"
            />
          ) : (
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "2rem",
                textAlign: "center",
                gap: "0.875rem",
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-geist-sans)",
                  fontSize: "1rem",
                  color: "#c4baaf",
                  fontStyle: "italic",
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                Add an NFC tag to preview your menu as customers see it.
              </p>
              <a
                href="/admin/tags"
                style={{
                  padding: "0.5rem 1.25rem",
                  borderRadius: "9999px",
                  border: "1.5px solid #d6cfc8",
                  background: "transparent",
                  color: "#9ca3af",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Manage Tags →
              </a>
            </div>
          )}
        </div>
      </div>

      {/* ── Modal ── */}
      {modalItem !== null && (
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
          onClick={(e) => e.target === e.currentTarget && setModalItem(null)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              padding: "2.25rem",
              width: "100%",
              maxWidth: 460,
              maxHeight: "90vh",
              overflowY: "auto",
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
                marginBottom: "1.75rem",
              }}
            >
              {editing ? "Edit Item" : "Add Item"}
            </h2>

            <form ref={formRef} onSubmit={handleSave}>
              <FormField label="Name">
                <input
                  name="name"
                  required
                  defaultValue={editing?.name ?? ""}
                  placeholder="e.g. Mushroom Risotto"
                  style={inputStyle}
                />
              </FormField>

              <FormField label="Description">
                <textarea
                  name="description"
                  rows={3}
                  defaultValue={editing?.description ?? ""}
                  placeholder="Brief description of the dish…"
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              </FormField>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <FormField label="Price">
                  <input
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    defaultValue={editing?.price ?? ""}
                    placeholder="0.00"
                    style={inputStyle}
                  />
                </FormField>
                <FormField label="Category">
                  <select
                    name="category"
                    required
                    defaultValue={editing?.category ?? ""}
                    style={inputStyle}
                  >
                    <option value="">Select…</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c.charAt(0).toUpperCase() + c.slice(1)}
                      </option>
                    ))}
                  </select>
                </FormField>
              </div>

              <FormField label="Photo (max 5 MB)">
                {editing?.image_url && (
                  <div style={{ marginBottom: "0.75rem" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={editing.image_url}
                      alt="current"
                      width={72}
                      height={72}
                      style={{ objectFit: "cover", borderRadius: 10 }}
                    />
                    <p style={{ fontSize: "0.75rem", color: "#9ca3af", margin: "0.3rem 0 0" }}>
                      Upload a new file to replace
                    </p>
                  </div>
                )}
                <input
                  name="photo"
                  type="file"
                  accept="image/*"
                  style={{ width: "100%", fontSize: "0.875rem", color: "#374151" }}
                />
              </FormField>

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.625rem",
                  cursor: "pointer",
                  marginBottom: "1.5rem",
                }}
              >
                <input
                  name="is_available"
                  type="checkbox"
                  defaultChecked={editing ? editing.is_available : true}
                  style={{ width: 16, height: 16 }}
                />
                <span style={{ fontSize: "0.9375rem", color: "#374151" }}>Available now</span>
              </label>

              {formError && (
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
                  {formError}
                </p>
              )}

              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    flex: 1,
                    backgroundColor: "#111827",
                    color: "#fff",
                    borderRadius: "9999px",
                    padding: "0.9375rem",
                    fontSize: "0.9375rem",
                    fontWeight: 600,
                    border: "none",
                    cursor: saving ? "not-allowed" : "pointer",
                    opacity: saving ? 0.6 : 1,
                  }}
                >
                  {saving ? "Saving…" : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setModalItem(null);
                    setFormError(null);
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

// ── Sub-components ────────────────────────────────────────────────────────────

interface ItemRowProps {
  item: MenuItem;
  confirmDeleteId: string | null;
  onToggle: (item: MenuItem) => void;
  onTogglePin: (item: MenuItem) => void;
  onEdit: (item: MenuItem) => void;
  onDeleteRequest: (id: string) => void;
  onDeleteCancel: () => void;
  onDeleteConfirm: (id: string) => void;
}

function ItemRow({
  item,
  confirmDeleteId,
  onToggle,
  onTogglePin,
  onEdit,
  onDeleteRequest,
  onDeleteCancel,
  onDeleteConfirm,
}: ItemRowProps) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 12,
        padding: "0.875rem 1.125rem",
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        boxShadow: "0 1px 2px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.04)",
      }}
    >
      {/* Thumbnail */}
      {item.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.image_url}
          alt={item.name}
          style={{
            width: 48,
            height: 48,
            objectFit: "cover",
            borderRadius: 8,
            flexShrink: 0,
          }}
        />
      ) : (
        <div
          style={{
            width: 48,
            height: 48,
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
          🍽
        </div>
      )}

      {/* Name + price */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", overflow: "hidden", minWidth: 0 }}>
          <span
            style={{
              fontWeight: 600,
              color: "#111827",
              fontSize: "0.9375rem",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              minWidth: 0,
            }}
          >
            {item.name}
          </span>
        </div>
        <div style={{ fontSize: "0.8125rem", color: "#9ca3af", marginTop: "0.125rem", fontWeight: 500 }}>
          ${item.price.toFixed(2)}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", flexShrink: 0 }}>
        {/* Pin — desktop only */}
        <div className="hidden sm:flex">
          <button
            onClick={() => onTogglePin(item)}
            aria-label={item.is_featured ? "Unpin" : "Pin as featured"}
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              border: item.is_featured ? "1.5px solid #f59e0b" : "1.5px solid #e5ddd5",
              background: "transparent",
              color: item.is_featured ? "#f59e0b" : "#d1c9bf",
              fontSize: "0.875rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ★
          </button>
        </div>

        {/* Available — always visible */}
        <button
          onClick={() => onToggle(item)}
          style={{
            padding: "0.3rem 0.875rem",
            borderRadius: "9999px",
            border: "none",
            background: item.is_available ? "#f0fdf4" : "#fef2f2",
            color: item.is_available ? "#16a34a" : "#dc2626",
            fontSize: "0.75rem",
            fontWeight: 700,
            cursor: "pointer",
            letterSpacing: "0.02em",
          }}
        >
          {item.is_available ? "Available" : "86'd"}
        </button>

        {/* Edit — desktop only */}
        <div className="hidden sm:flex">
          <button
            onClick={() => onEdit(item)}
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
        </div>

        {/* Delete — desktop only */}
        <div className="hidden sm:flex">
          {confirmDeleteId === item.id ? (
            <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
              <button
                onClick={() => onDeleteConfirm(item.id)}
                style={{
                  padding: "0.25rem 0.75rem",
                  borderRadius: "9999px",
                  border: "none",
                  background: "#ef4444",
                  color: "#fff",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Delete
              </button>
              <button
                onClick={onDeleteCancel}
                style={{
                  padding: "0.25rem 0.625rem",
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
            </div>
          ) : (
            <button
              onClick={() => onDeleteRequest(item.id)}
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                border: "1.5px solid #fee2e2",
                background: "transparent",
                color: "#fca5a5",
                fontSize: "1.125rem",
                lineHeight: 1,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ×
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "1.125rem" }}>
      {label && (
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
          {label}
        </label>
      )}
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.65rem 0.875rem",
  border: "1.5px solid #e5e7eb",
  borderRadius: 10,
  fontSize: "0.9375rem",
  boxSizing: "border-box",
  color: "#111827",
  backgroundColor: "#fafafa",
  outline: "none",
};
