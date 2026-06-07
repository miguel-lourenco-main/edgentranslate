'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import RunsTable from './runs-table';
import { RunColumn, TrackableFile } from '~/lib/interfaces';
import GeneralLoading from '~/components/general-loading';
import PDFViewerDialog from '~/components/pdf/pdf-viewer-dialog';
import { useLandingPageFiles } from '~/components/files-provider';
import { DEFAULT_TARGET_LANGUAGE } from '~/lib/constants';

// Local-only translation runs page: seeds demo rows from the marketing workflow
// and simulates completion with timeouts (no backend API yet).
export default function RunsPage() {
  const { t, ready } = useTranslation('custom');

  const [newFilesDialogOpen, setNewFilesDialogOpen] = useState<boolean>(false);
  const [compareDialogOpen, setCompareDialogOpen] = useState(false);
  const [newFiles, setNewFiles] = useState<TrackableFile[]>([]);
  const [runs, setRuns] = useState<RunColumn[]>([]);

  const [selectedRun, setSelectedRun] = useState<RunColumn | null>(null);
  const [selectedInputFile, setSelectedInputFile] = useState<TrackableFile | null>(null);
  const [selectedOutputFile, setSelectedOutputFile] = useState<TrackableFile | null>(null);

  const landingWorkflow = useLandingPageFiles();
  const seededFromLandingRef = useRef(false);

  const handleViewFiles = async (run: RunColumn) => {

    setSelectedRun(run);
    setSelectedInputFile(run.input_file_info);
    setSelectedOutputFile(run.output_file_info);
    setCompareDialogOpen(true);
  }

  const targetLanguage = useMemo(
    () => landingWorkflow.landingTargetLanguage ?? DEFAULT_TARGET_LANGUAGE,
    [landingWorkflow.landingTargetLanguage],
  );

  useEffect(() => {
    // Hydrate "fake runs" from the landing page workflow (marketing -> /app)
    if (seededFromLandingRef.current) return;
    // Wait until the provider has attempted hydration (savedAt is only set after load/save).
    if (landingWorkflow.landingWorkflowSavedAt == null) return;
    if (!landingWorkflow.landingPageFiles.length) return;
    seededFromLandingRef.current = true;

    const createdAt = new Date().toISOString();

    const seededRuns: RunColumn[] = landingWorkflow.landingPageFiles.map((file) => {
      const inputId = crypto.randomUUID();
      const outputId = crypto.randomUUID();

      const inputTf: TrackableFile = {
        id: inputId,
        fileObject: file,
        uploadingStatus: 'client',
      };

      const outputFile = new File([file], `translated-${file.name}`, {
        type: file.type,
        lastModified: Date.now(),
      });

      const outputTf: TrackableFile = {
        id: outputId,
        fileObject: outputFile,
        uploadingStatus: 'client',
      };

      return {
        id: crypto.randomUUID(),
        account_id: 'local',
        created_at: createdAt,
        credits: null,
        finished_at: null,
        input_file_id: inputId,
        input_tokens: null,
        output_file_id: outputId,
        output_tokens: null,
        status: 'running',
        target_language: targetLanguage,
        input_file_info: inputTf,
        output_file_info: outputTf,
      };
    });

    setRuns((prev) => [...seededRuns, ...prev]);

    // Important: clear the landing workflow after we consume it so revisiting /app is empty.
    // (We still keep the in-memory `runs` state for the current session.)
    void (async () => {
      try {
        await landingWorkflow.clearLandingWorkflow();
      } catch {
        // ignore
      }
    })();

    window.setTimeout(() => {
      setRuns((prev) =>
        prev.map((r) =>
          r.created_at === createdAt
            ? {
                ...r,
                status: 'succeeded',
                finished_at: new Date().toISOString(),
                output_tokens: r.output_tokens ?? 1234,
              }
            : r,
        ),
      );
    }, 1800);
  }, [
    landingWorkflow.landingWorkflowSavedAt,
    landingWorkflow.landingPageFiles,
    targetLanguage,
  ]);

  // Create optimistic "running" rows from newly uploaded files; flip to succeeded after a delay.
  const createRunsFromFiles = (input: { files: TrackableFile[]; targetLanguage: string }) => {
    const createdAt = new Date().toISOString();

    const createdRuns: RunColumn[] = input.files
      .filter((f) => f.fileObject && f.uploadingStatus === 'uploaded')
      .map((f) => {
        const inputId = crypto.randomUUID();
        const outputId = crypto.randomUUID();

        const inputTf: TrackableFile = {
          id: inputId,
          fileObject: f.fileObject,
          uploadingStatus: 'client',
        };

        const outputFile = new File([f.fileObject], `translated-${f.fileObject.name}`, {
          type: f.fileObject.type,
          lastModified: Date.now(),
        });

        const outputTf: TrackableFile = {
          id: outputId,
          fileObject: outputFile,
          uploadingStatus: 'client',
        };

        return {
          id: crypto.randomUUID(),
          account_id: 'local',
          created_at: createdAt,
          credits: null,
          finished_at: null,
          input_file_id: inputId,
          input_tokens: null,
          output_file_id: outputId,
          output_tokens: null,
          status: 'running',
          target_language: input.targetLanguage,
          input_file_info: inputTf,
          output_file_info: outputTf,
        };
      });

    setRuns((prev) => [...createdRuns, ...prev]);

    window.setTimeout(() => {
      setRuns((prev) =>
        prev.map((r) =>
          r.created_at === createdAt
            ? {
                ...r,
                status: 'succeeded',
                finished_at: new Date().toISOString(),
                output_tokens: r.output_tokens ?? 1234,
              }
            : r,
        ),
      );
    }, 1800);
  };

  if (!ready) {
    return <GeneralLoading />;
  }

  return (
    <div className="flex flex-col h-full p-6">
      <h3 className="mb-2 text-2xl font-semibold text-foreground">
        {t('translations')}
      </h3>
      <p className="mb-4 text-sm text-muted-foreground">
        {t('translationsDescription')}
      </p>
      <div className='flex-1 min-h-0'>
        <RunsTable
          runs={runs}
          newFiles={newFiles}
          setNewFiles={setNewFiles}
          newFilesDialogOpen={newFilesDialogOpen} 
          setNewFilesDialogOpen={setNewFilesDialogOpen} 
          onViewFiles={handleViewFiles}
          onCreateRuns={createRunsFromFiles}
        />
      </div>
        <PDFViewerDialog
          inputFile={selectedInputFile?.fileObject ?? null}
          outputFile={selectedOutputFile?.fileObject ?? null}
          type={selectedRun?.input_file_info?.fileObject?.name.split('.').pop()}
          externalOpen={compareDialogOpen}
          externalSetOpen={() => setCompareDialogOpen(false)}
          trigger={<div />} // Empty trigger as we're controlling it externally
          title={t('compareDocuments')}
          description={selectedRun?.input_file_info?.fileObject?.name ?? ''}
        />
    </div>
  );
}
