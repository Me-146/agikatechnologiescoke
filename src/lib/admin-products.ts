import { supabase } from "@/integrations/supabase/client";

export const PRODUCT_BUCKET = "product-images";
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png"];
const SIGNED_URL_TTL = 60 * 60 * 24 * 365 * 5; // 5 years

export type ProductRow = {
  id: string;
  title: string;
  price: number;
  description: string | null;
  image_url: string | null;
  created_at: string;
  published: boolean;
};

/** Client-side validation. Returns an error message, or null when the file is fine. */
export function validateImage(file: File): string | null {
  const name = file.name.toLowerCase();
  const extOk = /\.(jpg|jpeg|png)$/.test(name);
  if (!ALLOWED_TYPES.includes(file.type) || !extOk) return "Please upload a JPG or PNG image.";
  if (file.size > MAX_IMAGE_BYTES) return "Image must be 5MB or smaller.";
  return null;
}

/** Recover the storage object path from a stored signed/public URL. */
export function storagePathFromUrl(url: string | null): string | null {
  if (!url) return null;
  const match = url.match(/\/product-images\/([^?]+)/);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

export async function assertAdmin(): Promise<string> {
  const { data: userData, error } = await supabase.auth.getUser();
  const uid = userData.user?.id;
  if (error || !uid) throw new Error("You do not have permission to perform this action.");
  const { data: role } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", uid)
    .eq("role", "admin")
    .maybeSingle();
  if (!role) throw new Error("You do not have permission to perform this action.");
  return uid;
}

export async function isAdminUser(): Promise<boolean> {
  try {
    await assertAdmin();
    return true;
  } catch {
    return false;
  }
}

/** Uploads to products/{uuid}.{ext}; returns storage path + a long-lived signed URL. */
export async function uploadProductImage(file: File): Promise<{ path: string; url: string }> {
  const ext = file.type === "image/png" ? "png" : "jpg";
  const path = `products/${crypto.randomUUID()}.${ext}`;
  const { error: uploadError } = await supabase.storage
    .from(PRODUCT_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });
  if (uploadError) {
    console.error("[admin] image upload failed", uploadError);
    throw new Error("Unable to upload product image. Please try again.");
  }
  const { data, error: signError } = await supabase.storage.from(PRODUCT_BUCKET).createSignedUrl(path, SIGNED_URL_TTL);
  if (signError || !data?.signedUrl) {
    console.error("[admin] signing image url failed", signError);
    await removeStorageObject(path);
    throw new Error("Unable to upload product image. Please try again.");
  }
  return { path, url: data.signedUrl };
}

export async function removeStorageObject(path: string | null) {
  if (!path) return;
  const { error } = await supabase.storage.from(PRODUCT_BUCKET).remove([path]);
  if (error) console.error("[admin] could not remove storage object", path, error);
}
