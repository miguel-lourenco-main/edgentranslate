import { AlertCircle } from 'lucide-react';
import { Button } from '../shadcn/button';
import { Trans } from '../trans';
import { DocumentPreviewError } from '~/lib/document-kind';

/**
 * Props interface for PDFErrorFallback component
 */
interface PDFErrorFallbackProps {
  error: unknown;                  // Error object from error boundary
  resetErrorBoundary: () => void;  // Function to reset error state
}

/**
 * PDFErrorFallback Component
 * Displays a user-friendly error message when a document preview fails
 *
 * Features:
 * - Shows error alert with icon
 * - Explains a file whose content does not match its extension
 * - Provides retry button
 * - Internationalized error messages
 */
export function PDFErrorFallback({ error, resetErrorBoundary }: PDFErrorFallbackProps) {
  const previewError = error instanceof DocumentPreviewError ? error : null;
  const extension = previewError?.extension || '?';

  let titleKey = 'ui:errorLoadingPDF';
  let descriptionKey = 'ui:errorLoadingPDFDescription';
  if (previewError?.reason === 'mismatch') {
    titleKey = 'custom:previewMismatchTitle';
    descriptionKey = 'custom:previewMismatchDescription';
  } else if (previewError && previewError.extension !== 'pdf') {
    titleKey = 'custom:previewErrorTitle';
    descriptionKey = 'custom:previewErrorDescription';
  }

  return (
    <div data-testid="preview-error" className="flex flex-col items-center justify-center p-4 space-y-4 h-full">
      <div className="flex w-full max-w-xl items-start gap-3 rounded-md border border-destructive/40 bg-destructive/10 p-4 text-destructive">
        <AlertCircle className="mt-0.5 h-4 w-4" />
        <div className="flex flex-col gap-1">
          <div className="font-medium">
            <Trans i18nKey={titleKey} values={{ extension }} />
          </div>
          <div className="text-sm text-destructive/90">
            <Trans i18nKey={descriptionKey} values={{ extension }} />
          </div>
        </div>
      </div>

      {/* Retry button */}
      <Button variant="outline" onClick={resetErrorBoundary}>
        <Trans i18nKey="ui:retry" />
      </Button>
    </div>
  );
}
