/**
 * Decide how the compare view should preview a file.
 *
 * The dropzone accepts more formats than the viewer can render, and the `type`
 * prop the viewer receives is only a hint, so the kind is derived from the file
 * itself: its extension first, its MIME type as a fallback.
 */

export type DocumentKind = 'pdf' | 'docx' | 'text' | 'image' | 'unsupported';

const KIND_BY_EXTENSION: Record<string, DocumentKind> = {
  pdf: 'pdf',
  docx: 'docx',
  txt: 'text',
  jpg: 'image',
  jpeg: 'image',
  png: 'image',
};

const KIND_BY_MIME: Record<string, DocumentKind> = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'text/plain': 'text',
  'image/jpeg': 'image',
  'image/png': 'image',
};

/** Lower-cased extension without the dot, or '' when the name has none. */
export function getFileExtension(name: string): string {
  const match = /\.([^./\\]+)$/.exec(name);
  return match?.[1]?.toLowerCase() ?? '';
}

/**
 * Classify a file for preview. A known extension wins over the MIME type, because
 * browsers often report an empty or generic type (and the /app flow copies the
 * type from the input file). Without a known extension the MIME type decides.
 * Anything else (doc, xls, xlsx, ppt, pptx, ...) is `unsupported`.
 */
export function detectDocumentKind(file: Pick<File, 'name' | 'type'>): DocumentKind {
  const extension = getFileExtension(file.name);
  if (extension) {
    return KIND_BY_EXTENSION[extension] ?? 'unsupported';
  }
  const mime = file.type.split(';')[0]?.trim().toLowerCase() ?? '';
  return KIND_BY_MIME[mime] ?? 'unsupported';
}

/**
 * Thrown when a file cannot be previewed: its bytes do not match its kind
 * (`mismatch`, e.g. a text file renamed to .pdf) or the renderer failed (`render`).
 * The compare view shows it as a translated error panel.
 */
export class DocumentPreviewError extends Error {
  constructor(
    public readonly reason: 'mismatch' | 'render',
    public readonly extension: string,
    options?: { cause?: unknown },
  ) {
    super(`Could not preview .${extension} file (${reason})`, options);
    this.name = 'DocumentPreviewError';
  }
}

const startsWith = (bytes: Uint8Array, signature: number[], offset = 0) =>
  signature.every((byte, i) => bytes[offset + i] === byte);

/**
 * Check the first bytes of a file against its kind, so a mislabelled file is
 * rejected before it reaches a renderer (which would log its own exception).
 * Text and unsupported files are not checked.
 */
export async function matchesDocumentKind(file: Blob, kind: DocumentKind): Promise<boolean> {
  if (kind === 'text' || kind === 'unsupported') return true;

  const bytes = new Uint8Array(await file.slice(0, 1024).arrayBuffer());

  switch (kind) {
    case 'pdf': {
      // "%PDF-" may be preceded by junk, but must appear in the first 1024 bytes.
      const header = new TextDecoder('latin1').decode(bytes);
      return header.includes('%PDF-');
    }
    case 'docx':
      // DOCX is a ZIP container: "PK\x03\x04".
      return startsWith(bytes, [0x50, 0x4b, 0x03, 0x04]);
    case 'image':
      return (
        startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]) || // PNG
        startsWith(bytes, [0xff, 0xd8, 0xff]) // JPEG
      );
  }
}
