'use client'

import { useRef, UIEvent, useState, useCallback, useMemo, useEffect } from 'react';
import LoadingDocument from "./loading-pdf";
import { useTranslation } from 'react-i18next';
import { FileIcon } from 'lucide-react';
import { cn } from '~/lib/utils';
import dynamic from 'next/dynamic';
import { Card } from '../shadcn/card';
import { TabData } from '~/lib/interfaces';
import { ErrorBoundary } from 'react-error-boundary';
import { PDFErrorFallback } from './pdf-error-fallback';
import { DocumentCouldNotRender, DocumentPreviewUnavailable } from './document-states';
import { detectDocumentKind, DocumentKind } from '~/lib/document-kind';

// Dynamically import the viewers to avoid SSR issues
const PDFViewer = dynamic(() => import('./pdf-viewer'), { ssr: false });
const DocxViewer = dynamic(() => import('./docx-viewer'), { ssr: false });

/**
 * PDFView Component
 * Renders a single document viewer with loading and error states. The renderer is
 * chosen from the file's extension, MIME type and first bytes: PDF → react-pdf,
 * DOCX → docx-preview, PPTX → "preview not available" with a download link, and
 * anything that does not match its declared format → "could not render".
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
    file: File | null,           // Document to display
    isRendered: boolean,         // Whether the document is fully rendered
    index: number,               // Index for sync scrolling
    type?: string,               // Document type identifier
    setIsRendered?: (b: boolean) => void,  // Callback when rendering completes
    handleScroll?: (index: number) => (e: UIEvent<HTMLDivElement>) => void,  // Sync scroll handler
    scrollRefs?: React.MutableRefObject<HTMLDivElement | null>[]  // Refs for sync scrolling
}) {
    const { t } = useTranslation("custom");

    const onScroll = handleScroll ? handleScroll(index) : undefined;
    const ref = scrollRefs?.[index] ? scrollRefs[index] : undefined;

    // Detection result and render failure are tagged with the file they belong to, so a
    // new file never shows the previous file's state.
    const [detected, setDetected] = useState<{ file: File; kind: DocumentKind } | null>(null);
    const [failedFile, setFailedFile] = useState<File | null>(null);

    useEffect(() => {
        if (!file) return;
        let cancelled = false;
        void detectDocumentKind(file).then(kind => {
            if (!cancelled) setDetected({ file, kind });
        });
        return () => {
            cancelled = true;
        };
    }, [file]);

    const kind = file && detected?.file === file ? detected.kind : null;
    const failed = file !== null && failedFile === file;

    const handleError = useCallback(() => {
        setFailedFile(file);
    }, [file]);

    const handleReset = () => {
        // Reset rendered state when retrying after error
        setFailedFile(null);
        if (setIsRendered) {
            setIsRendered(false);
        }
    };

    const viewerKey = file ? `${file.name}_${file.size}_${file.lastModified}` : '';

    return (
        <div className="size-full justify-center items-center overflow-hidden border-muted border rounded-md">
            {/* Show message when no file is available */}
            {!file && (
                <div className="size-full flex items-center justify-center">
                    {t('noFileCurrentlyAvailable')}
                </div>
            )}
            {/* Detecting the format */}
            {file && kind === null && <LoadingDocument />}
            {file && (kind === 'unrenderable' || failed) && (
                <DocumentCouldNotRender file={file} onRetry={failed ? handleReset : undefined} />
            )}
            {file && kind === 'pptx' && <DocumentPreviewUnavailable file={file} />}
            {/* Show loading state, then the viewer once it has rendered */}
            {file && !failed && (kind === 'pdf' || kind === 'docx') && (
                <>
                    {!isRendered && <LoadingDocument />}
                    <div className={cn("h-full w-full", isRendered ? "flex" : "hidden")}>
                        <ErrorBoundary
                            FallbackComponent={PDFErrorFallback}
                            onReset={handleReset}
                        >
                            {kind === 'pdf' ? (
                                <PDFViewer
                                    key={viewerKey}
                                    pdf={file}
                                    setIsRendered={setIsRendered}
                                    onError={handleError}
                                    onScroll={onScroll}
                                    scrollRef={ref}
                                    type={type}
                                />
                            ) : (
                                <DocxViewer
                                    key={viewerKey}
                                    file={file}
                                    setIsRendered={setIsRendered}
                                    onError={handleError}
                                    onScroll={onScroll}
                                    scrollRef={ref}
                                />
                            )}
                        </ErrorBoundary>
                    </div>
                </>
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