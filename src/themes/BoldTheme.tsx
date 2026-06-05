"use client";

import { useState } from "react";
import { Restaurant, MenuItem, CATEGORY_LABELS, Category } from "./types";
import { useReviewForm, type ReviewSubmitInput, type ReviewSubmitResult } from "./useReviewForm";

function ItemModal({ item, onClose }: { item: MenuItem; onClose: () => void }) {
  return (
    <>
      <div
        className="fixed inset-0 bg-black/70 z-40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl max-h-[85vh] overflow-y-auto"
        style={{ background: "#0a0a0a" }}
        role="dialog"
        aria-modal="true"
        aria-label={item.name}
      >
        <div className="flex justify-end px-5 pt-4">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border border-white/20 text-white/60"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        {item.imageUrl && (
          <img src={item.imageUrl} alt={item.name} className="w-full h-56 object-cover" />
        )}
        <div className="p-5 pb-10">
          <div className="flex items-start justify-between gap-3 mb-3">
            <h2 className="text-white font-black text-xl leading-snug">{item.name}</h2>
            <span className="text-amber-400 font-bold text-xl flex-shrink-0">${item.price}</span>
          </div>
          <p className="text-white/50 text-sm leading-relaxed">{item.description}</p>
        </div>
      </div>
    </>
  );
}

function FeaturedHero({ item, onClick }: { item: MenuItem; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full text-left relative overflow-hidden rounded-2xl h-72">
      {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
      <div className="absolute top-3 left-3">
        <span className="bg-amber-400 text-black text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full">
          Featured
        </span>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <h3 className="text-white font-bold text-xl leading-tight">{item.name}</h3>
        <p className="text-white/60 text-sm mt-1 leading-relaxed line-clamp-2">{item.description}</p>
        <div className="flex items-center justify-between mt-3">
          <span className="text-amber-400 font-bold text-lg">${item.price}</span>
        </div>
      </div>
    </button>
  );
}

function ItemCard({ item, onClick }: { item: MenuItem; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white/5 rounded-xl overflow-hidden flex gap-3 border border-white/10 hover:border-white/20 transition-colors"
    >
      <div className="w-24 h-24 flex-shrink-0 overflow-hidden bg-white/5">
        {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />}
      </div>
      <div className="py-3 pr-3 flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <div className="text-white font-semibold text-sm">{item.name}</div>
          <div className="text-white/40 text-xs mt-1 leading-relaxed line-clamp-2">{item.description}</div>
        </div>
        <div className="text-amber-400 font-bold text-sm">${item.price}</div>
      </div>
    </button>
  );
}

export function BoldTheme({
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
    <div className="min-h-screen pb-32" style={{ background: "#0a0a0a" }}>
      <div className="px-5 pt-12 pb-6">
        {tagLabel && (
          <div className="inline-block bg-amber-400/10 border border-amber-400/30 rounded-full px-3 py-1 mb-4">
            <span className="text-amber-400 text-[10px] font-bold uppercase tracking-wider">{tagLabel}</span>
          </div>
        )}
        <h1 className="text-3xl font-black text-white tracking-tight leading-none">{restaurant.name}</h1>
        <p className="text-white/30 text-sm mt-2">{restaurant.tagline}</p>
      </div>

      {featured.length > 0 && (
        <div className="px-5 mb-8 space-y-4">
          {featured.map((item) => (
            <FeaturedHero key={item.id} item={item} onClick={() => handleItemClick(item)} />
          ))}
        </div>
      )}

      {restaurant.enabledCategories.map((cat) => {
        const items = grouped[cat];
        if (!items || items.length === 0) return null;
        return (
          <div key={cat} className="px-5 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-amber-400 font-black text-xs uppercase tracking-widest">
                {CATEGORY_LABELS[cat]}
              </h2>
              <div className="flex-1 h-px bg-white/10" />
            </div>
            <div className="space-y-3">
              {items.map((item) => (
                <ItemCard key={item.id} item={item} onClick={() => handleItemClick(item)} />
              ))}
            </div>
          </div>
        );
      })}

      <div className="px-5 mt-4">
        <div className="border border-white/10 rounded-2xl p-5 bg-white/5">
          {review.submitted ? (
            <>
              <h3 className="font-black text-white text-lg mb-1">Thanks for the feedback</h3>
            </>
          ) : (
            <>
              <h3 className="font-black text-white text-lg mb-1">Rate your visit</h3>
              <p className="text-white/30 text-xs mb-5">Your feedback helps us improve.</p>
              <div className="flex gap-2 mb-5">
                {[1, 2, 3, 4, 5].map((n) => {
                  const active = review.rating >= n;
                  return (
                    <button
                      key={n}
                      type="button"
                      onClick={() => review.setRating(n)}
                      aria-label={`${n} star${n > 1 ? "s" : ""}`}
                      aria-pressed={active}
                      className={`flex-1 aspect-square rounded-xl border font-bold text-sm transition-colors ${active ? "border-amber-400 bg-amber-400 text-black" : "border-white/10 text-white/40 hover:border-amber-400 hover:text-amber-400"}`}
                    >
                      {n}
                    </button>
                  );
                })}
              </div>
              <textarea
                placeholder="What stood out?"
                rows={3}
                value={review.body}
                onChange={(e) => review.setBody(e.target.value)}
                className="w-full text-sm text-white placeholder-white/20 bg-white/5 border border-white/10 rounded-xl p-3 resize-none focus:outline-none focus:border-amber-400/50 transition-colors"
              />
              {review.error && (
                <p className="mt-2 text-xs text-amber-300">{review.error}</p>
              )}
              <button
                type="button"
                onClick={review.submit}
                disabled={review.submitting}
                className="mt-3 w-full bg-amber-400 text-black text-sm font-black py-3 rounded-xl hover:bg-amber-300 transition-colors uppercase tracking-wider disabled:opacity-60"
              >
                {review.submitting ? "Sending…" : "Submit"}
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
