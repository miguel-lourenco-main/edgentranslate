"use client";

import { forwardRef, useCallback, useState } from "react";
import { FileRejection, useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { cn } from "~/lib/utils";
import { MAX_FILE_SIZE_MB, MAX_FILES_PER_DROP } from "~/lib/constants";
import { describeFileRejections } from "~/lib/file-rejection";

type DirectionOptions = 'ltr' | 'rtl';

type FilesDragNDropProps = {
  files?: Array<{ fileObject: File }>;
  addFiles: (files: Array<{ fileObject: File }>) => void;
  removeFiles: (files: Array<{ fileObject: File }>) => void;
  acceptFiles?: Record<string, string[]>;
  orientation?: 'horizontal' | 'vertical';
  disabled?: boolean;
  /**
   * Called after every drop or pick with the translated rejection reasons
   * (an empty array when everything was accepted), so a parent form can show them inline.
   */
  onRejectionChange?: (messages: string[]) => void;
};

/**
 * Default accepted file types with their corresponding extensions
 */
const DEFAULT_ACCEPT = {
  "application/pdf": [".pdf"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  "application/msword": [".doc"],
  "text/plain": [".txt"],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
  "application/vnd.ms-excel": [".xls"],
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": [".pptx"],
  "application/vnd.ms-powerpoint": [".ppt"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
};

/**
 * FilesDragNDrop Component
 * A reusable drag and drop component for file uploads with keyboard navigation support
 */
export const FilesDragNDrop = forwardRef<
  HTMLDivElement,
  FilesDragNDropProps & React.HTMLAttributes<HTMLDivElement>
>(
  (
    {
      files,
      addFiles,
      removeFiles,
      className,
      acceptFiles = DEFAULT_ACCEPT,
      orientation = "vertical",
      children,
      disabled,
      onRejectionChange
    },
    ref
  ) => {
    // Component state
    const [hasRejection, setHasRejection] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const { t } = useTranslation('ui');
    const direction: DirectionOptions = "ltr";

    /**
     * Handles file drop events
     * Adds the accepted files, then reports each distinct rejection reason
     * (format, size, count) instead of assuming every rejection is a size problem.
     */
    const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      if (acceptedFiles.length > 0) {
        addFiles(acceptedFiles.map(file => ({ fileObject: file })));
      }

      const messages = describeFileRejections(rejectedFiles, t, acceptFiles);
      for (const message of messages) {
        toast.error(message);
      }
      setHasRejection(messages.length > 0);
      onRejectionChange?.(messages);
    }, [addFiles, t, acceptFiles, onRejectionChange]);

    /**
     * Configure dropzone with options and event handlers
     */
    const dropzone = useDropzone({
      accept: acceptFiles,
      maxFiles: MAX_FILES_PER_DROP,
      maxSize: MAX_FILE_SIZE_MB,
      multiple: true,
      onDrop,
      noClick: true, // Disable automatic click handling
    });

    /**
     * Keyboard navigation handler
     * Supports arrow keys for navigation, Enter/Space for selection,
     * Delete/Backspace for removal, and Escape to clear selection
     */
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();

        if (!files) return;

        // Navigation helper functions
        const moveNext = () => {
          const nextIndex = activeIndex + 1;
          setActiveIndex(nextIndex > files.length - 1 ? 0 : nextIndex);
        };

        const movePrev = () => {
          const nextIndex = activeIndex - 1;
          setActiveIndex(nextIndex < 0 ? files.length - 1 : nextIndex);
        };

        // Determine navigation keys based on orientation and direction
        const prevKey = orientation === "horizontal"
          ? direction === "ltr" ? "ArrowLeft" : "ArrowRight"
          : "ArrowUp";

        const nextKey = orientation === "horizontal"
          ? direction === "ltr" ? "ArrowRight" : "ArrowLeft"
          : "ArrowDown";

        // Handle different key presses
        if (e.key === nextKey) {
          moveNext();
        } else if (e.key === prevKey) {
          movePrev();
        } else if (e.key === "Enter" || e.key === "Space") {
          if (activeIndex === -1) {
            dropzone.inputRef.current?.click();
          }
        } else if (e.key === "Delete" || e.key === "Backspace") {
          if (activeIndex !== -1) {
            removeFiles(files.filter((_, index) => index !== activeIndex));
            if (files.length - 1 === 0) {
              setActiveIndex(-1);
              return;
            }
            movePrev();
          }
        } else if (e.key === "Escape") {
          setActiveIndex(-1);
        }
      },
      [files, activeIndex, removeFiles, orientation, direction, dropzone.inputRef]
    );

    const handleClick = useCallback((e: React.MouseEvent) => {
      // Check if we're clicking a file or its controls
      const isFileClick = (e.target as HTMLElement).closest('[data-delete-file-item]');
      if (!isFileClick && !disabled) {
        dropzone.inputRef.current?.click();
      }
    }, [dropzone.inputRef, disabled]);

    return (
      <div
        ref={ref}
        tabIndex={0}
        onKeyDownCapture={handleKeyDown}
        className={cn("relative flex w-full h-full gap-4 p-2 focus:outline-none overflow-hidden", className)}
        dir={direction}
        data-testid="files-dropzone"
        data-rejected={hasRejection || undefined}
        {...dropzone.getRootProps()}
        onClick={handleClick}
      >
        <div className={cn("flex absolute top-0 left-0 z-10 items-center justify-center w-full h-full p-2 bg-background/80")}>
          <div
            className={cn(
              "flex flex-col items-center justify-center size-full rounded-lg duration-300 ease-in-out outline-dashed outline-1 cursor-pointer",
              // The dashed outline is the visible border, so colour the outline itself.
              dropzone.isDragAccept ? "outline-green-500" :
              dropzone.isDragReject || hasRejection ? "outline-red-500" : "outline-foreground",
              disabled && "cursor-not-allowed"
            )}
          >
            {children}
          </div>
          <input {...dropzone.getInputProps()} />
        </div>
      </div>
    );
  }
);

FilesDragNDrop.displayName = "FilesDragNDrop";

export default FilesDragNDrop;

