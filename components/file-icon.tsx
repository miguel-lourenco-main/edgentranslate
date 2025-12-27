import { File } from "lucide-react";
import { IconPDF, IconDOCX, IconDOC, IconPPTX } from "~/lib/icons";
import { FILE_SUPPORTED_TYPES } from "~/lib/constants";

/**
 * Props interface for the FileIcon component
 */
interface FileIconProps {
  file: File;                  // File object to determine icon type
  className?: string;          // Optional className for styling
}

/**
 * FileIcon Component
 * Renders an appropriate icon based on the file type
 * Supports PDF, DOCX, DOC, and PPTX file types
 * Falls back to a generic file icon for unsupported types
 * 
 * @param file - The file object to determine which icon to display
 * @param className - Optional CSS classes for styling (defaults to "size-12")
 * @returns The appropriate icon component for the file type
 */
export function FileIcon({ file, className = "size-12" }: FileIconProps) {
  // Get the supported extensions for the file type
  const extensions = FILE_SUPPORTED_TYPES[file.type as keyof typeof FILE_SUPPORTED_TYPES] || [];

  // Return the appropriate icon based on the file extension
  if (extensions.includes(".pdf")) {
    return <IconPDF className={className} />;
  } else if (extensions.includes(".docx")) {
    return <IconDOCX className={className} />;
  } else if (extensions.includes(".doc")) {
    return <IconDOC className={className} />;
  } else if (extensions.includes(".pptx")) {
    return <IconPPTX className={className} />;
  }
  
  // Fallback to generic file icon for unsupported types
  return <File className={className} />;
} 