import { describe, it, expect, vi } from "vitest";
import { submitReview } from "../review-service";

function makeChain(resolveValue: unknown) {
  const chain: Record<string, unknown> = {};
  const resolve = () => Promise.resolve(resolveValue);
  chain.insert = vi.fn().mockReturnValue(chain);
  chain.then = (
    onfulfilled: (v: unknown) => unknown,
    onrejected: (e: unknown) => unknown
  ) => resolve().then(onfulfilled, onrejected);
  return chain;
}

function makeSupabase(returnVal: unknown) {
  const chain = makeChain(returnVal);
  const from = vi.fn().mockReturnValue(chain);
  return { from, chain };
}

function makeNotifier() {
  return {
    notifyOwnerOfReview: vi.fn().mockResolvedValue(undefined),
  };
}

describe("submitReview", () => {
  it("inserts the review row and triggers the owner notification on valid input", async () => {
    const { from, chain } = makeSupabase({ data: null, error: null });
    const notifier = makeNotifier();

    const result = await submitReview(
      {
        restaurantId: "rest-1",
        nfcTagId: "tag-1",
        rating: 5,
        body: "Great food",
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { from } as any,
      notifier
    );

    expect(result).toEqual({ ok: true });
    expect(from).toHaveBeenCalledWith("reviews");
    expect(chain.insert).toHaveBeenCalledWith({
      restaurant_id: "rest-1",
      nfc_tag_id: "tag-1",
      body: "Great food",
      rating: 5,
    });
    expect(notifier.notifyOwnerOfReview).toHaveBeenCalledWith({
      restaurantId: "rest-1",
      nfcTagId: "tag-1",
      rating: 5,
      body: "Great food",
    });
  });

  it("returns a validation error and skips insert + notify when body is empty", async () => {
    const { from, chain } = makeSupabase({ data: null, error: null });
    const notifier = makeNotifier();

    const result = await submitReview(
      {
        restaurantId: "rest-1",
        nfcTagId: "tag-1",
        rating: 4,
        body: "   ",
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { from } as any,
      notifier
    );

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/body/i);
    expect(chain.insert).not.toHaveBeenCalled();
    expect(notifier.notifyOwnerOfReview).not.toHaveBeenCalled();
  });

  it.each([0, 6, 3.5, NaN])(
    "rejects rating %s without inserting or notifying",
    async (rating) => {
      const { from, chain } = makeSupabase({ data: null, error: null });
      const notifier = makeNotifier();

      const result = await submitReview(
        {
          restaurantId: "rest-1",
          nfcTagId: "tag-1",
          rating,
          body: "Decent",
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        { from } as any,
        notifier
      );

      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error).toMatch(/rating/i);
      expect(chain.insert).not.toHaveBeenCalled();
      expect(notifier.notifyOwnerOfReview).not.toHaveBeenCalled();
    }
  );

  it("returns an error and skips notification when the insert fails", async () => {
    const { from, chain } = makeSupabase({ data: null, error: { message: "rls" } });
    const notifier = makeNotifier();

    const result = await submitReview(
      {
        restaurantId: "rest-1",
        nfcTagId: "tag-1",
        rating: 4,
        body: "Tasty",
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { from } as any,
      notifier
    );

    expect(result.ok).toBe(false);
    expect(chain.insert).toHaveBeenCalled();
    expect(notifier.notifyOwnerOfReview).not.toHaveBeenCalled();
  });
});
