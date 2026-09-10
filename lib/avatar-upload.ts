/**
 * Shared constraints for profile picture uploads. Kept dependency-free so both
 * the browser (pre-flight validation) and the API route (authoritative check)
 * can import it.
 */
export const AVATAR_MAX_BYTES = 4 * 1024 * 1024; // Under Vercel's 4.5MB body cap.

export const AVATAR_ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export const AVATAR_ACCEPT = Object.keys(AVATAR_ALLOWED_TYPES).join(",");

export function validateAvatarFile(file: {
  type: string;
  size: number;
}): string | null {
  if (!AVATAR_ALLOWED_TYPES[file.type]) {
    return "Profile pictures must be a JPEG, PNG, WebP, or GIF image.";
  }
  if (file.size === 0) {
    return "The selected file is empty.";
  }
  if (file.size > AVATAR_MAX_BYTES) {
    return `Profile pictures must be ${Math.floor(AVATAR_MAX_BYTES / 1024 / 1024)}MB or smaller.`;
  }
  return null;
}
