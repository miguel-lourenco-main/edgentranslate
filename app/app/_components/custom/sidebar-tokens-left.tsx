'use client';

import I18nComponent from "@kit/ui/i18n-component"
import { Button } from "@kit/ui/button"
import { If } from "@kit/ui/if";
import { useSidebar } from "@kit/ui/shadcn-sidebar";
import { useRouter } from "next/navigation";
import CurrentPages from "node_modules/@kit/billing-gateway/src/components/polydoc/current-pages"
import pathsConfig from "~/config/paths.config";

export default function SidebarTokensLeft() {
  const router = useRouter();

  const { minimized } = useSidebar();

  return(
    <>
      <If condition={!minimized}>
        <div className="flex flex-col w-full h-1/2 items-start gap-y-5 p-4 border shadow-lg bg-background rounded-lg">
            <CurrentPages size="small" collapsed={false}/>
            <Button variant="foreground" className="w-full" onClick={() => {
                router.push(pathsConfig.app.personalAccountBilling)
            }}>
                <I18nComponent i18nKey="custom:upgrade" />
            </Button>
        </div>
      </If>
      <If condition={minimized}>
        <div className="flex w-full justify-center">
          <div className="flex flex-col w-fit h-fit py-2 px-2 font-bold border shadow-lg bg-background rounded-lg">
            <CurrentPages size="small" collapsed={true}/>
          </div>
        </div>
      </If>
    </>
  )
}
