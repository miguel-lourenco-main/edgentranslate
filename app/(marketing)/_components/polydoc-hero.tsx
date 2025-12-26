'use client'

import { Button } from "@kit/ui/button";
import { Hero } from "@kit/ui/marketing";
import TypingAnimation from "@kit/ui/typing-animation";
import { cn } from '@kit/ui/lib';
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import FileTranslationForm from "~/components/file-translation-form";
import { useSmoothScroll } from '~/lib/hooks/use-smooth-scroll';
import pathsConfig from "~/config/paths.config";
import { DEFAULT_TARGET_LANGUAGE, LANGUAGES } from "@kit/shared/constants";
import FileTranslationsExamples from './file-translations-examples';
import CustomCombox from "@kit/ui/combox-custom";
import { TrackableFile } from "@kit/ui/interfaces";
  
export default function PolydocHero() {

  const { t } = useTranslation('custom');

  const [files, setFiles] = useState<TrackableFile[]>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const { anchorRef, smoothScrollTo } = useSmoothScroll();

  const handleButtonClick = useCallback(() => {
    if (buttonRef.current) {
      const buttonTop = buttonRef.current.getBoundingClientRect().top;
      const targetScrollY = window.scrollY + buttonTop + 140;
      smoothScrollTo(targetScrollY);
    }
  }, [smoothScrollTo]);

  const [hasMounted, setHasMounted] = useState(false);
  const [isSmallViewport, setIsSmallViewport] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    const checkViewportHeight = () => {
      setIsSmallViewport(window.innerHeight < 900);
    };

    checkViewportHeight();
    window.addEventListener('resize', checkViewportHeight);

    return () => window.removeEventListener('resize', checkViewportHeight);
  }, []);

  const [targetLanguageExamples, setTargetLanguageExamples] = useState<string>(DEFAULT_TARGET_LANGUAGE);

  const [targetLanguageForm, setTargetLanguageForm] = useState<string>(DEFAULT_TARGET_LANGUAGE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  
  return (
    <div className='flex flex-col items-center space-y-16'>
      <Hero
        animate={false}
        title={
          hasMounted ?
          <TypingAnimation
            className="flex max-w-3xl text-5xl font-bold text-black dark:text-white"
            text={ t('websiteHeroTitle')}
            duration={50}
          /> :
          <div className='flex items-center justify-center size-full text-5xl font-bold text-black dark:text-white'>
            {t('websiteHeroTitle')}
          </div>
        }
        subtitle={
          <span>
            {t('websiteHeroSubtitle')}
          </span>
        }
      />
      <div ref={anchorRef} className="flex flex-col justify-center items-center h-full w-full transition-all duration-300 space-y-8" >
        <CustomCombox
          list={LANGUAGES}
          tooltip={t('selectLanguageTooltip')}
          onChange={(value) => {setTargetLanguageExamples(value ?? 'en')}}
          initialValue={targetLanguageExamples}
          placeholder={t('selectLanguage')}
        />
        <FileTranslationsExamples 
          targetLanguage={targetLanguageExamples} 
        />
        <Button
          ref={buttonRef}
          onClick={handleButtonClick}
          className='
            flex flex-col justify-center items-center 
            space-y-4 h-fit pb-0 
            bg-transparent text-foreground shadow-none
            transition-all duration-300 ease-in-out
            hover:bg-transparent hover:translate-y-1 hover:scale-105
            group
          '
        >
          <div className='relative flex bg-primary items-center justify-center px-6 py-3 rounded-lg overflow-hidden'>
            <span className={`relative z-10 text-background font-semibold ${isSmallViewport ? 'text-lg' : 'text-xl'}`}>
              {t('translateFiles')}
            </span>
          </div>
          <ChevronDown 
            className={`transition-colors text-primary duration-300 ease-in-out ${isSmallViewport ? 'size-12' : 'size-16'}`}
            strokeWidth={0.5} 
            style={{ transform: 'scaleX(2)' }}
          />
        </Button>
      </div>

      <div className='h-[50rem] w-[80%]'>
        <FileTranslationForm
          files={files}
          setFiles={setFiles}
          targetLanguage={targetLanguageForm}
          setTargetLanguage={setTargetLanguageForm}
          onStartSubmit={() => setIsSubmitting(true)}
          onFinishSubmit={(success) => {
            if (success) {
              router.push(pathsConfig.app.app);
            }
            setIsSubmitting(false);
          }}
          submitButton={{
            content: <MainCallToActionButton hasFilesUploaded={files.some(file => file.fileObject && file.uploadingStatus === 'uploaded')} isSubmitting={isSubmitting} />,
            x: 'right',
            y: 'bottom',
          }}
        />
      </div>
    </div>
  )
}

function MainCallToActionButton({ hasFilesUploaded, isSubmitting }: { hasFilesUploaded: boolean, isSubmitting: boolean }) {
  const { t } = useTranslation('custom');

  return (
    <div className='flex'>
      <Button
        type='submit'
        disabled={!hasFilesUploaded || isSubmitting}
        className={cn("transition-opacity duration-1000 ease-in-out", !hasFilesUploaded || isSubmitting ? 'bg-primary/50 hover:bg-primary/50 hover:shadow-none' : '')}
        style={{ opacity: hasFilesUploaded && !isSubmitting ? 1 : 0.7 }}
      >
        <span className='flex items-center'>
          <span>{t('translateFiles')}</span>
        </span>
      </Button>
    </div>
  );
}
