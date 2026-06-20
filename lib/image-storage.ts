// Image storage helper - saves files to public/uploads directory
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export async function ensureUserDir(userId: string): Promise<string> {
  const userDir = path.join(UPLOAD_DIR, userId);
  await fs.mkdir(userDir, { recursive: true });
  return userDir;
}

export async function saveImageFile(
  userId: string,
  file: File
): Promise<{ filename: string; filepath: string; publicUrl: string; size: number }> {
  const userDir = await ensureUserDir(userId);

  // Generate safe filename
  const ext = path.extname(file.name).toLowerCase() || ".png";
  const hash = crypto.randomBytes(8).toString("hex");
  const timestamp = Date.now();
  const safeName = `${timestamp}-${hash}${ext}`;

  const filepath = path.join(userDir, safeName);
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(filepath, buffer);

  // Public URL path
  const publicUrl = `/uploads/${userId}/${safeName}`;

  return { filename: safeName, filepath, publicUrl, size: buffer.length };
}

export async function deleteImageFile(userId: string, filename: string): Promise<void> {
  const filepath = path.join(UPLOAD_DIR, userId, filename);
  try {
    await fs.unlink(filepath);
  } catch {
    // File may not exist; ignore
  }
}

export function validateImageFile(file: File): string | null {
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  const maxSize = 25 * 1024 * 1024; // 25MB

  if (!allowed.includes(file.type)) {
    return "Only JPEG, PNG, and WebP images are allowed";
  }
  if (file.size > maxSize) {
    return `File size must be less than 25MB (got ${(file.size / 1024 / 1024).toFixed(1)}MB)`;
  }
  return null;
}