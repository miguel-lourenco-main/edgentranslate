'use client'

import { ChangeEvent, useId } from "react";
import type { FileRejection } from "react-dropzone";
import { FILE_SUPPORTED_TYPES } from "~/lib/constants";
import { validateFiles } from "~/lib/file-rejection";

/**
 * FileInputButton Component
 * A customizable button wrapper for file input functionality
 * 
 * @component
 */
export function FileInputButton({
  addDroppedFiles,
  onRejectFiles,
  accept = FILE_SUPPORTED_TYPES,
  content
}:{
  addDroppedFiles: (files: File[]) => void;  // Callback function when files are selected
  onRejectFiles?: (rejections: FileRejection[]) => void;  // Called with the files that were not accepted (empty when none)
  accept?: Record<string, string[]>;         // Accepted MIME types and their extensions
  content: (handleFileUpload: () => void) => React.ReactNode;  // Render function for custom button content
}){
  const inputId = useId();

  /**
   * Triggers the hidden file input click event
   */
  const handleFileUpload = () => {
    // Avoid using refs here to satisfy React Compiler lint rules.
    document.getElementById(inputId)?.click();
  };

  /**
   * Handles file selection changes
   * Filters files based on accepted types and size and calls the callbacks
   */
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const fileArray = Array.from(event.target.files ?? []);
    // Allow picking the same file again after a rejection.
    event.target.value = '';

    // Same type and size checks as the dropzone, so both entry points report the same reasons.
    const { accepted, rejected } = validateFiles(fileArray, accept);

    if (accepted.length > 0) addDroppedFiles(accepted);
    onRejectFiles?.(rejected);
  };

  return(
    <>
      {/* Render custom button content */}
      {content(handleFileUpload)}
      {/* Hidden file input */}
      <input
        id={inputId}
        type="file"
        multiple={true}
        style={{ display: 'none' }}
        onChange={handleFileChange}
        accept={Object.values(accept).flat().join(',')}
      />
    </>
  )
}