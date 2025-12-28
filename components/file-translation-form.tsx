import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "./shadcn/button";
import { cn } from '~/lib/utils';
import { useTranslation } from "react-i18next";

import { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react";

import { ReactNode } from "react";
import { Controller, useForm } from "react-hook-form";
import { formSchema } from "~/lib/schemas/translate-files";
import DocumentsUploader from "./documents-uploader";
import { LANGUAGES } from "~/lib/constants";
import CustomCombox from "./combox";
import { toast } from "sonner";
import { FormData } from "~/lib/types";
import { TrackableFile } from "~/lib/interfaces";


interface FileTranslationFormProps {
    targetLanguage: string;
    setTargetLanguage?: Dispatch<SetStateAction<string>>;
    files?: TrackableFile[];
    setFiles?: Dispatch<SetStateAction<TrackableFile[]>>;
    onSubmit?: (data: FormData) => void;
    onStartSubmit?: () => void;
    onFinishSubmit?: (success: boolean) => void;
    submitButton?: {
        content: ReactNode;
        x: "left" | "right" | "center";
        y: "top" | "bottom" | "center";
    }
}

export default function FileTranslationForm({
    targetLanguage,
    setTargetLanguage,
    files,
    setFiles,
    onSubmit,
    onStartSubmit,
    onFinishSubmit,
    submitButton
}: FileTranslationFormProps) {

    const { t } = useTranslation(['custom', 'ui']);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { control, handleSubmit, formState: { errors }, setValue } = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            filesIds: [],
            targetLanguage: targetLanguage,
        },
        mode: "onSubmit"
    });

    useEffect(() => {
        setValue('targetLanguage', targetLanguage);
    }, [targetLanguage, setValue]);

    useEffect(() => {
        // Keep the form's `filesIds` in sync with the *uploaded* files only.
        // This prevents submitting via Enter key (or stale form state) before uploads complete.
        if (!files) return;
        const uploadedIds = files
            .filter(f => f.fileObject && f.uploadingStatus === 'uploaded')
            .map(f => f.id)
            .filter((id): id is string => Boolean(id));

        setValue('filesIds', uploadedIds, { shouldValidate: true });
    }, [files, setValue]);

    const handleAddFiles = useCallback(async (toAddFiles: TrackableFile[]) => {
        try {
            // Initially set files with uploading status
            const filesWithUploadingStatus = toAddFiles.map(f => ({
                ...f,
                id: f.id ?? (typeof crypto !== 'undefined' ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`),
                uploadingStatus: 'uploading' as const
            }));
            
            if(setFiles){
                setFiles(prev => [...prev, ...filesWithUploadingStatus]);
            }
    
            setTimeout(() => {
                if(setFiles){
                    setFiles(prev => prev.map(f => f.uploadingStatus === 'uploading' ? { ...f, uploadingStatus: 'uploaded' } : f));
                }
            }, 3000);

        } catch (error) {
            console.log('Failed to add files:', error);
        }
    }, [setFiles]);


    const handleRemoveFiles = useCallback(async (toFilterFiles: TrackableFile[]) => {
        setFiles?.(prev => prev.filter(f => !toFilterFiles.includes(f)));
    }, [setFiles]);

    const handleSubmitComplete = async (data: FormData) => {
        // Extra guard: if `files` is provided, we require at least one uploaded file.
        // This handles edge cases where Enter submits or form state gets stale.
        if (files && !files.some(f => f.fileObject && f.uploadingStatus === 'uploaded')) {
            toast.error('Please wait until your file finishes uploading.');
            onFinishSubmit?.(false);
            return;
        }

        setIsSubmitting(true);
        onStartSubmit?.();

        try {
            await Promise.resolve(onSubmit?.(data));
            toast.success('Successfully submitted files for translation.');
            onFinishSubmit?.(true);
        } catch (error) {
            console.error('Submit failed:', error);
            toast.error(t('submitError'));
            onFinishSubmit?.(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(handleSubmitComplete)} className="flex flex-col justify-start size-full gap-4">
            {submitButton?.y === "top" && (
                <div className={cn("flex w-full px-2", submitButton.x === "left" ? "justify-start" : submitButton.x === "right" ? "justify-end" : "justify-center")} >
                    {submitButton.content ?? <Button type="submit" disabled={isSubmitting}>{t('submit')}</Button>}
                </div>
            )}
            
            <Controller
                name="targetLanguage"
                control={control}
                render={({ field }) => (
                    <CustomCombox
                        list={LANGUAGES}
                        tooltip={t('selectLanguageTooltip')}
                        onChange={(value) => {
                            field.onChange(value ?? 'en');
                            setTargetLanguage?.(value ?? 'en');
                        }}
                        initialValue={field.value}
                        placeholder={t('ui:selectLanguage')}
                        disabled={isSubmitting}
                    />
                )}
            />

            <Controller
                name="filesIds"
                control={control}
                render={() => (
                    <DocumentsUploader
                        documents={files}
                        setDocuments={setFiles}
                        disabled={isSubmitting}
                        onAddDocuments={handleAddFiles}
                        onRemoveDocuments={handleRemoveFiles}
                    />
                )}
            />

            {errors.filesIds && <p className="text-red-500">{errors.filesIds.message}</p>}
            
            {submitButton?.y === "bottom" && (
                <div className={cn("flex w-full px-2", submitButton.x === "left" ? "justify-start" : submitButton.x === "right" ? "justify-end" : "justify-center")} >
                    {submitButton.content ?? <Button type="submit" disabled={isSubmitting}>{t('submit')}</Button>}
                </div>
            )}
        </form>
    );
} 