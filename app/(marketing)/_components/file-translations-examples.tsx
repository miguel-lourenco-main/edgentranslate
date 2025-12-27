'use client';

import React, { useCallback, useEffect, useState, Suspense, useSyncExternalStore } from 'react';
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
  const [fileCache, setFileCache] = useState<FileCache>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<TabData | undefined>(initialTabs[0]);

  const loadFilePair = useCallback(async (tab: TabData) => {
    const cacheKey = `${tab.file}_${targetLanguage}`;
    
    // Check cache first
    if (fileCache[cacheKey]) {
      return {
        ...tab,
        exampleFiles: fileCache[cacheKey],
      };
    }

    const originalFile = tab.file;
    const translatedFile = tab.file.replace(/\.[^/.]+$/, `_translated_${targetLanguage}$&`);
    const folder = originalFile.split('.')[0];

    try {
      const [originalResponse, translatedResponse] = await Promise.all([
        fetch(`/files/${folder}/${originalFile}`),
        fetch(`/files/${folder}/${translatedFile}`)
      ]);

      if (!originalResponse.ok || !translatedResponse.ok) {
        throw new Error(`Failed to fetch files for ${tab.file}`);
      }

      const [originalBlob, translatedBlob] = await Promise.all([
        originalResponse.blob(),
        translatedResponse.blob()
      ]);

      const files = {
        original: new File([originalBlob], originalFile, { type: 'application/pdf' }),
        translated: new File([translatedBlob], translatedFile, { type: 'application/pdf' }),
      };

      // Store in cache
      setFileCache(prev => ({
        ...prev,
        [cacheKey]: files
      }));

      return {
        ...tab,
        exampleFiles: files,
      };
    } catch (error) {
      console.warn('Error loading file:', error);
      return tab;
    }
  }, [targetLanguage, fileCache]);

  // Load files only for the current tab
  useEffect(() => {
    async function loadCurrentFile() {
      if (!currentTab || isLoading) return;
      
      setIsLoading(true);
      setError(null);

      try {
        if (!currentTab) return;

        const updatedTab = await loadFilePair(currentTab);
        
        setTabsData(prev => prev.map(tab => 
          tab.file === currentTab.file ? updatedTab : tab
        ));
      } catch (error) {
        console.error('Error in loadCurrentFile:', error);
        setError((error as Error).message);
      } finally {
        setIsLoading(false);
      }
    }

    void loadCurrentFile();
  }, [currentTab, targetLanguage, loadFilePair, isLoading]);

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

  const [isTabSwitching, setIsTabSwitching] = useState(false);
  const [mountKey, setMountKey] = useState(0);

  const handleTabSwitch = useCallback((newTabLabel: string) => {
    if (isTabSwitching) return;
    
    setIsTabSwitching(true);
    
    setMountKey(prev => prev + 1);

    const newTab = tabs.find(tab => tab.file === newTabLabel);
    
    setTimeout(() => {
      setCurrentTab(newTab);
      setIsTabSwitching(false);
    }, 300);
  }, [isTabSwitching, setCurrentTab, tabs]);

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
        key={mountKey}
        inputFile={exampleFiles.original}
        outputFile={exampleFiles.translated}
        currentTab={tab}
        type={tab.file.split('.').pop()}
      />
    );
  }, [t, mountKey]);

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
            disabled={isTabSwitching}
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