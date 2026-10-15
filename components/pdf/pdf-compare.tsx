'use client'

import { useRef, UIEvent, UIEventHandler, useState, useCallback, useMemo, useEffect } from 'react';
import LoadingDocument from "./loading-pdf";
import { useTranslation } from 'react-i18next';
import { FileIcon } from 'lucide-react';
import { cn } from '~/lib/utils';
import dynamic from 'next/dynamic';
import { Card } from '../shadcn/card';
import { TabData } from '~/lib/interfaces';
import { ErrorBoundary } from 'react-error-boundary';
import { PDFErrorFallback } from './pdf-error-fallback';
import {
    DocumentKind,
    DocumentPreviewError,
    detectDocumentKind,
    getFileExtension,
    matchesDocumentKind,
} from '~/lib/document-kind';
import { DocxViewer, ImageViewer, TextViewer, UnsupportedPreview } from './document-viewers';

// Dynamically import PDFViewer to avoid SSR issues
const PDFViewer = dynamic(() => import('./pdf-viewer'), { ssr: false });

/**
 * DocumentPreview Component
 * Checks that the file's bytes match its kind, then hands it to the matching viewer.
 * A mismatch (e.g. a text file renamed to .pdf) is reported through `onError`
 * instead of reaching a renderer that would throw its own exception.
 */
