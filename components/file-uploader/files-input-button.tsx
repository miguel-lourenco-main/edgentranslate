'use client'

import { ChangeEvent, useId } from "react";

/**
 * FileInputButton Component
 * A customizable button wrapper for file input functionality
 * 
 * @component
 */
export function FileInputButton({
  addDroppedFiles,
  acceptsTypes,
  content
}:{
  addDroppedFiles: (files: File[]) => void;  // Callback function when files are selected
  acceptsTypes: string;                      // Comma-separated string of accepted file types
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
   * Filters files based on accepted types and calls the callback
   */
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const droppedFiles = event.target.files ?? []
    const fileArray = Array.from(droppedFiles);

    // Parse accepted file types into array
    const acceptedTypes = acceptsTypes.split(',').map(type => type.trim());
    const acceptedFiles: File[] = [];
    const rejectedFiles: File[] = [];

    // Filter files based on type
    fileArray.forEach((file: File) => {
      if (acceptedTypes.some(type => file.type.match(type) ?? file.name.endsWith(type.replace('*', '')))) {
        acceptedFiles.push(file);
      } else {
        rejectedFiles.push(file);
      }
    });

    // Call callback with accepted files
    addDroppedFiles(acceptedFiles);
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
        accept={acceptsTypes}
      />
    </>
  )
}