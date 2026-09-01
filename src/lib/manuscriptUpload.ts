import {
  MANUSCRIPT_EXTENSIONS,
  MANUSCRIPT_MIME_TYPES,
  MAX_MANUSCRIPT_BYTES,
} from "@/data/manuscript";

export function getFileExtension(filename: string) {
  const parts = filename.toLowerCase().split(".");
  return parts.length > 1 ? (parts.pop() ?? "") : "";
}

export function isAllowedManuscriptFile(file: { name: string; type: string; size: number }) {
  if (file.size <= 0 || file.size > MAX_MANUSCRIPT_BYTES) {
    return false;
  }

  const extension = getFileExtension(file.name);
  if (!MANUSCRIPT_EXTENSIONS.has(extension)) {
    return false;
  }

  return !file.type || MANUSCRIPT_MIME_TYPES.has(file.type);
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function sanitizeFilename(name: string) {
  const cleaned = name.replace(/[^\w.\- ()[\]]+/g, "_").trim();
  return cleaned.slice(0, 180) || "manuscript";
}
