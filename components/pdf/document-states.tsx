'use client'

import { AlertCircle, Download, FileWarning } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../shadcn/button';
import { documentFormatLabel } from '~/lib/document-kind';

/** Saves the in-memory file through a temporary object URL. */
function downloadFile(file: File) {
  const url = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url;
  link.download = file.name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

/**
 * Shown for formats the compare view cannot preview yet (PPTX), with a download link.
 */
export function DocumentPreviewUnavailable({ file }: { file: File }) {
  const { t } = useTranslation('ui');

  return (
    <div data-testid="document-preview-unavailable" className="flex flex-col items-center justify-center gap-4 p-4 size-full text-center">
      <FileWarning className="size-8 text-muted-foreground" />
      <div className="flex flex-col gap-1">
        <div className="font-medium">{t('documentPreviewUnavailable', { format: documentFormatLabel(file) })}</div>
        <div className="text-sm text-muted-foreground">{t('documentPreviewUnavailableDescription')}</div>
      </div>
      <Button type="button" variant="outline" onClick={() => downloadFile(file)}>
        <Download className="size-4 mr-2" />
        {t('downloadFile')}
      </Button>
    </div>
  );
}

/**
 * Shown when a file's contents do not match its declared format, or the renderer failed.
 */
export function DocumentCouldNotRender({ file, onRetry }: { file: File; onRetry?: () => void }) {
  const { t } = useTranslation('ui');

  return (
    <div data-testid="document-could-not-render" className="flex flex-col items-center justify-center gap-4 p-4 size-full">
      <div className="flex w-full max-w-xl items-start gap-3 rounded-md border border-destructive/40 bg-destructive/10 p-4 text-destructive">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
        <div className="flex flex-col gap-1">
          <div className="font-medium">{t('documentCouldNotRender')}</div>
          <div className="text-sm text-destructive/90">{t('documentCouldNotRenderDescription')}</div>
        </div>
      </div>
      <div className="flex gap-2">
        {onRetry && (
          <Button type="button" variant="outline" onClick={onRetry}>
            {t('retry')}
          </Button>
        )}
        <Button type="button" variant="outline" onClick={() => downloadFile(file)}>
          <Download className="size-4 mr-2" />
          {t('downloadFile')}
        </Button>
      </div>
    </div>
  );
}
