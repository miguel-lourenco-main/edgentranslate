/**
 * Decides how the compare view can render a file.
 *
 * The declared kind comes from the extension and the MIME type; the file's first bytes
 * must then agree with it (PDF starts with "%PDF-", DOCX and PPTX are ZIP containers
 * starting with "PK\x03\x04"). A mislabelled file is reported as `unrenderable` instead
 * of being handed to a renderer that would throw.
 */

export type DocumentKind = 'pdf' | 'docx' | 'pptx' | 'unrenderable';

const MIME_KIND: Record<string, Exclude<DocumentKind, 'unrenderable'>> = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
};

const EXTENSION_KIND: Record<string, Exclude<DocumentKind, 'unrenderable'>> = {
  pdf: 'pdf',
  docx: 'docx',
  pptx: 'pptx',
};

/** Kind claimed by the file's name and MIME type, or null when they are unknown or disagree. */
export function declaredDocumentKind(file: Pick<File, 'name' | 'type'>): Exclude<DocumentKind, 'unrenderable'> | null {
  const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
  const byExtension = EXTENSION_KIND[extension] ?? null;
  const byMime = file.type ? MIME_KIND[file.type.toLowerCase()] ?? null : null;

  if (byExtension && byMime && byExtension !== byMime) return null;
  return byExtension ?? byMime;
}

/** Container format identified from the first bytes of a file. */
export function sniffContainer(bytes: Uint8Array): 'pdf' | 'zip' | null {
  // "%PDF-"
  if (bytes.length >= 5 && bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46 && bytes[4] === 0x2d) {
    return 'pdf';
  }
  // "PK\x03\x04"
  if (bytes.length >= 4 && bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04) {
    return 'zip';
  }
  return null;
}

export async function detectDocumentKind(file: File): Promise<DocumentKind> {
  const declared = declaredDocumentKind(file);
  if (!declared) return 'unrenderable';

  let container: 'pdf' | 'zip' | null = null;
  try {
    container = sniffContainer(new Uint8Array(await file.slice(0, 8).arrayBuffer()));
  } catch {
    return 'unrenderable';
  }

  if (declared === 'pdf') return container === 'pdf' ? 'pdf' : 'unrenderable';
  return container === 'zip' ? declared : 'unrenderable';
}

/** Upper-case extension for user-facing messages, e.g. "PPTX". */
export function documentFormatLabel(file: Pick<File, 'name'>): string {
  return (file.name.split('.').pop() ?? '').toUpperCase();
}
