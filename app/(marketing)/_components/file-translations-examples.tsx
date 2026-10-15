'use client';

import React, { useCallback, useEffect, useRef, useState, Suspense, useSyncExternalStore } from 'react';
import { Loader } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { TabData } from '~/lib/interfaces';
import { FileText, FileIcon, FileCode } from "lucide-react"
import { Button } from '~/components/shadcn/button';
import GeneralLoading from '~/components/general-loading';
import PDFCompare from '~/components/pdf/pdf-compare';
import { FileCache } from '~/lib/interfaces';

const initialTabs: TabData[] = [
  {
    icon: <FileText className='size-4' />,
    file: 'financial_report.pdf',
    exampleFiles: { original: null, translated: null },
  },
  {
    icon: <FileIcon className='size-4' />,
    file: 'legal_contract.pdf',
    exampleFiles: { original: null, translated: null },
  },
  {
    icon: <FileText className='size-4' />,
    file: 'technical_spec.pdf',
    exampleFiles: { original: null, translated: null },
  },
  {
    icon: <FileCode className='size-4' />,
    file: 'source_code.pdf',
    exampleFiles: { original: null, translated: null },
  },
];

export function useLoadPublicFiles({
  targetLanguage,
}: {
  targetLanguage: string;
}) {
  const [tabsData, setTabsData] = useState<TabData[]>(initialTabs);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<TabData | undefined>(initialTabs[0]);
  const fileCacheRef = useRef<FileCache>({});

  const currentFile = currentTab?.file;

  // Load the file pair for the selected tab + language. Keyed on the file name and
  // language only, and guarded by `cancelled`, so a slow response for a previously
  // selected tab can never overwrite the tab the user clicked last.
  useEffect(() => {
    if (!currentFile) return;

    let cancelled = false;
    const cacheKey = `${currentFile}_${targetLanguage}`;

    const applyFiles = (files: TabData['exampleFiles']) => {
      setTabsData(prev => prev.map(tab =>
        tab.file === currentFile ? { ...tab, exampleFiles: files } : tab
      ));
    };

    const cached = fileCacheRef.current[cacheKey];
    if (cached) {
      applyFiles(cached);
      return;
    }

    async function loadFilePair(file: string) {
      setIsLoading(true);
      setError(null);
      // Clear stale files for this tab (e.g. from another language) while loading.
      applyFiles({ original: null, translated: null });

      const translatedFile = file.replace(/\.[^/.]+$/, `_translated_${targetLanguage}$&`);
      const folder = file.split('.')[0];

      try {
        const [originalResponse, translatedResponse] = await Promise.all([
          fetch(`/files/${folder}/${file}`),
          fetch(`/files/${folder}/${translatedFile}`),
        ]);

        if (!originalResponse.ok || !translatedResponse.ok) {
          throw new Error(`Failed to fetch files for ${file}`);
        }

        const [originalBlob, translatedBlob] = await Promise.all([
          originalResponse.blob(),
          translatedResponse.blob(),
        ]);

        const files = {
          original: new File([originalBlob], file, { type: 'application/pdf' }),
          translated: new File([translatedBlob], translatedFile, { type: 'application/pdf' }),
        };

        fileCacheRef.current[cacheKey] = files;
        if (!cancelled) applyFiles(files);
      } catch (err) {
        console.warn('Error loading file:', err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadFilePair(currentFile);

    return () => {
      cancelled = true;
    };
  }, [currentFile, targetLanguage]);

  return { tabsData, isLoading, error, currentTab, setCurrentTab };
}

function useHasMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export default function FileTranslationsHero({
  targetLanguage
}: {
  targetLanguage: string;
}) {
  const { t } = useTranslation(`custom`);

  const { tabsData: tabs, error, currentTab, setCurrentTab } =
    useLoadPublicFiles({ targetLanguage });
  
  const hasMounted = useHasMounted();

  const handleTabSwitch = useCallback((newTabLabel: string) => {
    const newTab = tabs.find(tab => tab.file === newTabLabel);
    if (newTab) setCurrentTab(newTab);
  }, [setCurrentTab, tabs]);

  const renderTabContent = useCallback((tab: TabData) => {
    const { exampleFiles } = tab;
    if (!exampleFiles?.original || !exampleFiles?.translated) {
      return (
        <div className='flex flex-col items-center justify-center size-full space-y-3'>
          <span className='text-muted-foreground'>{t('fetchingFiles')}</span>
          <Loader className='h-5 animate-spin' />
        </div>
      );
    }

    return (
      <PDFCompare
        // Remount per file pair so the viewers never keep the previous tab's document.
        key={`${tab.file}_${exampleFiles.translated.name}`}
        inputFile={exampleFiles.original}
        outputFile={exampleFiles.translated}
        currentTab={tab}
        type={tab.file.split('.').pop()}
      />
    );
  }, [t]);

  return (
    <div className="flex flex-col w-[100rem] h-[43.5rem] bg-background border rounded-lg shadow-sm">
      <div className="flex items-center border-b overflow-x-auto">
        {tabs.map((tab) => (
          <Button
            key={tab.file}
            variant={currentTab?.file === tab.file ? "secondary" : "ghost"}
            className={`flex items-center gap-2 rounded-none border-r ${
              currentTab?.file === tab.file ? 'bg-muted' : ''
            }`}
            onClick={() => handleTabSwitch(tab.file)}
          >
            {tab.icon}
            <span className="max-w-[100px] truncate">{tab.file}</span>
          </Button>
        ))}
      </div>
      <div className="flex flex-col size-full min-h-0 justify-center items-center p-4">
        {error ? (
          <div className='flex items-center justify-center h-screen'>
            <p className='text-red-500'>{error}</p>
          </div>
        ) : (
          <Suspense fallback={<GeneralLoading />}>
            {hasMounted ? 
              renderTabContent(tabs.find(tab => tab.file === currentTab?.file)!)
              : 
              (
              <div className='flex flex-col items-center justify-center size-full text-muted-foreground gap-y-3'>
                {t('initializingDocViewer')}
                <Loader className='h-5 animate-spin' />
              </div>
              )
            }
          </Suspense>
        )}
      </div>
    </div>
  );
}