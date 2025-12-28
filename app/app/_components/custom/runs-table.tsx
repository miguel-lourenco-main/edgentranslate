'use client';

import { useCallback, useState } from 'react';
import { runsColumns } from './runs-columns';
import { Plus } from 'lucide-react';
import { Button } from '~/components/shadcn/button';
import TooltipComponent from '~/components/tooltip-component';
import { CustomDataTable } from '~/components/data-table/data-table';
import DialogLayout from '~/components/layouts/dialog-layout';
import { useTranslation } from 'react-i18next';
import { RunColumn, TrackableFile } from '~/lib/interfaces';
import FileTranslationForm from '~/components/file-translation-form';
import { DEFAULT_TARGET_LANGUAGE } from '~/lib/constants';
import { SafeTranslation } from './safe-translation';


export default function RunsTable({
  runs,
  newFiles,
  setNewFiles,
  newFilesDialogOpen,
  setNewFilesDialogOpen,
  onViewFiles,
  onCreateRuns,
}: {
  runs: RunColumn[],
  newFiles: TrackableFile[],
  setNewFiles: React.Dispatch<React.SetStateAction<TrackableFile[]>>,
  newFilesDialogOpen: boolean,
  setNewFilesDialogOpen: React.Dispatch<React.SetStateAction<boolean>>,
  onViewFiles: (run: RunColumn) => void,
  onCreateRuns: (input: { files: TrackableFile[]; targetLanguage: string }) => void,
}) {

  const { t } = useTranslation();

  // TODO: switch the translation file being used for the components that moved from ui package to polydoc app

  const createToolbarButtons = useCallback(() => {

    return (
      <div className="flex items-center gap-x-4">
        <NewFilesButton
          open={newFilesDialogOpen}
          setOpen={setNewFilesDialogOpen}
          files={newFiles}
          setFiles={setNewFiles}
          onCreateRuns={onCreateRuns}
        />
      </div>
    )

  }, [newFiles, setNewFiles, newFilesDialogOpen, setNewFilesDialogOpen, onCreateRuns]);

  return (
    <SafeTranslation>
      <CustomDataTable
        data={runs}
        columns={runsColumns(onViewFiles, t)}
        tableLabel={t('custom:translations_lowercase')}
        filters={[]}
        createToolbarButtons={createToolbarButtons}
        identifier="filename"
        initialSorting={[{ id: 'created_at', desc: true }]}
      />
    </SafeTranslation>
  );
}

function NewFilesButton({
  open,
  setOpen,
  files,
  setFiles,
  onCreateRuns,
}: {
  open: boolean,
  setOpen: React.Dispatch<React.SetStateAction<boolean>>,
  files: TrackableFile[],
  setFiles: React.Dispatch<React.SetStateAction<TrackableFile[]>>,
  onCreateRuns: (input: { files: TrackableFile[]; targetLanguage: string }) => void,
}){

  const { t } = useTranslation(['custom', 'ui']);

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
                {t('ui:new')}
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
      title={t('ui:translateFiles')}
      description={t('ui:translateFilesDescription')}
      contentClassName="w-fit"
    >
      <div className="h-[60vh] w-[60vw]">
        <FileTranslationForm
          files={files}
          setFiles={setFiles}
          targetLanguage={targetLanguage}
          setTargetLanguage={setTargetLanguage}
          onSubmit={async () => {
            onCreateRuns({ files, targetLanguage });
            setOpen(false);
          }}
          onStartSubmit={() => setIsSubmitting(true)}
          onFinishSubmit={() => setIsSubmitting(false)}
          submitButton={
            {
              content:
                <Button
                  type='submit'
                  variant="default" 
                  size="default"
                  disabled={isSubmitting || files.length === 0}
                >
                  {t('ui:translate')}
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