function DocumentPreview({
    file,
    kind,
    type,
    setIsRendered,
    onScroll,
    scrollRef,
    onError,
}: {
    file: File,
    kind: DocumentKind,
    onError: (error: DocumentPreviewError) => void,
    type?: string,
    setIsRendered?: (b: boolean) => void,
    onScroll?: UIEventHandler<HTMLDivElement>,
    scrollRef?: React.MutableRefObject<HTMLDivElement | null>,
}) {
    const [verified, setVerified] = useState(false);

    useEffect(() => {
        let cancelled = false;
        matchesDocumentKind(file, kind).then(
            (ok) => {
                if (cancelled) return;
                if (ok) setVerified(true);
                else onError(new DocumentPreviewError('mismatch', getFileExtension(file.name)));
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
    }, [file, kind, onError]);

    // Like PDFViewer's cleanup: a preview that goes away is no longer rendered, so the
    // next file starts from the loading state.
    useEffect(() => {
        return () => setIsRendered?.(false);
    }, [setIsRendered]);

    if (!verified) return null;

    const viewerProps = { file, setIsRendered, onScroll, scrollRef, onError };
    switch (kind) {
        case 'pdf':
            return (
                <PDFViewer
                    pdf={file}
                    setIsRendered={setIsRendered}
                    onScroll={onScroll}
                    scrollRef={scrollRef}
                    type={type}
                    onError={onError}
                />
            );
        case 'docx':
            return <DocxViewer {...viewerProps} />;
        case 'text':
            return <TextViewer {...viewerProps} />;
        case 'image':
            return <ImageViewer {...viewerProps} />;
        default:
            return <UnsupportedPreview {...viewerProps} />;
    }
}

/**
 * PDFView Component
 * Renders a single document preview (PDF, DOCX, text, image, or an "unsupported"
 * panel) with loading and error states. Used by both the hero compare panel and the
 * /app compare dialog.
 */
export function PDFView({
    file,
    isRendered,
    index,
    type,
    setIsRendered,
    handleScroll,
    scrollRefs,
}: {
    file: File | null,           // PDF file to display
    isRendered: boolean,         // Whether PDF is fully rendered
    index: number,               // Index for sync scrolling
    type?: string,               // PDF type identifier
    setIsRendered?: (b: boolean) => void,  // Callback when rendering completes
    handleScroll?: (index: number) => (e: UIEvent<HTMLDivElement>) => void,  // Sync scroll handler
    scrollRefs?: React.MutableRefObject<HTMLDivElement | null>[]  // Refs for sync scrolling
}) {
    const { t } = useTranslation("custom");

    const onScroll = handleScroll ? handleScroll(index) : undefined;
    const ref = scrollRefs?.[index] ? scrollRefs[index] : undefined;

    const kind = file ? detectDocumentKind(file) : null;
    const fileKey = file ? `${file.name}_${file.size}_${file.lastModified}` : '';

    // Expected failures (content does not match the extension, renderer rejected
    // the file) are reported by the viewers and shown without throwing, so nothing
    // is logged as an exception. Both are keyed by file so a new file starts clean.
    const [previewError, setPreviewError] = useState<{ key: string, error: DocumentPreviewError } | null>(null);
    const currentError = previewError?.key === fileKey ? previewError.error : null;
    const reportError = useCallback(
        (error: DocumentPreviewError) => setPreviewError({ key: fileKey, error }),
        [fileKey],
    );
    // Which file the error boundary caught an unexpected error for.
    const [failedFileKey, setFailedFileKey] = useState<string | null>(null);
    // The error panel must stay visible even though the viewer never reported itself
    // as rendered.
    const hasError = file !== null && (failedFileKey === fileKey || currentError !== null);

    const handleReset = () => {
        // Reset rendered state when retrying after error
        setFailedFileKey(null);
        setPreviewError(null);
        if (setIsRendered) {
            setIsRendered(false);
        }
    };

    return (
        <div className="size-full justify-center items-center overflow-hidden border-muted border rounded-md">
            {/* Show message when no file is available */}
            {!file && (
                <div className="size-full flex items-center justify-center">
                    {t('noFileCurrentlyAvailable')}
                </div>
            )}
            {/* Show loading state */}
            {((!isRendered && !hasError && file)) && <LoadingDocument />}
            {/* Render the document preview when a file is available */}
            {file && kind && (
                <div className={cn("h-full w-full", isRendered || hasError ? "flex" : "hidden")}>
                    {currentError ? (
                        <PDFErrorFallback error={currentError} resetErrorBoundary={handleReset} />
                    ) : (
                        <ErrorBoundary
                            FallbackComponent={PDFErrorFallback}
                            onError={() => setFailedFileKey(fileKey)}
                            onReset={handleReset}
                            resetKeys={[fileKey]}
                        >
                            <DocumentPreview
                                key={fileKey}
                                file={file}
                                kind={kind}
                                type={type}
                                setIsRendered={setIsRendered}
                                onScroll={onScroll}
                                scrollRef={ref}
                                onError={reportError}
                            />
                        </ErrorBoundary>
                    )}
                </div>
            )}
        </div>
    );
}

/**
 * PDFCompare Component
 * Displays two PDF viewers side by side with synchronized scrolling
 */
export default function PDFCompare({
    inputFile,
    outputFile,
    currentTab,
    type,
}: {
    inputFile: File | null;          // Original PDF file
    outputFile: File | null;         // Comparison PDF file
    currentTab?: TabData;            // Current tab information
    type?: string;                   // PDF type identifier
}) {
    // Read the files straight from props. Snapshotting them into state on mount made
    // the viewer keep showing the first file it received when the props changed.
    const [inputFileRendered, setInputFileRendered] = useState(false);
    const [outputFileRendered, setOutputFileRendered] = useState(false);

    // Refs for synchronized scrolling
    const scrollRef1 = useRef<HTMLDivElement>(null);
    const scrollRef2 = useRef<HTMLDivElement>(null);
    const scrollRefs = useMemo(() => [scrollRef1, scrollRef2], []);
    // Synchronized scrolling handler
    const handleScroll = useCallback((index: number) => (e: UIEvent<HTMLDivElement>) => {
        const otherIndex = 1 - index;
        const otherRef = scrollRefs[otherIndex]?.current;
        if (otherRef) {
            otherRef.scrollTop = e.currentTarget.scrollTop;
        }
    }, [scrollRefs]);

    return (
        <div className="flex flex-col size-full overflow-hidden">
            <div className="grid md:grid-cols-2 gap-4 h-full min-h-0">
                {/* Left PDF viewer */}
                <Card className="flex flex-col min-h-0 p-4">
                    <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
                        {currentTab?.icon ?? <FileIcon className="size-4" />}
                        <span>{currentTab?.exampleFiles?.original?.name ?? currentTab?.file}</span>
                    </div>
                    <div className={cn("size-full min-h-0 rounded-lg border bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center", 
                        !inputFileRendered && "flex-1")}>
                        <PDFView
                            file={inputFile}
                            isRendered={inputFileRendered}
                            index={0}
                            type={type}
                            setIsRendered={setInputFileRendered}
                            handleScroll={handleScroll}
                            scrollRefs={scrollRefs}
                        />
                    </div>
                </Card>
                {/* Right PDF viewer */}
                <Card className="flex flex-col min-h-0 p-4">
                    <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
                        {currentTab?.icon ?? <FileIcon className="size-4" />}
                        <span>{currentTab?.exampleFiles?.translated?.name ?? currentTab?.file}</span>
                    </div>
                    <div className={cn("size-full min-h-0 rounded-lg border bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center", 
                        !outputFileRendered && "flex-1")}>
                        <PDFView
                            file={outputFile}
                            isRendered={outputFileRendered}
                            index={1}
                            type={type}
                            setIsRendered={setOutputFileRendered}
                            handleScroll={handleScroll}
                            scrollRefs={scrollRefs}
                        />
                    </div>
                </Card>
            </div>
        </div>
    );
}