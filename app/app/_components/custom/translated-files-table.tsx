'use client';

import { useCallback, useMemo, useState } from 'react';
import { fileColumns } from './translated-files-columns';
import { Plus } from 'lucide-react';
import { Button } from '~/components/shadcn/button';
import TooltipComponent from '~/components/tooltip-component';
import { CustomDataTable } from '~/components/data-table/data-table';
import DialogLayout from '~/components/layouts/dialog-layout';
import { useTranslation } from 'react-i18next';
import FileTranslationForm from "~/components/file-translation-form";
import { TrackableFile } from '~/lib/interfaces';

export default function TranslatedFilesTable({
  files,
  setFiles
}: {
  files: TrackableFile[],
  setFiles: React.Dispatch<React.SetStateAction<TrackableFile[]>>
}) {

  const { t } = useTranslation('ui');

  const createToolbarButtons = useCallback(() => {

    return (
      <div className="flex items-center gap-x-4">
        <NewFilesButton files={files} setFiles={setFiles}/>
      </div>
    );
  }, [files, setFiles])

  return (
    <div className="size-full rounded-lg">
      <CustomDataTable
        data={files}
        columns={fileColumns(t)}
        tableLabel={t('files')}
        filters={[]}
        createToolbarButtons={createToolbarButtons}
      />
    </div>
  );
}

function NewFilesButton({
  files: externalFiles, 
  setFiles: externalSetFiles
} : {
  files: TrackableFile[], 
  setFiles: React.Dispatch<React.SetStateAction<TrackableFile[]>>
}){

  const { t } = useTranslation('ui');

  const [internalFiles, setInternalFiles] = useState<TrackableFile[]>([]);

  const files = useMemo(() => externalFiles ?? internalFiles, [externalFiles, internalFiles]);

  const setFiles = externalSetFiles ?? setInternalFiles;

  return (
    <DialogLayout
      trigger={ () => 
        <TooltipComponent 
          trigger={
            <Button variant="foreground" size="default" >
              <div className="flex flex-row items-center gap-x-1">
                <Plus className="size-[18px]"/>
                {t('new')}
              </div>
            </Button>
          } 
          content={<div>{t('translateFiles')}</div>} 
        />
      }
      title={t('translateFiles')}
      description={t('translateFilesDescription')}
      contentClassName="w-full"
    >
      <div className="h-[60vh] w-[60vw]">
        <FileTranslationForm
          files={files}
          setFiles={setFiles}
          targetLanguage="en"
          submitButton={{
            content:
              <Button
                type='submit'
                variant="default" 
                size="default"
              >
                {t('translate')}
              </Button>,
            x: "right",
            y: "bottom"
          }}
        />
      </div>
    </DialogLayout>
  )
}