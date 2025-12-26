'use client';

import { useCallback, useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import RunsTable from './runs-table';
import { RunColumn } from '~/lib/interfaces';
import { FileT, Run } from '~/lib/types';
import GeneralLoading from '@kit/ui/general-loading';
import { handleDelete, handleInsertOrUpdate } from '@kit/shared/utils';
import PDFViewerDialog from '@kit/ui/pdf-viewer-dialog';
import { getFile } from '~/lib/actions';
import { Database } from '~/lib/database.types';
import { getSupabaseBrowserClient } from '@kit/supabase/browser-client';


function getFileUrl(file: FileT, subscribedFiles: FileT[]): string | undefined {
  let url = file.url;

  if(file.file_extension !== 'pdf'){

    const pdfVariant = subscribedFiles.find(subbedFile => subbedFile.id === file.pdf_variant);

    if(pdfVariant){
      url = pdfVariant.url;
    }
  }

  return url;
}

export default function RunsPage({ 
  initialRuns, 
  initialFiles 
}: { 
  initialRuns: Run[], 
  initialFiles: FileT[] 
}) {
  const { t, ready } = useTranslation('custom');

  const [subscribedRuns, setSubscribedRuns] = useState<Run[]>(initialRuns);
  const [subscribedFiles, setSubscribedFiles] = useState<FileT[]>(initialFiles);

  const [newFilesDialogOpen, setNewFilesDialogOpen] = useState<boolean>(false);
  const [compareDialogOpen, setCompareDialogOpen] = useState(false);

  const [selectedRun, setSelectedRun] = useState<RunColumn | null>(null);

  const [fileCache, setFileCache] = useState<Record<string, File>>({});

  const [isInputFileLoading, setIsInputFileLoading] = useState(false);
  const [isOutputFileLoading, setIsOutputFileLoading] = useState(false);

  const fetchFile = useCallback(async ({fileId, url, filename}: {fileId: string, url?: string, filename?: string}) => {

    if (fileCache[fileId]) {
      return fileCache[fileId];
    }
    
    const file = url && filename
      ? await getFile(url, filename)
      : null

    console.log('fetchFile file:', file);

    if(file){
      setFileCache(prev => ({ ...prev, [fileId]: file }));
    }

    return file;
  }, [fileCache]);

  const handleViewFiles = useCallback(async (run: RunColumn) => {

    console.log('handleViewFiles run:', run);
    if (!run.input_file_id) return;
    
    setSelectedRun(run);
    setCompareDialogOpen(true);

    if (!fileCache[run.input_file_id]) {
      console.log('handleViewFiles input file not in cache:', run.input_file_id);
      setIsInputFileLoading(true);
    }
    if (run.output_file_id && !fileCache[run.output_file_id]) {
      console.log('handleViewFiles output file not in cache:', run.output_file_id);
      setIsOutputFileLoading(true);
    }

    try {

      if(!run.input_file_info) return;
      
      let url = getFileUrl(run.input_file_info, subscribedFiles);
      // Fetch input file
      await fetchFile({
        fileId: run.input_file_id, 
        url, 
        filename: run.input_file_info?.filename
      });
      setIsInputFileLoading(false);

      // Fetch output file if it exists
      if (!run.output_file_info || !run.output_file_id) return;

      const outputFilename = run.input_file_info?.filename.replace(/(\.[^.]+)$/, '-output$1');

      url = getFileUrl(run.output_file_info, subscribedFiles);

      await fetchFile({
        fileId: run.output_file_id, 
        url, 
        filename: outputFilename
      });

      setIsOutputFileLoading(false);

    } catch (error) {
      console.error('Error pre-fetching files:', error);
      setIsInputFileLoading(false);
      setIsOutputFileLoading(false);
    }
  }, [fetchFile, fileCache, subscribedFiles]);

  const selectedInputFile = useMemo(() => 
    selectedRun?.input_file_id ? fileCache[selectedRun.input_file_id] : null,
    [selectedRun, fileCache]
  );

  const selectedOutputFile = useMemo(() => 
    selectedRun?.output_file_id ? fileCache[selectedRun.output_file_id] : null,
    [selectedRun, fileCache]
  );

  // Set up subscriptions immediately since we have initial data
  useEffect(() => {
    console.log('Setting up Supabase subscriptions...');
    const client = getSupabaseBrowserClient<Database>();
    
    const runChannel = client.channel('run')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'run' },
        (payload) => {
          console.log('Run INSERT received:', payload.new);
          handleInsertOrUpdate({ setter: setSubscribedRuns, newItem: payload.new as Run })
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'run' },
        (payload) => {
          console.log('Run UPDATE received:', payload.new);
          handleInsertOrUpdate({ setter: setSubscribedRuns, newItem: payload.new as Run })
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'run' },
        (payload) => {
          console.log('Run DELETE received:', payload.old);
          handleDelete({ setter: setSubscribedRuns, deletedItemId: payload.old.id })
        }
      );

    const fileChannel = client.channel('file')
      .on(
        'postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'file' }, 
        (payload) => {
          console.log('File INSERT received:', payload.new);
          handleInsertOrUpdate({ setter: setSubscribedFiles, newItem: payload.new as FileT })
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'file' }, 
        (payload) => {
          console.log('File UPDATE received:', payload.new);
          handleInsertOrUpdate({ setter: setSubscribedFiles, newItem: payload.new as FileT })
        }
      )
      .on(
        'postgres_changes', 
        { event: 'DELETE', schema: 'public', table: 'file' }, 
        (payload) => {
          console.log('File DELETE received:', payload.old);
          handleDelete({ setter: setSubscribedFiles, deletedItemId: payload.old.id })
        }
      );

    void Promise.all([
      runChannel.subscribe(),
      fileChannel.subscribe()
    ]).then(() => {
      console.log('Channels subscribed');
    });

    return () => {
      console.log('Cleaning up Supabase subscriptions...');
      void Promise.all([
        runChannel.unsubscribe(),
        fileChannel.unsubscribe()
      ]);
    };
  }, []); // Only run once on mount

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
          runs={subscribedRuns} 
          files={subscribedFiles} 
          newFilesDialogOpen={newFilesDialogOpen} 
          setNewFilesDialogOpen={setNewFilesDialogOpen} 
          onViewFiles={handleViewFiles}
        />
      </div>
        <PDFViewerDialog
          inputFile={selectedInputFile ?? null}
          outputFile={selectedOutputFile ?? null}
          type={selectedRun?.input_file_info?.filename.split('.').pop()}
          externalOpen={compareDialogOpen}
          externalSetOpen={() => setCompareDialogOpen(false)}
          trigger={<div />} // Empty trigger as we're controlling it externally
          title={t('compareDocuments')}
          description={selectedRun?.input_file_info?.filename ?? ''}
          isInputFileLoading={isInputFileLoading}
          isOutputFileLoading={isOutputFileLoading}
        />
    </div>
  );
}
