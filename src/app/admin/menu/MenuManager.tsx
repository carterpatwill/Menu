"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Plus, ExternalLink, Pencil, Trash2, Star } from "lucide-react";
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
      <style
        dangerouslySetInnerHTML={{
          __html: `
.menu-item-row { background: var(--surface); border: 1px solid var(--line); border-radius: 12px; padding: 14px 18px; display: flex; align-items: center; gap: 16px; box-shadow: var(--shadow); }
.menu-thumb { width: 48px; height: 48px; border-radius: 10px; object-fit: cover; flex-shrink: 0; }
.menu-thumb-empty { width: 48px; height: 48px; border-radius: 10px; background: var(--surface-2); border: 1px solid var(--line); flex-shrink: 0; display: grid; place-items: center; font-size: 18px; }
.menu-section + .menu-section { margin-top: 32px; }
.menu-section-head { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
.menu-section-head h2 { font-size: 16px; font-weight: 600; margin: 0; letter-spacing: -0.01em; }
.cat-toggles { display: flex; flex-wrap: wrap; gap: 8px; }
`,
        }}
      />

      <main className="wrap">
        <div className="page-head">
          <div>
            <Link href="/admin" className="back-link">← Overview</Link>
            <h1 className="greeting display">Menu</h1>
            <p className="subhead">
              {items.length} item{items.length !== 1 ? "s" : ""} · {activeCount} active{" "}
              {activeCount === 1 ? "category" : "categories"}
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {previewTagId && (
              <Link
                href={`/r/${previewTagId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost"
              >
                <ExternalLink size={14} strokeWidth={2.2} />
                View live menu
              </Link>
            )}
            <button onClick={() => setModalItem("new")} className="btn-primary">
              <Plus size={16} strokeWidth={2.4} />
              Add item
            </button>
          </div>
        </div>

        <div className="panel" style={{ marginBottom: 24 }}>
          <div className="panel-head" style={{ marginBottom: 16 }}>
            <h2 className="panel-title display">Visible categories</h2>
          </div>
          <div className="cat-toggles">
            {CATEGORIES.map((cat) => {
              const enabled = restaurant[CATEGORY_FLAG[cat]];
              return (
                <button
                  key={cat}
                  onClick={() => handleToggleCategory(cat)}
                  className={`chip ${enabled ? "active" : ""}`}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              );
            })}
          </div>
        </div>

        {items.length === 0 ? (
          <div className="panel">
            <div className="empty">No menu items yet. Click “Add item” to create your first.</div>
          </div>
        ) : (
          <div>
            {CATEGORIES.map((cat) => {
              const catItems = grouped[cat];
              if (catItems.length === 0) return null;
              const enabled = restaurant[CATEGORY_FLAG[cat]];
              return (
                <section key={cat} className="menu-section">
                  <div className="menu-section-head">
                    <h2 className="display">
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </h2>
                    <span className="chip" style={{ cursor: "default" }}>
                      {catItems.length}
                    </span>
                    {!enabled && (
                      <span className="chip negative" style={{ cursor: "default" }}>
                        Hidden
                      </span>
                    )}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
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
      </main>

      {modalItem !== null && (
        <div
          className="modal-backdrop"
          onClick={(e) => e.target === e.currentTarget && setModalItem(null)}
        >
          <div className="modal">
            <h2 className="modal-title display">
              {editing ? "Edit item" : "Add item"}
            </h2>

            <form ref={formRef} onSubmit={handleSave}>
              <FormField label="Name">
                <input
                  name="name"
                  required
                  defaultValue={editing?.name ?? ""}
                  placeholder="e.g. Mushroom Risotto"
                  className="input"
                />
              </FormField>

              <FormField label="Description">
                <textarea
                  name="description"
                  rows={3}
                  defaultValue={editing?.description ?? ""}
                  placeholder="Brief description of the dish…"
                  className="input"
                />
              </FormField>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <FormField label="Price">
                  <input
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    defaultValue={editing?.price ?? ""}
                    placeholder="0.00"
                    className="input"
                  />
                </FormField>
                <FormField label="Category">
                  <select
                    name="category"
                    required
                    defaultValue={editing?.category ?? ""}
                    className="input"
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
                  <div style={{ marginBottom: 10 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={editing.image_url}
                      alt="current"
                      width={72}
                      height={72}
                      style={{ objectFit: "cover", borderRadius: 10 }}
                    />
                    <p style={{ fontSize: 12, color: "var(--ink-faint)", margin: "6px 0 0" }}>
                      Upload a new file to replace
                    </p>
                  </div>
                )}
                <input
                  name="photo"
                  type="file"
                  accept="image/*"
                  style={{ width: "100%", fontSize: 13, color: "var(--ink-soft)" }}
                />
              </FormField>

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  cursor: "pointer",
                  marginBottom: 24,
                }}
              >
                <input
                  name="is_available"
                  type="checkbox"
                  defaultChecked={editing ? editing.is_available : true}
                  style={{ width: 16, height: 16, accentColor: "var(--accent)" }}
                />
                <span style={{ fontSize: 14, color: "var(--ink)" }}>Available now</span>
              </label>

              {formError && <p className="error-banner">{formError}</p>}

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary"
                  style={{ flex: 1, justifyContent: "center" }}
                >
                  {saving ? "Saving…" : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setModalItem(null);
                    setFormError(null);
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
    <div className="menu-item-row">
      {item.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.image_url} alt={item.name} className="menu-thumb" />
      ) : (
        <div className="menu-thumb-empty">🍽</div>
      )}

      <div style={{ flex: 1, minWidth: 0 }}>
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
          {item.name}
        </div>
        <div style={{ fontSize: 13, color: "var(--ink-faint)", marginTop: 2 }}>
          ${item.price.toFixed(2)}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
        <button
          onClick={() => onTogglePin(item)}
          aria-label={item.is_featured ? "Unpin" : "Pin as featured"}
          className="icon-btn"
          style={{
            color: item.is_featured ? "var(--star)" : "var(--ink-faint)",
            borderColor: item.is_featured ? "var(--star)" : "var(--line)",
          }}
        >
          <Star size={14} strokeWidth={2} fill={item.is_featured ? "var(--star)" : "none"} />
        </button>

        <button
          onClick={() => onToggle(item)}
          className={`chip ${item.is_available ? "positive" : "negative"}`}
        >
          {item.is_available ? "Available" : "86'd"}
        </button>

        <button
          onClick={() => onEdit(item)}
          aria-label="Edit"
          className="icon-btn"
        >
          <Pencil size={13} strokeWidth={2} />
        </button>

        {confirmDeleteId === item.id ? (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button
              onClick={() => onDeleteConfirm(item.id)}
              className="btn-danger-solid"
              style={{ padding: "6px 12px", fontSize: 12.5 }}
            >
              Delete
            </button>
            <button onClick={onDeleteCancel} className="btn-ghost" style={{ padding: "6px 12px", fontSize: 12.5 }}>
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => onDeleteRequest(item.id)}
            aria-label="Delete"
            className="icon-btn"
            style={{ color: "var(--negative)", borderColor: "rgba(177,73,47,0.25)" }}
          >
            <Trash2 size={13} strokeWidth={2} />
          </button>
        )}
      </div>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label className="field-label">{label}</label>
      {children}
    </div>
  );
}
