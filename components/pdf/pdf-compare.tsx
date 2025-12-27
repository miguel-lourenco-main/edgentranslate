'use client'

import { useRef, UIEvent, useState, useCallback, useMemo } from 'react';
import LoadingDocument from "./loading-pdf";
import { useTranslation } from 'react-i18next';
import { FileIcon } from 'lucide-react';
import { cn } from '~/lib/utils';
import dynamic from 'next/dynamic';
import { Card } from '../shadcn/card';
import { TabData } from '~/lib/interfaces';
import { ErrorBoundary } from 'react-error-boundary';
import { PDFErrorFallback } from './pdf-error-fallback';

// Dynamically import PDFViewer to avoid SSR issues
const PDFViewer = dynamic(() => import('./pdf-viewer'), { ssr: false });

/**
 * PDFView Component
 * Renders a single PDF viewer with loading and error states
 */
export function PDFView({
    file,
    isLoading,
    isRendered,
    index,
    type,
    setIsRendered,
    handleScroll,
    scrollRefs,
}: {
    file: File | null,           // PDF file to display
    isLoading: boolean,          // Loading state
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

    const handleReset = () => {
        // Reset rendered state when retrying after error
        if (setIsRendered) {
            setIsRendered(false);
        }
    };

    return (
        <div className="size-full justify-center items-center overflow-hidden border-muted border rounded-md">
            {/* Show message when no file is available */}
            {!file && !isLoading && (
                <div className="size-full flex items-center justify-center">
                    {t('noFileCurrentlyAvailable')}
                </div>
            )}
            {/* Show loading state */}
            {(isLoading || (!isRendered && file)) && <LoadingDocument />}
            {/* Render PDF viewer when file is available */}
            {file && (
                <div className={cn("h-full w-full", isRendered ? "flex" : "hidden")}>
                    <ErrorBoundary
                        FallbackComponent={PDFErrorFallback}
                        onReset={handleReset}
                    >
                        <PDFViewer 
                            key={`${file.name}_${file.size}_${file.lastModified}`}
                            pdf={file}
                            setIsRendered={setIsRendered}
                            onScroll={onScroll} 
                            scrollRef={ref} 
                            type={type}
                        />
                    </ErrorBoundary>
                </div>
            )}
        </div>
    );
}

/**
 * File state interface for tracking loading and file status
 */
type FileState = {
  status: 'idle' | 'loading' | 'success' | 'error';
  file: File | null;
};

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
    // State management for file loading and rendering
    const [inputFileState] = useState<FileState>({ 
        status:'success', 
        file: inputFile 
    });
    const [outputFileState] = useState<FileState>({ 
        status: 'success', 
        file: outputFile 
    });
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
                            file={inputFileState.file}
                            isLoading={inputFileState.status === 'loading'}
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
                            file={outputFileState.file}
                            isLoading={outputFileState.status === 'loading'}
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