'use client';

import { Trash2 } from "lucide-react";
import { Button } from "~/components/shadcn/button";
import TooltipComponent from "~/components/tooltip-component";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "~/lib/utils";
import { TrackableFile } from "~/lib/interfaces";
import { FileStatusIndicator } from "~/components/file-status-indicator";
import { FileIcon } from "~/components/file-icon";


/**
 * Props interface for the DocumentsList component
 */
interface DocumentsListProps {
  documents: TrackableFile[];                                // Array of files to display
  onDocumentRemove?: (filteredFiles: TrackableFile[]) => void;  // Optional callback for file removal
  disabled?: boolean;                                    // Optional disabled state
}

/**
 * DocumentsList Component
 * Displays a responsive grid of documents with icons, names, and status indicators
 */
export default function DocumentsList({ 
  documents, 
  onDocumentRemove, 
  disabled,
}: DocumentsListProps) {
    const gridRef = useRef<HTMLDivElement>(null);
    const { t } = useTranslation('ui');

    /**
     * Updates grid layout based on container size
     * Calculates optimal number of columns and rows for the available space
     */
    useEffect(() => {
        const updateGridLayout = () => {
            const grid = gridRef.current;
            if (grid) {
                const width = grid.offsetWidth;
                const height = grid.offsetHeight;
                const itemSize = 130;  // Fixed size for each grid item
                const gap = 16;        // Gap between grid items

                // Calculate optimal grid dimensions
                const columnCount = Math.floor((width - gap) / (itemSize + gap));
                const rowCount = Math.floor((height - gap) / (itemSize + gap));

                // Update CSS custom properties for grid layout
                grid.style.setProperty('--grid-column-count', `${columnCount}`);
                grid.style.setProperty('--grid-row-count', `${rowCount}`);
            }
        };

        // Initial layout update and resize listener
        updateGridLayout();
        window.addEventListener('resize', updateGridLayout);
        return () => window.removeEventListener('resize', updateGridLayout);
    }, []);

    /**
     * Handles file removal when delete button is clicked
     * @param index - Index of the file to remove
     */
    const handleRemoveFile = (index: number) => {
        if (!disabled && onDocumentRemove) {
            const file = documents[index];
            if (file) {
                onDocumentRemove([file]);
            }
        }
    }

    return (
        <div 
            ref={gridRef}
            className={cn(
                "grid gap-4 size-full border-2 p-4 rounded-md overflow-hidden",
                disabled && "opacity-50 cursor-not-allowed"
            )}
            style={{
                gridTemplateColumns: 'repeat(var(--grid-column-count, 3), 130px)',
                gridTemplateRows: 'repeat(var(--grid-row-count, 3), 130px)',
                gridAutoRows: '130px',
                gridAutoColumns: '130px',
            }}
        >
            {documents.map((document, index) => (
                <div 
                    key={index} 
                    className={cn(
                        "relative overflow-hidden rounded-lg group h-fit w-full flex items-center justify-center",
                        disabled && "pointer-events-none"
                    )}
                >
                    {/* Status indicator for file upload state */}
                    {document.uploadingStatus && (
                        <FileStatusIndicator 
                            id={document.id} 
                            status={document.uploadingStatus}
                        />
                    )}
                    {/* File icon and name */}
                    <div className="flex flex-col size-full items-center p-2 justify-center space-y-2 object-cover group-hover:opacity-20 transition-opacity">
                        <FileIcon file={document.fileObject} />
                        <p className="w-full px-2 text-sm text-center truncate">{document.fileObject.name}</p>
                    </div>
                    {/* Delete button (shown on hover) */}
                    {!disabled && (
                        <div className="absolute flex size-full items-center justify-center opacity-0 z-20 group-hover:opacity-100 transition-opacity">
                            <Button 
                                type="button" 
                                variant="light_foreground" 
                                size="fit" 
                                data-delete-file-item 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveFile(index);
                                }}
                                disabled={disabled}
                            >
                                <TooltipComponent 
                                    trigger={<Trash2 className="size-8 p-1.5" />} 
                                    content={<div>{t('delete')}</div>} 
                                />
                            </Button>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}