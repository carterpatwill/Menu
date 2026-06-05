// PROTOTYPE — throwaway UI exploration, not production code
// Question: Which visual direction feels right for the customer menu page?
// Delete or absorb once a direction is chosen.

import { Suspense } from "react";
import { FIXTURE } from "./fixture";
import { MinimalVariant } from "./variants/MinimalVariant";
import { BoldVariant } from "./variants/BoldVariant";
import { WarmVariant } from "./variants/WarmVariant";
import { VariantSwitcher } from "./VariantSwitcher";

interface Props {
  searchParams: Promise<{ v?: string }>;
}

export default async function PrototypePage({ searchParams }: Props) {
  const { v = "1" } = await searchParams;

  return (
    <>
      {v === "1" && <MinimalVariant restaurant={FIXTURE} />}
      {v === "2" && <BoldVariant restaurant={FIXTURE} />}
      {v === "3" && <WarmVariant restaurant={FIXTURE} />}
      <Suspense>
        <VariantSwitcher current={v} />
      </Suspense>
    </>
  );
}
