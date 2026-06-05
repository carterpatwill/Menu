// PROTOTYPE — variant 3: Warm / Editorial / Earthy

import { Restaurant, MenuItem, CATEGORY_LABELS, Category } from "@/themes/types";

function FeaturedEditorial({ item, index }: { item: MenuItem; index: number }) {
  const isReversed = index % 2 === 1;
  return (
    <div className={`flex ${isReversed ? "flex-row-reverse" : "flex-row"} gap-0 overflow-hidden rounded-2xl`}
      style={{ background: "#e8ddd0" }}>
      <div className="w-2/5 overflow-hidden flex-shrink-0">
        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 p-5 flex flex-col justify-between">
        <div>
          <span className="inline-block text-[9px] uppercase tracking-[0.15em] font-semibold mb-2"
            style={{ color: "#8b6c52" }}>
            Chef&apos;s pick
          </span>
          <h3 className="font-bold leading-snug mb-2 text-lg" style={{ color: "#2c1a0e", fontFamily: "Georgia, serif" }}>
            {item.name}
          </h3>
          <p className="text-sm leading-relaxed line-clamp-3" style={{ color: "#6b4f3a" }}>
            {item.description}
          </p>
        </div>
        <div className="flex items-center justify-between mt-4">
          <span className="font-bold text-base" style={{ color: "#2c1a0e" }}>${item.price}</span>
          <span className="text-xs px-3 py-1.5 rounded-full font-medium border"
            style={{ borderColor: "#8b6c52", color: "#8b6c52" }}>
            Add to order
          </span>
        </div>
      </div>
    </div>
  );
}

function ItemCard({ item }: { item: MenuItem }) {
  return (
    <div className="rounded-xl overflow-hidden shadow-sm" style={{ background: "#f5ede2" }}>
      <div className="h-36 overflow-hidden">
        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-bold text-sm leading-snug" style={{ color: "#2c1a0e", fontFamily: "Georgia, serif" }}>
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
    </div>
  );
}

export function WarmVariant({ restaurant }: { restaurant: Restaurant }) {
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
      {/* Header */}
      <div className="px-5 pt-12 pb-8 text-center border-b" style={{ borderColor: "#e2d4c0" }}>
        <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "#a07850" }}>
          Table 4
        </p>
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

      {/* Featured editorial */}
      {featured.length > 0 && (
        <div className="px-5 pt-8 space-y-4">
          <p className="text-xs uppercase tracking-widest text-center mb-4" style={{ color: "#a07850" }}>
            Tonight&apos;s highlights
          </p>
          {featured.map((item, i) => (
            <FeaturedEditorial key={item.id} item={item} index={i} />
          ))}
        </div>
      )}

      {/* Menu sections */}
      {restaurant.enabledCategories.map((cat) => {
        const items = grouped[cat];
        if (!items || items.length === 0) return null;
        return (
          <div key={cat} className="px-5 mt-10">
            <div className="text-center mb-5">
              <h2 className="font-bold text-sm uppercase tracking-widest" style={{ color: "#8b6c52", fontFamily: "Georgia, serif" }}>
                {CATEGORY_LABELS[cat]}
              </h2>
              <div className="mt-2 flex justify-center">
                <div className="w-8 h-px" style={{ background: "#c4a882" }} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {items.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        );
      })}

      {/* Review form */}
      <div className="px-5 mt-12">
        <div className="rounded-2xl p-6 text-center" style={{ background: "#e8ddd0" }}>
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
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                className="w-10 h-10 rounded-full border text-sm font-semibold transition-colors"
                style={{ borderColor: "#b89870", color: "#8b6c52" }}
              >
                {n}
              </button>
            ))}
          </div>
          <textarea
            placeholder="What was memorable about your visit?"
            rows={3}
            className="w-full text-sm placeholder-opacity-50 rounded-xl p-4 resize-none focus:outline-none border"
            style={{
              background: "#fdf6ec",
              borderColor: "#c4a882",
              color: "#2c1a0e",
            }}
          />
          <button
            className="mt-4 w-full py-3 rounded-xl text-sm font-semibold transition-colors"
            style={{ background: "#5c3d1e", color: "#fdf6ec" }}
          >
            Send review
          </button>
        </div>
      </div>
    </div>
  );
}
