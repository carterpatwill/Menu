// PROTOTYPE — variant 1: Minimal / Clean

import { Restaurant, MenuItem, CATEGORY_LABELS, Category } from "@/themes/types";

function FeaturedCard({ item }: { item: MenuItem }) {
  return (
    <div className="flex-shrink-0 w-64 bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
      <div className="h-40 bg-gray-100 overflow-hidden">
        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
      </div>
      <div className="p-4">
        <div className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Featured</div>
        <div className="font-semibold text-gray-900 text-sm leading-snug mb-1">{item.name}</div>
        <div className="text-gray-500 text-xs leading-relaxed mb-3 line-clamp-2">{item.description}</div>
        <div className="text-gray-900 font-medium text-sm">${item.price}</div>
      </div>
    </div>
  );
}

function ItemRow({ item }: { item: MenuItem }) {
  return (
    <div className="flex gap-4 py-4 border-b border-gray-100 last:border-0">
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
    </div>
  );
}

export function MinimalVariant({ restaurant }: { restaurant: Restaurant }) {
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
      {/* Header */}
      <div className="px-5 pt-12 pb-6 border-b border-gray-100">
        <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Table 4</p>
        <h1 className="text-2xl font-semibold text-gray-900">{restaurant.name}</h1>
        <p className="text-gray-400 text-sm mt-1">{restaurant.tagline}</p>
      </div>

      {/* Featured strip */}
      {featured.length > 0 && (
        <div className="pt-6 pb-2">
          <p className="px-5 text-[10px] uppercase tracking-widest text-gray-400 mb-3">Chef&apos;s picks</p>
          <div className="flex gap-3 overflow-x-auto px-5 pb-2 scrollbar-none">
            {featured.map((item) => (
              <FeaturedCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}

      {/* Menu sections */}
      {restaurant.enabledCategories.map((cat) => {
        const items = grouped[cat];
        if (!items || items.length === 0) return null;
        return (
          <div key={cat} className="px-5 mt-8">
            <h2 className="text-[11px] uppercase tracking-widest text-gray-400 mb-1 pb-2 border-b border-gray-100">
              {CATEGORY_LABELS[cat]}
            </h2>
            {items.map((item) => (
              <ItemRow key={item.id} item={item} />
            ))}
          </div>
        );
      })}

      {/* Review form */}
      <div className="px-5 mt-12">
        <div className="border border-gray-100 rounded-2xl p-5">
          <h3 className="font-semibold text-gray-900 text-base mb-1">Leave a review</h3>
          <p className="text-gray-400 text-xs mb-4">How was your experience today?</p>
          <div className="flex gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} className="w-10 h-10 rounded-full border border-gray-200 text-gray-400 text-sm hover:border-gray-900 hover:text-gray-900 transition-colors">
                {n}
              </button>
            ))}
          </div>
          <textarea
            placeholder="Tell us what you thought..."
            rows={3}
            className="w-full text-sm text-gray-700 placeholder-gray-300 border border-gray-200 rounded-xl p-3 resize-none focus:outline-none focus:border-gray-400 transition-colors"
          />
          <button className="mt-3 w-full bg-gray-900 text-white text-sm font-medium py-3 rounded-xl hover:bg-gray-700 transition-colors">
            Submit review
          </button>
        </div>
      </div>
    </div>
  );
}
