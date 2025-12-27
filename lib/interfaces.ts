/**
 * Interfaces for the UI package
 * 
 * Guidelines for defining interfaces here:
 * An interface should meet at least one of these requirements:
 * 1. The interface is shared between multiple UI components
 * 2. The interface is used by utility functions
 * 
 * Note: Component-specific interfaces should be defined in their respective
 * component files/folders. This file is exclusively for shared interfaces
 * used across multiple UI components or utility functions.
 * 
 * If an interface doesn't meet either requirement, consider placing it in
 * the component's own file/folder.
 */

import { JSX } from "react";
import { Run } from "./types";
import { LucideIcon } from "lucide-react";

export interface TrackableFile {
    /** Original File object */
    fileObject: File;
    /** Optional unique identifier for tracking */
    id?: string;
    /** Current status of the file in the upload process */
    uploadingStatus?: "uploading" | "uploaded" | "client" | "error";
}

export interface TabData {
    /** React element to be used as the tab's icon */
    icon: JSX.Element;
    /** File path or identifier */
    file: string;
    /** Original and translated file pairs */
    exampleFiles: {
        original: File | null;
        translated: File | null;
    };
}

/**
 * Interface defining the core file operation handlers
 */
export interface FileHandlers {
    handleDeleteAll: () => void;
    handleAddFiles: (newFiles: TrackableFile[]) => void;
    handleFileRemove: (filteredFiles: TrackableFile[]) => void;
}

export interface RunColumn extends Run {
  input_file_info: TrackableFile | null;
  output_file_info: TrackableFile | null;
}

interface CacheEntry {
  original: File;
  translated: File;
}

/** 
 * A cache mapping file identifiers to their original and translated versions
 * Its created here as to not creaate circular dependencies
 */
export type FileCache = Record<string, CacheEntry>;

export interface TranslationFile {
  id: string;
  name: string;
  status: string;
  usage: string;
}
export interface Filter {
  id: string;
  title: string;
  options: {
      value: string;
      label: string;
      icon: LucideIcon;
  }[];
}

export interface DataTableActions {
  name:string
  exec: () => void
  customItem: (() => React.ReactNode) | null
}

export interface CurrentBillingInfo {
  productName: string;
  tierText: string;
  tierIndex: number;
}

export interface Paths {
  signUp: string;
  return: string;
}

export type Interval = 'month' | 'year';