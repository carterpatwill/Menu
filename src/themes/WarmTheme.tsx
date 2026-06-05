"use client";

import { useState } from "react";
import { Restaurant, MenuItem, CATEGORY_LABELS, Category } from "./types";
import { useReviewForm, type ReviewSubmitInput, type ReviewSubmitResult } from "./useReviewForm";

function ItemModal({ item, onClose }: { item: MenuItem; onClose: () => void }) {
  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl max-h-[85vh] overflow-y-auto"
        style={{ background: "#fdf6ec" }}
        role="dialog"
        aria-modal="true"
        aria-label={item.name}
      >
        <div className="flex justify-end px-5 pt-4">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold"
            style={{ background: "#e8ddd0", color: "#2c1a0e" }}
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        {item.imageUrl && (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-56 object-cover"
          />
        )}
        <div className="p-5 pb-10">
          <div className="flex items-start justify-between gap-3 mb-3">
            <h2
              className="font-bold text-2xl leading-snug"
              style={{ color: "#2c1a0e", fontFamily: "Georgia, serif" }}
            >
              {item.name}
            </h2>
            <span
              className="font-bold text-xl flex-shrink-0"
              style={{ color: "#5c3d1e" }}
            >
              ${item.price}
            </span>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: "#6b4f3a" }}>
            {item.description}
          </p>
        </div>
      </div>
    </>
  );
}

function FeaturedEditorial({
  item,
  index,
  onClick,
}: {
  item: MenuItem;
  index: number;
  onClick: () => void;
}) {
  const isReversed = index % 2 === 1;
  return (
    <button
      onClick={onClick}
      className={`w-full text-left flex ${isReversed ? "flex-row-reverse" : "flex-row"} gap-0 overflow-hidden rounded-2xl`}
      style={{ background: "#e8ddd0" }}
    >
      <div className="w-2/5 overflow-hidden flex-shrink-0">
        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 p-5 flex flex-col justify-between">
        <div>
          <span
            className="inline-block text-[9px] uppercase tracking-[0.15em] font-semibold mb-2"
            style={{ color: "#8b6c52" }}
          >
            Chef&apos;s pick
          </span>
          <h3
            className="font-bold leading-snug mb-2 text-lg"
            style={{ color: "#2c1a0e", fontFamily: "Georgia, serif" }}
          >
            {item.name}
          </h3>
          <p className="text-sm leading-relaxed line-clamp-3" style={{ color: "#6b4f3a" }}>
            {item.description}
          </p>
        </div>
        <div className="flex items-center justify-between mt-4">
          <span className="font-bold text-base" style={{ color: "#2c1a0e" }}>${item.price}</span>
        </div>
      </div>
    </button>
  );
}

function ItemCard({ item, onClick }: { item: MenuItem; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-xl overflow-hidden shadow-sm"
      style={{ background: "#f5ede2" }}
    >
      <div className="h-36 overflow-hidden">
        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h4
            className="font-bold text-sm leading-snug"
            style={{ color: "#2c1a0e", fontFamily: "Georgia, serif" }}
          >
            {item.name}
          </h4>
          <span className="font-semibold text-sm flex-shrink-0" style={{ color: "#5c3d1e" }}>
            ${item.price}
          </span>
        </div>
        <p className="text-xs leading-relaxed mt-1.5 line-clamp-2" style={{ color: "#7a5c44" }}>
          {item.description}
        </p>
      </div>
    </button>
  );
}

