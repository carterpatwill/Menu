import { describe, it, expect, vi } from "vitest";
import { validateAndUpload } from "../image-upload";

function makeFile(name: string, type: string, sizeBytes: number): File {
  const content = new Uint8Array(sizeBytes);
  return new File([content], name, { type });
}

function makeStorage(publicUrl = "https://cdn.example.com/menu-images/abc.jpg") {
  const upload = vi.fn().mockResolvedValue({ data: { path: "abc.jpg" }, error: null });
  const getPublicUrl = vi.fn().mockReturnValue({ data: { publicUrl } });
  const from = vi.fn().mockReturnValue({ upload, getPublicUrl });
  return { storage: { from }, upload, getPublicUrl };
}

describe("validateAndUpload", () => {
  it("rejects non-image files", async () => {
    const { storage } = makeStorage();
    const file = makeFile("doc.pdf", "application/pdf", 100);
    const result = await validateAndUpload(file, { storage });
    expect("error" in result).toBe(true);
    expect(storage.from).not.toHaveBeenCalled();
  });

  it("rejects files over 5 MB", async () => {
    const { storage } = makeStorage();
    const file = makeFile("photo.jpg", "image/jpeg", 5 * 1024 * 1024 + 1);
    const result = await validateAndUpload(file, { storage });
    expect("error" in result).toBe(true);
    expect(storage.from).not.toHaveBeenCalled();
  });

  it("returns public URL on successful upload", async () => {
    const { storage } = makeStorage("https://cdn.example.com/menu-images/abc.jpg");
    const file = makeFile("photo.jpg", "image/jpeg", 1024);
    const result = await validateAndUpload(file, { storage });
    expect(result).toEqual({ url: "https://cdn.example.com/menu-images/abc.jpg" });
    expect(storage.from).toHaveBeenCalledWith("menu-images");
  });

  it("returns error when storage upload fails", async () => {
    const upload = vi.fn().mockResolvedValue({ data: null, error: { message: "storage error" } });
    const storage = { from: vi.fn().mockReturnValue({ upload, getPublicUrl: vi.fn() }) };
    const file = makeFile("photo.jpg", "image/jpeg", 1024);
    const result = await validateAndUpload(file, { storage });
    expect("error" in result).toBe(true);
  });
});
