'use client';

import {useState } from 'react';
import { useTranslation } from 'react-i18next';
import RunsTable from './runs-table';
import { RunColumn, TrackableFile } from '~/lib/interfaces';
import GeneralLoading from '~/components/general-loading';
import PDFViewerDialog from '~/components/pdf/pdf-viewer-dialog';


export default function RunsPage() {
  const { t, ready } = useTranslation('custom');

  const [newFilesDialogOpen, setNewFilesDialogOpen] = useState<boolean>(false);
  const [compareDialogOpen, setCompareDialogOpen] = useState(false);
  const [files, setFiles] = useState<TrackableFile[]>([]);

  const [selectedRun, setSelectedRun] = useState<RunColumn | null>(null);
  const [selectedInputFile, setSelectedInputFile] = useState<TrackableFile | null>(null);
  const [selectedOutputFile, setSelectedOutputFile] = useState<TrackableFile | null>(null);

  const handleViewFiles = async (run: RunColumn) => {

    setSelectedRun(run);
    setSelectedInputFile(run.input_file_info);
    setSelectedOutputFile(run.output_file_info);
  }

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
          files={files}
          setFiles={setFiles}
          newFilesDialogOpen={newFilesDialogOpen} 
          setNewFilesDialogOpen={setNewFilesDialogOpen} 
          onViewFiles={handleViewFiles}
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
