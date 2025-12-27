"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "~/components/shadcn/checkbox"
import { DataTableColumnHeader } from "~/components/data-table/data-table-components/data-table-column-header"
import { Download } from "lucide-react"
import TooltipComponent from "~/components/tooltip-component"
import { cn } from '~/lib/utils'
import { TrackableFile } from "~/lib/interfaces"
import type { TFunction } from "i18next";


// TODO: check why row.getValue is not working
export function fileColumns(t: TFunction<"ui", undefined>): ColumnDef<TrackableFile>[]{

  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value: boolean) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-[2px]"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value: boolean) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-[2px]"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("id")} />
      ),
      cell: ({ row }) => {
        return(
          <div className="w-[20px]">{row.getValue("id")}</div>
        )
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "filename",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("name")} />
      ),
      cell: ({ row }) => {

        return(
          <div className="w-[70%] truncate hover:underline hover:cursor-pointer">{row.getValue("filename")}</div>
        )
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "actions",
      cell: ({ row }) => {
    
        /**
         * 
         * const {t} = useTranslation("ui")
         * 
         * const viewFilesButton = (
          <PDFViewerDialog 
            file={file ?? null} 
            trigger={ 
              <TooltipComponent 
                trigger={
                  <button
                    disabled={row.getValue("status") !== "completed"}
                    className={cn("flex size-fit items-center p-1.5 font-medium gap-x-2 text-foreground hover:text-foreground/60 bg-muted rounded-lg", row.getValue("status") !== "completed" ? "text-foreground/60 bg-muted/60" : "")}
                  >
                    <Eye className="h-[18px] w-[18px]"/>
                  </button>
                }
                content={t("viewFiles")}
              />
            }
            title={t('compareDocuments')}
            description={file?.name}  
            tabs={[{icon: <File className="size-5" />, label: t("original")}, {icon: <FileType2 className="size-5" />, label: t("translated")}]}
          />
        )
         */

        const donwloadOutputFile = (
          <TooltipComponent
            trigger={
              <button
                disabled={row.getValue("status") !== "completed"}
                className={cn("flex size-fit items-center p-1.5 font-medium gap-x-2 text-foreground hover:text-foreground/60 bg-muted rounded-lg", row.getValue("status") !== "completed" ? "text-foreground/60 bg-muted/60" : "")}
              >
                <Download className="h-[18px] w-[18px]"/>
              </button>
            }
            content={t("downloadOutputFile")}
          />
        )
  
        return(
          <div className="flex flex-row w-full gap-x-4 justify-center">
            {/* viewFilesButton */}
            {donwloadOutputFile}
            {/* <DataTableRowActions row={row} actions={actions}/> */}
          </div>
        )
      },
    },
  ]
}
