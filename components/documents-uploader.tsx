import { useCallback, useState } from "react";
import { Dispatch, SetStateAction } from "react";
import { FILE_SUPPORTED_TYPES } from "~/lib/constants";
import FilesDragNDrop from "~/components/drag-n-drop/files-drag-n-drop";
import { FileHandlers, TrackableFile } from "~/lib/interfaces";
import { FileActionsBar } from "~/components/file-uploader/file-uploader-actions-bar";
import DocumentsGrid from "./documents-grid";
import { FileUploadGuide } from "~/components/drag-n-drop/file-upload-guide";


/**
 * Props interface for the CustomFileUploader component
 * Supports both controlled and uncontrolled usage through optional props
 */
interface DocumentsUploaderProps {
    documents?: TrackableFile[];              // External files array for controlled usage
    setDocuments?: Dispatch<SetStateAction<TrackableFile[]>>;  // External setState for controlled usage
    disabled?: boolean;                    // Flag to disable the uploader
    onAddDocuments?: (documents: TrackableFile[]) => void;         // Callback when files are added
    onRemoveDocuments?: (documents: TrackableFile[]) => void;      // Callback when files are removed
}


/**
 * CustomFileUploader Component
 * Main component that handles file upload functionality with drag-and-drop support
 */
export default function DocumentsUploader({
    documents: externalDocuments,
    setDocuments: externalSetDocuments,
    disabled,
    onAddDocuments,
    onRemoveDocuments
}: DocumentsUploaderProps) {

    // Internal state for uncontrolled usage
    const [internalDocuments, setInternalDocuments] = useState<TrackableFile[]>([]);
    const documents = externalDocuments ?? internalDocuments;

    // Unified setter that handles both controlled and uncontrolled modes
    const setDocuments = useCallback((newDocuments: SetStateAction<TrackableFile[]>) => {
        const updatedDocuments = typeof newDocuments === 'function' ? newDocuments(documents) : newDocuments;
        if (externalSetDocuments) {
            externalSetDocuments(updatedDocuments);
        } else {
            setInternalDocuments(updatedDocuments);
        }
    }, [externalSetDocuments, documents]);

    // File operation handlers
    const fileHandlers: FileHandlers = {
        // Handler to delete all files
        handleDeleteAll: useCallback(() => {
            setDocuments([]);
        }, [setDocuments]),

        // Handler to add new files
        handleAddFiles: useCallback((newFiles: TrackableFile[]) => {
            if (onAddDocuments) {
                onAddDocuments(newFiles);
            } else {
                setDocuments(prevDocuments => [...prevDocuments, ...newFiles]);
            }
        }, [setDocuments, onAddDocuments]),

        // Handler to remove specific files
        handleFileRemove: useCallback((filterFiles: TrackableFile[]) => {
            if (onRemoveDocuments) {
                onRemoveDocuments(filterFiles);
            } else {
                setDocuments(prevDocuments => prevDocuments.filter(document => !filterFiles.includes(document)));
            }
        }, [setDocuments, onRemoveDocuments])
    };

    return (
        <div className="flex flex-col gap-4 size-full">
            {/* Top action bar */}
            <FileActionsBar 
                files={documents} 
                disabled={disabled} 
                handlers={fileHandlers} 
            />
            {/* Drag and drop zone with file grid */}
            <FilesDragNDrop
                acceptFiles={FILE_SUPPORTED_TYPES}
                files={documents}
                addFiles={fileHandlers.handleAddFiles}
                removeFiles={fileHandlers.handleFileRemove}
                disabled={disabled}
            >
                {documents.length === 0 ? (
                    <FileUploadGuide acceptedFileTypes={FILE_SUPPORTED_TYPES} />
                ) : (
                    <DocumentsGrid 
                        documents={documents} 
                        onDocumentRemove={fileHandlers.handleFileRemove}
                        disabled={disabled} 
                    />
                )}
                
            </FilesDragNDrop>
        </div>
    );
} 