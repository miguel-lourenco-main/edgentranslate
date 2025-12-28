import { POLYDOC_BILLING_UPGRADE_PAGE_PATH } from "~/lib/constants";
import { Button } from "@kit/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@kit/ui/card";
import { Trans } from "@kit/ui/trans";
import { ArrowUpRight } from "lucide-react";
import { useRouter } from "next/navigation";

export function UpgradeBillingCard() {

  const router = useRouter()

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Trans i18nKey="billing:upgradeBillingCardTitle" />
        </CardTitle>

        <CardDescription>
          <Trans i18nKey="billing:upgradeBillingCardDescription" />
        </CardDescription>
      </CardHeader>

      <CardContent className={'space-y-2'}>
        <div>
          <Button data-test={'polydoc-billing-upgrade-button'} onClick={() => router.push(POLYDOC_BILLING_UPGRADE_PAGE_PATH)}>
            <span>
              <Trans i18nKey="billing:upgradeBillingCardButton" />
            </span>

            <ArrowUpRight className={'h-4'} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}