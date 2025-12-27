import { AlertCircle } from 'lucide-react';
import { Button } from '../shadcn/button';
import { Trans } from '../trans';

/**
 * Props interface for PDFErrorFallback component
 */
interface PDFErrorFallbackProps {
  error: Error;                    // Error object from error boundary
  resetErrorBoundary: () => void;  // Function to reset error state
}

/**
 * PDFErrorFallback Component
 * Displays a user-friendly error message when PDF rendering fails
 * 
 * Features:
 * - Shows error alert with icon
 * - Provides retry button
 * - Internationalized error messages
 */
export function PDFErrorFallback({ resetErrorBoundary }: PDFErrorFallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center p-4 space-y-4 h-full">
      <div className="flex w-full max-w-xl items-start gap-3 rounded-md border border-destructive/40 bg-destructive/10 p-4 text-destructive">
        <AlertCircle className="mt-0.5 h-4 w-4" />
        <div className="flex flex-col gap-1">
          <div className="font-medium">
            <Trans i18nKey="ui:errorLoadingPDF" />
          </div>
          <div className="text-sm text-destructive/90">
            <Trans i18nKey="ui:errorLoadingPDFDescription" />
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