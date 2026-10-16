import type { TFunction } from "i18next";
import { ErrorCode, type FileRejection } from "react-dropzone";
import { FILE_SUPPORTED_TYPES, FILE_SUPPORTED_TYPES_VALUES, MAX_FILE_SIZE_MB, MAX_FILE_SIZE_STRING, MAX_FILES_PER_DROP } from "./constants";

/** Extensions accepted by an `accept` map, e.g. ".pdf, .docx, .pptx". */
export function formatAcceptedExtensions(accept: Record<string, string[]> = FILE_SUPPORTED_TYPES): string {
  const extensions = Object.values(accept).flat();
  return (extensions.length ? extensions : FILE_SUPPORTED_TYPES_VALUES).join(", ");
}

function matchesAccept(file: File, accept: Record<string, string[]>): boolean {
  const name = file.name.toLowerCase();
  const type = (file.type || "").toLowerCase();
  return Object.entries(accept).some(([mime, extensions]) =>
    type === mime.toLowerCase() || extensions.some(ext => name.endsWith(ext.toLowerCase()))
  );
}

/**
 * Splits picked files the same way react-dropzone does (type and size), for inputs
 * that do not go through the dropzone, so they can report the same rejection reasons.
 */
export function validateFiles(
  files: File[],
  accept: Record<string, string[]> = FILE_SUPPORTED_TYPES,
  maxSize: number = MAX_FILE_SIZE_MB,
): { accepted: File[]; rejected: FileRejection[] } {
  const accepted: File[] = [];
  const rejected: FileRejection[] = [];
  for (const file of files) {
    if (!matchesAccept(file, accept)) {
      rejected.push({ file, errors: [{ code: ErrorCode.FileInvalidType, message: "File type not accepted" }] });
    } else if (file.size > maxSize) {
      rejected.push({ file, errors: [{ code: ErrorCode.FileTooLarge, message: "File is larger than the limit" }] });
    } else {
      accepted.push(file);
    }
  }
  return { accepted, rejected };
}

/**
 * One translated message per distinct rejection reason, in the order they first appear.
 * Uses the `ui` namespace keys `fileTooLarge`, `fileInvalidType` and `tooManyFiles`.
 */
export function describeFileRejections(
  rejections: FileRejection[],
  t: TFunction,
  accept: Record<string, string[]> = FILE_SUPPORTED_TYPES,
): string[] {
  const messages: string[] = [];
  const seen = new Set<string>();
  for (const rejection of rejections) {
    for (const error of rejection.errors) {
      if (seen.has(error.code)) continue;
      seen.add(error.code);
      switch (error.code) {
        case ErrorCode.FileTooLarge:
          messages.push(`${t("ui:fileTooLarge")} ${MAX_FILE_SIZE_STRING}`);
          break;
        case ErrorCode.FileInvalidType:
          messages.push(t("ui:fileInvalidType", { formats: formatAcceptedExtensions(accept) }));
          break;
        case ErrorCode.TooManyFiles:
          messages.push(t("ui:tooManyFiles", { max: MAX_FILES_PER_DROP }));
          break;
        default:
          messages.push(t("ui:fileRejected"));
      }
    }
  }
  return messages;
}