export function WarmTheme({
  restaurant,
  tagLabel,
  onItemTap,
  onSubmitReview,
}: {
  restaurant: Restaurant;
  tagLabel?: string;
  onItemTap?: (item: MenuItem) => void;
  onSubmitReview?: (input: ReviewSubmitInput) => Promise<ReviewSubmitResult>;
}) {
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const review = useReviewForm(onSubmitReview);

  function handleItemClick(item: MenuItem) {
    setSelectedItem(item);
    onItemTap?.(item);
  }

  const featured = restaurant.items.filter((i) => i.isFeatured && i.isAvailable);
  const grouped = restaurant.enabledCategories.reduce<Record<Category, MenuItem[]>>(
    (acc, cat) => {
      acc[cat] = restaurant.items.filter((i) => i.category === cat && i.isAvailable && !i.isFeatured);
      return acc;
    },
    {} as Record<Category, MenuItem[]>
  );

  return (
    <div className="min-h-screen pb-32" style={{ background: "#fdf6ec" }}>
      <div className="px-5 pt-12 pb-8 text-center border-b" style={{ borderColor: "#e2d4c0" }}>
        {tagLabel && (
          <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "#a07850" }}>
            {tagLabel}
          </p>
        )}
        <h1
          className="text-3xl font-bold leading-tight"
          style={{ color: "#2c1a0e", fontFamily: "Georgia, serif" }}
        >
          {restaurant.name}
        </h1>
        <p className="text-sm mt-2" style={{ color: "#8b6c52" }}>
          {restaurant.tagline}
        </p>
        <div className="mt-5 flex justify-center">
          <div className="w-16 h-px" style={{ background: "#c4a882" }} />
          <div className="w-2 h-2 rounded-full mx-2 -mt-0.5" style={{ background: "#c4a882" }} />
          <div className="w-16 h-px" style={{ background: "#c4a882" }} />
        </div>
      </div>

      {featured.length > 0 && (
        <div className="px-5 pt-8 space-y-4">
          <p className="text-xs uppercase tracking-widest text-center mb-4" style={{ color: "#a07850" }}>
            Tonight&apos;s highlights
          </p>
          {featured.map((item, i) => (
            <FeaturedEditorial
              key={item.id}
              item={item}
              index={i}
              onClick={() => handleItemClick(item)}
            />
          ))}
        </div>
      )}

      {restaurant.enabledCategories.map((cat) => {
        const items = grouped[cat];
        if (!items || items.length === 0) return null;
        return (
          <div key={cat} className="px-5 mt-10">
            <div className="text-center mb-5">
              <h2
                className="font-bold text-sm uppercase tracking-widest"
                style={{ color: "#8b6c52", fontFamily: "Georgia, serif" }}
              >
                {CATEGORY_LABELS[cat]}
              </h2>
              <div className="mt-2 flex justify-center">
                <div className="w-8 h-px" style={{ background: "#c4a882" }} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {items.map((item) => (
                <ItemCard key={item.id} item={item} onClick={() => handleItemClick(item)} />
              ))}
            </div>
          </div>
        );
      })}

      <div className="px-5 mt-12">
        <div className="rounded-2xl p-6 text-center" style={{ background: "#e8ddd0" }}>
          {review.submitted ? (
            <>
              <h3
                className="font-bold text-xl mb-2"
                style={{ color: "#2c1a0e", fontFamily: "Georgia, serif" }}
              >
                Thank you
              </h3>
              <p className="text-sm" style={{ color: "#6b4f3a" }}>
                Your review has been sent to the kitchen.
              </p>
            </>
          ) : (
            <>
              <h3
                className="font-bold text-xl mb-1"
                style={{ color: "#2c1a0e", fontFamily: "Georgia, serif" }}
              >
                Share your experience
              </h3>
              <p className="text-xs mb-6" style={{ color: "#8b6c52" }}>
                We read every review
              </p>
              <div className="flex justify-center gap-3 mb-5">
                {[1, 2, 3, 4, 5].map((n) => {
                  const active = review.rating >= n;
                  return (
                    <button
                      key={n}
                      type="button"
                      onClick={() => review.setRating(n)}
                      aria-label={`${n} star${n > 1 ? "s" : ""}`}
                      aria-pressed={active}
                      className="w-10 h-10 rounded-full border text-sm font-semibold transition-colors"
                      style={{
                        borderColor: "#b89870",
                        background: active ? "#5c3d1e" : "transparent",
                        color: active ? "#fdf6ec" : "#8b6c52",
                      }}
                    >
                      {n}
                    </button>
                  );
                })}
              </div>
              <textarea
                placeholder="What was memorable about your visit?"
                rows={3}
                value={review.body}
                onChange={(e) => review.setBody(e.target.value)}
                className="w-full text-sm placeholder-opacity-50 rounded-xl p-4 resize-none focus:outline-none border"
                style={{ background: "#fdf6ec", borderColor: "#c4a882", color: "#2c1a0e" }}
              />
              {review.error && (
                <p className="mt-3 text-xs" style={{ color: "#a13c1e" }}>
                  {review.error}
                </p>
              )}
              <button
                type="button"
                onClick={review.submit}
                disabled={review.submitting}
                className="mt-4 w-full py-3 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60"
                style={{ background: "#5c3d1e", color: "#fdf6ec" }}
              >
                {review.submitting ? "Sending…" : "Send review"}
              </button>
            </>
          )}
        </div>
      </div>

      {selectedItem && (
        <ItemModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}
    </div>
  );
}
