import { describe, it, expect, vi } from "vitest";
import { listTags, createTag, updateTagLabel } from "../nfc-tag-service";
import type { Database } from "../supabase/types";

type NfcTag = Database["public"]["Tables"]["nfc_tags"]["Row"];

const sampleTag: NfcTag = {
  id: "tag-1",
  restaurant_id: "rest-1",
  label: "Table 4",
  created_at: "2026-06-04T00:00:00Z",
};

function makeChain(resolveValue: unknown) {
  const chain: Record<string, unknown> = {};
  const resolve = () => Promise.resolve(resolveValue);
  chain.select = vi.fn().mockReturnValue(chain);
  chain.insert = vi.fn().mockReturnValue(chain);
  chain.update = vi.fn().mockReturnValue(chain);
  chain.eq = vi.fn().mockReturnValue(chain);
  chain.order = vi.fn().mockReturnValue(chain);
  chain.single = vi.fn().mockImplementation(resolve);
  chain.then = (
    onfulfilled: (v: unknown) => unknown,
    onrejected: (e: unknown) => unknown
  ) => resolve().then(onfulfilled, onrejected);
  return chain;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function makeSupabase(returnVal: unknown): { from: ReturnType<typeof vi.fn>; chain: any } {
  const chain = makeChain(returnVal);
  const from = vi.fn().mockReturnValue(chain);
  return { from, chain };
}

describe("listTags", () => {
  it("queries nfc_tags scoped to the given restaurantId", async () => {
    const { from, chain } = makeSupabase({ data: [sampleTag], error: null });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await listTags("rest-1", { from } as any);
    expect(from).toHaveBeenCalledWith("nfc_tags");
    expect(chain.select).toHaveBeenCalled();
    expect(chain.eq).toHaveBeenCalledWith("restaurant_id", "rest-1");
  });

  it("returns the tags array on success", async () => {
    const { from } = makeSupabase({ data: [sampleTag], error: null });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await listTags("rest-1", { from } as any);
    expect(result).toEqual([sampleTag]);
  });

  it("returns an empty array on error", async () => {
    const { from } = makeSupabase({ data: null, error: { message: "fail" } });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await listTags("rest-1", { from } as any);
    expect(result).toEqual([]);
  });
});

describe("createTag", () => {
  it("inserts a tag with the given restaurantId and label, returning the new row", async () => {
    const { from, chain } = makeSupabase({ data: sampleTag, error: null });
    const result = await createTag(
      "rest-1",
      "Table 4",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { from } as any
    );
    expect(from).toHaveBeenCalledWith("nfc_tags");
    expect(chain.insert).toHaveBeenCalledWith({ restaurant_id: "rest-1", label: "Table 4" });
    expect(result).toEqual(sampleTag);
  });

  it("throws on error", async () => {
    const { from } = makeSupabase({ data: null, error: { message: "fail" } });
    await expect(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      createTag("rest-1", "Bar", { from } as any)
    ).rejects.toThrow();
  });
});

describe("updateTagLabel", () => {
  it("updates only the label on the given tag id", async () => {
    const { from, chain } = makeSupabase({ data: null, error: null });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await updateTagLabel("tag-1", "Patio", { from } as any);
    expect(from).toHaveBeenCalledWith("nfc_tags");
    expect(chain.update).toHaveBeenCalledWith({ label: "Patio" });
    expect(chain.eq).toHaveBeenCalledWith("id", "tag-1");
  });

  it("does NOT update the id (id is immutable after creation)", async () => {
    const { from, chain } = makeSupabase({ data: null, error: null });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await updateTagLabel("tag-1", "Patio", { from } as any);
    const updateCall = chain.update.mock.calls[0][0];
    expect(updateCall).not.toHaveProperty("id");
    expect(updateCall).not.toHaveProperty("restaurant_id");
  });
});
