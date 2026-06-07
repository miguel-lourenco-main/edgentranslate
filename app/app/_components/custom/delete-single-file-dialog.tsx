'use client'

import React from 'react';

import { AlertDialogAction, AlertDialogCancel, AlertDialogFooter} from '~/components/shadcn/alert-dialog';
import { DeleteDialogLayout } from '~/components/layouts/alert-dialog-layouts';
import { useTranslation } from 'react-i18next';

/** Single-file delete confirmation triggered from row action menus. */
export default function DeleteSingleFileDialog({
    deleteFunc,
}:{
    deleteFunc: () => void
}) {

    const { t } = useTranslation('ui')

    const trigger = () => {
        return(
            <div className='p-2 text-sm hover:bg-muted'>
                {t("delete")}
            </div>
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
                        deleteFunc()
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