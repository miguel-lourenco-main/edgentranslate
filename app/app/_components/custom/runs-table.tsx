'use client';

import { useCallback, useEffect, useState } from 'react';
import { runsColumns } from './runs-columns';
import { Plus } from 'lucide-react';
import { Button } from '@kit/ui/button';
import TooltipComponent from '@kit/ui/tooltip-component';
import { CustomDataTable } from '@kit/ui/custom-data-table';
import DialogLayout from '@kit/ui/dialog-layout';
import { useTranslation } from 'react-i18next';
import { RunColumn } from '~/lib/interfaces';
import { FileT, Run } from '~/lib/types';
import { transformRuns } from '~/lib/utils';
import FileTranslationForm from '~/components/file-translation-form';
import { DEFAULT_TARGET_LANGUAGE } from '@kit/shared/constants';
import { SafeTranslation } from './safe-translation';
import { TrackableFile } from '@kit/ui/interfaces';


export default function RunsTable({
  runs,
  files,
  newFilesDialogOpen,
  setNewFilesDialogOpen,
  onViewFiles,
}: {
  runs: Run[],
  files: FileT[],
  newFilesDialogOpen: boolean,
  setNewFilesDialogOpen: React.Dispatch<React.SetStateAction<boolean>>,
  onViewFiles: (run: RunColumn) => void,
}) {

  const { t } = useTranslation('custom');

  // TODO: switch the translation file being used for the components that moved from ui package to polydoc app

  const createToolbarButtons = useCallback(() => {

    return (
      <div className="flex items-center gap-x-4">
        <NewFilesButton open={newFilesDialogOpen} setOpen={setNewFilesDialogOpen} />
      </div>
    )

  }, [newFilesDialogOpen, setNewFilesDialogOpen]);

  const [transformedRuns, setTransformedRuns] = useState<RunColumn[]>(transformRuns(runs, files));

  useEffect(() => {
    setTransformedRuns(transformRuns(runs, files));
  }, [runs, files]);

  return (
    <SafeTranslation>
      <CustomDataTable
        data={transformedRuns}
        columns={runsColumns(files, onViewFiles, t)}
        tableLabel={t('translations_lowercase')}
        filters={[]}
        createToolbarButtons={createToolbarButtons}
        identifier="filename"
        initialSorting={[{ id: 'created_at', desc: true }]}
      />
    </SafeTranslation>
  );
}

function NewFilesButton({ open, setOpen }: { open: boolean, setOpen: React.Dispatch<React.SetStateAction<boolean>> }){

  const { t } = useTranslation('custom');

  const [files, setFiles] = useState<TrackableFile[]>([]);

  const [targetLanguage, setTargetLanguage] = useState<string>(DEFAULT_TARGET_LANGUAGE);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  return (
    <DialogLayout
      externalOpen={open}
      externalSetOpen={setOpen}
      trigger={ () => 
        <TooltipComponent 
          trigger={
            <Button variant="foreground" size="default" onClick={() => {
              setOpen(true)
            }}>
              <div className="flex flex-row items-center gap-x-1">
                <Plus className="h-[18px] w-[18px]"/>
                {t('new')}
              </div>
            </Button>
          } 
          content={<div>{t('translateFiles')}</div>} 
        />
      }
      reset={() => {

        console.log('reset');
        setFiles([])
        setTargetLanguage(DEFAULT_TARGET_LANGUAGE)
        setIsSubmitting(false)
      }}
      title={t('translateFiles')}
      description={t('translateFilesDescription')}
      contentClassName="w-fit"
    >
      <div className="h-[60vh] w-[60vw]">
        <FileTranslationForm
          files={files}
          setFiles={setFiles}
          targetLanguage={targetLanguage}
          setTargetLanguage={setTargetLanguage}
          onStartSubmit={() => {
            setIsSubmitting(true);
          }}
          onFinishSubmit={(success) => {
            if (success) {
              setFiles([])
              setOpen(false);
            }
            setIsSubmitting(false);
          }}
          submitButton={
            {
              content:
                <Button
                  type='submit'
                  variant="default" 
                  size="default"
                  disabled={isSubmitting || files.length === 0}
                >
                  {t('translate')}
                </Button>,
              x: 'right',
              y: 'bottom',
            }
          }
        />
      </div>
    </DialogLayout>
  )
}