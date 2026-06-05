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
        className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl max-h-[85vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-label={item.name}
      >
        <div className="flex justify-end px-5 pt-4">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-sm font-semibold"
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
            <h2 className="font-semibold text-gray-900 text-xl leading-snug">{item.name}</h2>
            <span className="font-medium text-gray-900 text-lg flex-shrink-0">${item.price}</span>
          </div>
          <p className="text-gray-500 text-sm leading-relaxed">{item.description}</p>
        </div>
      </div>
    </>
  );
}

function FeaturedCard({ item, onClick }: { item: MenuItem; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex-shrink-0 w-64 text-left bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm"
    >
      <div className="h-40 bg-gray-100 overflow-hidden">
        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
      </div>
      <div className="p-4">
        <div className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Featured</div>
        <div className="font-semibold text-gray-900 text-sm leading-snug mb-1">{item.name}</div>
        <div className="text-gray-500 text-xs leading-relaxed mb-3 line-clamp-2">{item.description}</div>
        <div className="text-gray-900 font-medium text-sm">${item.price}</div>
      </div>
    </button>
  );
}

function ItemRow({ item, onClick }: { item: MenuItem; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left flex gap-4 py-4 border-b border-gray-100 last:border-0"
    >
      <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-50">
        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <span className="font-medium text-gray-900 text-sm">{item.name}</span>
          <span className="text-gray-900 font-medium text-sm flex-shrink-0">${item.price}</span>
        </div>
        <p className="text-gray-500 text-xs mt-0.5 leading-relaxed line-clamp-2">{item.description}</p>
      </div>
    </button>
  );
}

export function MinimalTheme({
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
    <div className="min-h-screen bg-white pb-32">
      <div className="px-5 pt-12 pb-6 border-b border-gray-100">
        {tagLabel && <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">{tagLabel}</p>}
        <h1 className="text-2xl font-semibold text-gray-900">{restaurant.name}</h1>
        <p className="text-gray-400 text-sm mt-1">{restaurant.tagline}</p>
      </div>

      {featured.length > 0 && (
        <div className="pt-6 pb-2">
          <p className="px-5 text-[10px] uppercase tracking-widest text-gray-400 mb-3">Chef&apos;s picks</p>
          <div className="flex gap-3 overflow-x-auto px-5 pb-2 scrollbar-none">
            {featured.map((item) => (
              <FeaturedCard key={item.id} item={item} onClick={() => handleItemClick(item)} />
            ))}
          </div>
        </div>
      )}

      {restaurant.enabledCategories.map((cat) => {
        const items = grouped[cat];
        if (!items || items.length === 0) return null;
        return (
          <div key={cat} className="px-5 mt-8">
            <h2 className="text-[11px] uppercase tracking-widest text-gray-400 mb-1 pb-2 border-b border-gray-100">
              {CATEGORY_LABELS[cat]}
            </h2>
            {items.map((item) => (
              <ItemRow key={item.id} item={item} onClick={() => handleItemClick(item)} />
            ))}
          </div>
        );
      })}

      <div className="px-5 mt-12">
        <div className="border border-gray-100 rounded-2xl p-5">
          {review.submitted ? (
            <>
              <h3 className="font-semibold text-gray-900 text-base mb-1">Thank you</h3>
              <p className="text-gray-500 text-xs">We&apos;ve passed your feedback along.</p>
            </>
          ) : (
            <>
              <h3 className="font-semibold text-gray-900 text-base mb-1">Leave a review</h3>
              <p className="text-gray-400 text-xs mb-4">How was your experience today?</p>
              <div className="flex gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((n) => {
                  const active = review.rating >= n;
                  return (
                    <button
                      key={n}
                      type="button"
                      onClick={() => review.setRating(n)}
                      aria-label={`${n} star${n > 1 ? "s" : ""}`}
                      aria-pressed={active}
                      className={`w-10 h-10 rounded-full border text-sm transition-colors ${active ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 text-gray-400 hover:border-gray-900 hover:text-gray-900"}`}
                    >
                      {n}
                    </button>
                  );
                })}
              </div>
              <textarea
                placeholder="Tell us what you thought..."
                rows={3}
                value={review.body}
                onChange={(e) => review.setBody(e.target.value)}
                className="w-full text-sm text-gray-700 placeholder-gray-300 border border-gray-200 rounded-xl p-3 resize-none focus:outline-none focus:border-gray-400 transition-colors"
              />
              {review.error && (
                <p className="mt-2 text-xs text-red-600">{review.error}</p>
              )}
              <button
                type="button"
                onClick={review.submit}
                disabled={review.submitting}
                className="mt-3 w-full bg-gray-900 text-white text-sm font-medium py-3 rounded-xl hover:bg-gray-700 transition-colors disabled:opacity-60"
              >
                {review.submitting ? "Submitting…" : "Submit review"}
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
