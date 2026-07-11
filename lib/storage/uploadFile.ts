import { supabase } from "@/lib/supabaseClient";

type UploadFileOptions = {
  bucket: string;
  folder?: string;
  upsert?: boolean;
  cacheControl?: string;
  filename?: string;
  maxSizeMB?: number; // Maximum file size in MB
};

export async function uploadFile(
  file: File,
  {
    bucket,
    folder = "",
    upsert = false,
    cacheControl = "3600",
    filename,
    maxSizeMB = 1, // Default 1MB limit
  }: UploadFileOptions,
) {
  if (!file) {
    throw new Error("No file provided");
  }

  // Check file size (convert MB to bytes)
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    throw new Error(`File size exceeds ${maxSizeMB}MB limit. Please upload a smaller file.`);
  }

  const fileExt = file.name.split(".").pop();
  if (!fileExt) {
    throw new Error("Invalid file type");
  }

  const finalFilename = filename ?? crypto.randomUUID();

  const filePath = folder
    ? `${folder}/${finalFilename}.${fileExt}`
    : `${finalFilename}.${fileExt}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl,
      upsert,
    });

  if (error) {
    console.error("UPLOAD ERROR:", error);
    throw error;
  }

  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return {
    path: filePath,
    publicUrl: data.publicUrl,
  };
}