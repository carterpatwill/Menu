import { describe, it, expect } from "vitest";
import { isAuthenticated } from "../auth-guard";

function makeSupabase(user: object | null, error: object | null = null) {
  return {
    auth: {
      getUser: () => Promise.resolve({ data: { user }, error }),
    },
  };
}

describe("isAuthenticated", () => {
  it("returns true when getUser returns a user", async () => {
    const supabase = makeSupabase({ id: "user-1", email: "a@b.com" });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(await isAuthenticated(supabase as any)).toBe(true);
  });

  it("returns false when getUser returns null user", async () => {
    const supabase = makeSupabase(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(await isAuthenticated(supabase as any)).toBe(false);
  });

  it("returns false when getUser returns an error", async () => {
    const supabase = makeSupabase(null, { message: "JWT expired" });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(await isAuthenticated(supabase as any)).toBe(false);
  });
});
