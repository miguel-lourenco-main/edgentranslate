"use client";

import React, { UIEventHandler, useEffect, useRef } from "react";

/**
 * DocxViewer Component
 * Renders a .docx client-side with docx-preview (paged HTML that keeps headings,
 * tables and images) inside the same kind of scroll container as PDFViewer, so the
 * compare view can sync scrolling between both sides.
 */
export default function DocxViewer({
  file,
  setIsRendered,
  onError,
  onScroll,
  scrollRef,
}: {
  file: File;
  setIsRendered?: (b: boolean) => void;
  onError?: (error: unknown) => void;
  onScroll?: UIEventHandler<HTMLDivElement>;
  scrollRef?: React.MutableRefObject<HTMLDivElement | null>;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const styleRef = useRef<HTMLDivElement | null>(null);

  // Expose the scroll container to callers (for scroll sync) after mount.
  useEffect(() => {
    if (!scrollRef) return;
    scrollRef.current = containerRef.current;
  }, [scrollRef]);

  useEffect(() => {
    const body = bodyRef.current;
    const styles = styleRef.current;
    if (!body || !styles) return;

    let cancelled = false;
    setIsRendered?.(false);

    import("docx-preview")
      .then(({ renderAsync }) =>
        renderAsync(file, body, styles, {
          className: "docx",
          inWrapper: true,
          breakPages: true,
          ignoreLastRenderedPageBreak: true,
          renderHeaders: true,
          renderFooters: true,
          useBase64URL: true,
        })
      )
      .then(() => {
        if (!cancelled) setIsRendered?.(true);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        body.replaceChildren();
        onError?.(error);
      });

    return () => {
      cancelled = true;
      body.replaceChildren();
      styles.replaceChildren();
    };
  }, [file, setIsRendered, onError]);

  return (
    <div
      ref={containerRef}
      onScroll={onScroll}
      className="size-full overflow-auto"
      style={{ maxHeight: "100%", height: "100%" }}
      data-testid="docx-viewer"
    >
      <div ref={styleRef} />
      {/* docx-preview centres pages with flexbox; a page wider than the panel would then
          overflow on the left, where it cannot be scrolled to. Growing the wrapper to the
          page width keeps the overflow on the right. */}
      <div
        ref={bodyRef}
        className="[&_.docx-wrapper]:bg-transparent [&_.docx-wrapper]:p-4 [&_.docx-wrapper]:w-max [&_.docx-wrapper]:min-w-full"
      />
    </div>
  );
}
