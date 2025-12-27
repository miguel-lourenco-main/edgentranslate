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
  files,
  setFiles,
  newFilesDialogOpen,
  setNewFilesDialogOpen,
  onViewFiles,
}: {
  files: TrackableFile[],
  setFiles: React.Dispatch<React.SetStateAction<TrackableFile[]>>,
  newFilesDialogOpen: boolean,
  setNewFilesDialogOpen: React.Dispatch<React.SetStateAction<boolean>>,
  onViewFiles: (run: RunColumn) => void,
}) {

  const { t } = useTranslation('custom');

  // TODO: switch the translation file being used for the components that moved from ui package to polydoc app

  const createToolbarButtons = useCallback(() => {

    return (
      <div className="flex items-center gap-x-4">
        <NewFilesButton open={newFilesDialogOpen} setOpen={setNewFilesDialogOpen} files={files} setFiles={setFiles} />
      </div>
    )

  }, [files, setFiles, newFilesDialogOpen, setNewFilesDialogOpen]);

  return (
    <SafeTranslation>
      <CustomDataTable
        data={[]}
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

function NewFilesButton({ open, setOpen, files, setFiles }: { open: boolean, setOpen: React.Dispatch<React.SetStateAction<boolean>>, files: TrackableFile[], setFiles: React.Dispatch<React.SetStateAction<TrackableFile[]>> }){

  const { t } = useTranslation('custom');

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