'use client'

import React, { UIEventHandler, useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, FileQuestion } from 'lucide-react';
import { DocumentPreviewError, getFileExtension } from '~/lib/document-kind';

/** Props shared by every non-PDF viewer; mirrors what PDFViewer receives. */
export type DocumentViewerProps = {
  file: File;
  setIsRendered?: (b: boolean) => void;
  onScroll?: UIEventHandler<HTMLDivElement>;
  scrollRef?: React.MutableRefObject<HTMLDivElement | null>;
  /** Reports an expected preview failure; the compare view shows its error panel. */
  onError: (error: DocumentPreviewError) => void;
};

/**
 * Scroll container used by every viewer, so the compare view's synced scrolling
 * works the same way it does for PDFs.
 */
function ScrollContainer({
  onScroll,
  scrollRef,
  className,
  children,
}: Pick<DocumentViewerProps, 'onScroll' | 'scrollRef'> & { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={className ?? 'size-full overflow-auto'}
      ref={(el) => {
        if (scrollRef) scrollRef.current = el;
      }}
      onScroll={onScroll}
      style={{ maxHeight: '100%', height: '100%' }}
    >
      {children}
    </div>
  );
}

/** Object URL for a file, revoked when the file changes or the viewer unmounts. */
function useObjectUrl(file: Blob): string | null {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let created: string | null = null;
    let cancelled = false;
    // Created after mount (not during render) so it can always be revoked.
    void Promise.resolve().then(() => {
      if (cancelled) return;
      created = URL.createObjectURL(file);
      setUrl(created);
    });
    return () => {
      cancelled = true;
      if (created) URL.revokeObjectURL(created);
    };
  }, [file]);
  return url;
}

/**
 * DOCX viewer: renders the document as paged HTML with docx-preview, scaled to fit
 * the panel width (like the PDF pages).
 */
export function DocxViewer({ file, setIsRendered, onScroll, scrollRef, onError }: DocumentViewerProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  // docx-preview scopes its generated CSS by class name; keep it unique per pane so
  // the original and the translated document cannot restyle each other.
  const className = `docx-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let cancelled = false;

    (async () => {
      try {
        const { renderAsync } = await import('docx-preview');
        // Render detached and swap in, so a cancelled (re-run) effect never leaves
        // a second copy of the document in the panel.
        const target = document.createElement('div');
        await renderAsync(file, target, target, {
          className,
          inWrapper: true,
          breakPages: true,
          ignoreLastRenderedPageBreak: true,
          useBase64URL: true,
          renderComments: false,
          renderChanges: false,
        });
        if (cancelled) return;
        host.replaceChildren(target);
        setIsRendered?.(true);
      } catch (error) {
        if (!cancelled) {
          onError(new DocumentPreviewError('render', getFileExtension(file.name), { cause: error }));
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [file, className, setIsRendered, onError]);

  // Scale the fixed-width pages down to the panel width.
  useEffect(() => {
    const content = contentRef.current;
    const host = hostRef.current;
    if (!content || !host) return;

    const fit = () => {
      const page = host.querySelector<HTMLElement>(`section.${className}`);
      if (!page) return;
      const pageWidth = page.offsetWidth + 60; // page plus the wrapper's 30px side padding
      const available = content.clientWidth;
      const scale = pageWidth > available && available > 0 ? available / pageWidth : 1;
      host.style.zoom = String(scale);
    };

    const ro = new ResizeObserver(fit);
    ro.observe(content);
    const mo = new MutationObserver(fit);
    mo.observe(host, { childList: true });
    return () => {
      ro.disconnect();
      mo.disconnect();
    };
  }, [className]);

  return (
    <ScrollContainer onScroll={onScroll} scrollRef={scrollRef}>
      <div ref={contentRef} className="w-full">
        <div ref={hostRef} />
      </div>
    </ScrollContainer>
  );
}

/** Plain text viewer. */
export function TextViewer({ file, setIsRendered, onScroll, scrollRef, onError }: DocumentViewerProps) {
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    file.text().then(
      (value) => {
        if (cancelled) return;
        setText(value);
        setIsRendered?.(true);
      },
      (error: unknown) => {
        if (!cancelled) {
          onError(new DocumentPreviewError('render', getFileExtension(file.name), { cause: error }));
        }
      },
    );
    return () => {
      cancelled = true;
    };
  }, [file, setIsRendered, onError]);

  return (
    <ScrollContainer onScroll={onScroll} scrollRef={scrollRef}>
      <pre className="min-h-full whitespace-pre-wrap break-words bg-background p-6 font-mono text-sm text-foreground">
        {text}
      </pre>
    </ScrollContainer>
  );
}

/** Image viewer, fit to the panel width. */
export function ImageViewer({ file, setIsRendered, onScroll, scrollRef, onError }: DocumentViewerProps) {
  const url = useObjectUrl(file);

  return (
    <ScrollContainer onScroll={onScroll} scrollRef={scrollRef}>
      {url && (
        // eslint-disable-next-line @next/next/no-img-element -- local object URL, nothing to optimise
        <img
          src={url}
          alt={file.name}
          className="block h-auto w-full"
          onLoad={() => setIsRendered?.(true)}
          onError={() => onError(new DocumentPreviewError('mismatch', getFileExtension(file.name)))}
        />
      )}
    </ScrollContainer>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Calm placeholder for formats the browser cannot preview yet (pptx, xlsx, doc...). */
export function UnsupportedPreview({ file, setIsRendered, onScroll, scrollRef }: DocumentViewerProps) {
  const { t } = useTranslation('custom');
  const url = useObjectUrl(file);
  const extension = getFileExtension(file.name);

  useEffect(() => {
    setIsRendered?.(true);
  }, [setIsRendered]);

  return (
    <ScrollContainer
      onScroll={onScroll}
      scrollRef={scrollRef}
      className="flex size-full items-center justify-center overflow-auto p-6"
    >
      <div
        data-testid="preview-unsupported"
        className="flex max-w-sm flex-col items-center gap-3 text-center"
      >
        <FileQuestion className="size-8 text-muted-foreground" />
        <p className="font-medium text-foreground">
          {extension
            ? t('previewNotAvailable', { extension })
            : t('previewNotAvailableGeneric')}
        </p>
        <p className="break-all text-sm text-muted-foreground">
          {file.name} · {formatFileSize(file.size)}
        </p>
        {url && (
          <a
            href={url}
            download={file.name}
            className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted"
          >
            <Download className="size-4" />
            {t('downloadFile')}
          </a>
        )}
      </div>
    </ScrollContainer>
  );
}
