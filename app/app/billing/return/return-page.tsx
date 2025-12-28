'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import pathsConfig from '~/config/paths.config';
import GeneralLoading from '@kit/ui/general-loading';

export default function BillingReturnPage() {
  const router = useRouter();

  useEffect(() => {
    router.push(pathsConfig.app.personalAccountBilling);
  }, [router]);

  return <div className='h-full w-full justify-center items-center flex'><GeneralLoading /></div>;
} 