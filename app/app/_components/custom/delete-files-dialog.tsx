import React from 'react';

import { AlertDialogAction, AlertDialogCancel, AlertDialogFooter} from '@kit/ui/alert-dialog';
import { DeleteDialogLayout } from '@kit/ui/alert-dialog-layouts';
import { Trash } from 'lucide-react';
import { cn } from '@kit/ui/lib';
import { useTranslation } from 'react-i18next';


export default function DeleteFilesDialog({
    onDelete,
    hasSelected
}:{
    onDelete: () => void
    hasSelected?: boolean
}) {

    const { t } = useTranslation('ui')

    const trigger = () => {
        return(
            <button
                disabled={!hasSelected}
                className="flex flex-row w-full items-center p-1.5 gap-x-4 group/options text-foreground hover:text-foreground/60 bg-muted rounded-lg font-normal"
            >
                <Trash className={cn("h-5 w-5", hasSelected ? "stroke-foreground group-hover/options:stroke-foreground/40" : "stroke-foreground/40")}/>
            </button>
        )
    }

    const title = "Are you sure you want to continue?"
    const description = "This action will remove files from the workspace"

    const footer = () => {
        return(
            <AlertDialogFooter>
                <AlertDialogCancel 
                >
                    {t("cancel")}
                </AlertDialogCancel>
                <AlertDialogAction 
                    onClick={() => {
                        onDelete()
                    }}
                >
                    {t("continue")}
                </AlertDialogAction>
            </AlertDialogFooter>
        )
    }

    return (
        <DeleteDialogLayout trigger={trigger} title={title} description={description} footer={footer}/>
    );
}