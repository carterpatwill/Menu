"use client";

import { useRouter, useSearchParams } from "next/navigation";

const VARIANTS = [
  { key: "1", label: "Minimal", description: "Clean & airy" },
  { key: "2", label: "Bold", description: "Dark & dramatic" },
  { key: "3", label: "Warm", description: "Earthy & editorial" },
];

export function VariantSwitcher({ current }: { current: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function switchTo(v: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("v", v);
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-4 px-4 pointer-events-none">
      <div
        className="flex rounded-2xl overflow-hidden shadow-2xl border border-white/20 pointer-events-auto"
        style={{ background: "rgba(15,15,15,0.92)", backdropFilter: "blur(12px)" }}
      >
        {VARIANTS.map((v) => {
          const active = current === v.key;
          return (
            <button
              key={v.key}
              onClick={() => switchTo(v.key)}
              className={`px-5 py-3 text-sm font-medium transition-all duration-200 flex flex-col items-center gap-0.5 ${
                active
                  ? "bg-white text-black"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              }`}
            >
              <span className="font-semibold leading-none">{v.label}</span>
              <span className={`text-xs leading-none ${active ? "text-black/50" : "text-white/30"}`}>
                {v.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
