const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export interface StorageClient {
  storage: {
    from(bucket: string): {
      upload(
        path: string,
        file: File
      ): PromiseLike<{ data: { path: string } | null; error: unknown }>;
      getPublicUrl(path: string): { data: { publicUrl: string } };
    };
  };
}

export type UploadResult = { url: string } | { error: string };

export async function validateAndUpload(
  file: File,
  supabase: StorageClient
): Promise<UploadResult> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { error: `File type not allowed. Use: ${ALLOWED_TYPES.join(", ")}` };
  }
  if (file.size > MAX_SIZE_BYTES) {
    return { error: "File size must be 5 MB or less" };
  }

  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;
  const bucket = supabase.storage.from("menu-images");

  const { data, error } = await bucket.upload(path, file);
  if (error || !data) {
    const msg = error instanceof Error ? error.message : (error as { message?: string } | null)?.message ?? "Upload failed";
    return { error: msg };
  }

  const { data: urlData } = bucket.getPublicUrl(data.path);
  return { url: urlData.publicUrl };
}
