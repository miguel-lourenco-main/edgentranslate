"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "~/components/data-table/data-table-components/data-table-column-header"
import { RunColumn, TrackableFile } from "~/lib/interfaces"
import { BanIcon, CheckCircle2Icon, Download, Eye, Loader } from "lucide-react"
import TooltipComponent from "~/components/tooltip-component"
import { cn } from '~/lib/utils'
import { toast } from "sonner"
import { LANGUAGES_BY_REGION } from "~/lib/constants"
import type { TFunction } from "i18next";


const columnClasses = {
  base: "truncate",
  flexRow: "flex gap-x-4 items-center",
  select: "w-10",
  id: "w-12 min-w-[2rem] max-w-[4rem] ml-3",
  createdAt: "w-[12rem] min-w-[8rem] max-w-[12rem]",
  filename: "truncate w-[22rem]",
  targetLanguage: "w-1/3 min-w-[8rem] max-w-[12rem]",
  usage: "w-1/6 min-w-[8rem] max-w-[12rem]",
  status: "w-1/6 min-w-[8rem] max-w-[12rem]",
  actions: "w-1/6 min-w-[8rem] max-w-[12rem]",
}

export function runsColumns(files: TrackableFile[], onViewFiles: (run: RunColumn) => void, t: TFunction<"custom", undefined>): ColumnDef<RunColumn>[] {

  return [
    {
      accessorKey: "id",
      header: ({ column }) => (
        <DataTableColumnHeader className="ml-3" column={column} title={t("id")} />
      ),
      cell: ({ row }) => (
        <TooltipComponent
          trigger={
            <div className={cn(columnClasses.base, columnClasses.id)}>
              {row.getValue("id")}
            </div>
          }
          content={row.getValue("id")}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("createdAt")} />
      ),
      cell: ({ row }) => {
        const createdAt = new Date(row.getValue("created_at")).toLocaleString()
        return (  
          <TooltipComponent
            trigger={
            <div className={cn(columnClasses.base, columnClasses.createdAt)}>
              {createdAt}
            </div>
          }
          content={createdAt}
        />
        )
      },
      sortingFn: 'datetime',
      enableSorting: true,
      enableHiding: false,
    },
    {
      accessorKey: "filename",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("filename")} />
      ),
      cell: ({ row }) => {

        const file = row.original.input_file_info?.fileObject

        return (
          <div className={cn(columnClasses.base, columnClasses.filename)}>
            {file?.name}
          </div>
        )
      },
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "target_language",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("targetLanguage")} />
      ),
      cell: ({ row }) => {
        const targetLanguage = Object.values(LANGUAGES_BY_REGION)
          .flat()
          .find(language => language.value === row.getValue("target_language"));
        return (
          <div className={cn(columnClasses.base, columnClasses.targetLanguage)}>
            {targetLanguage?.label}
          </div>
        )
      },
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "output_tokens",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("usage")} />
      ),
      cell: ({ row }) => {

        const usage = (): string => {
          switch(row.getValue("status")){
            case "succeeded":
              return row.getValue("output_tokens") ?? 'N/A'
            case "failed":
              return 'N/A'//t("translationFailed")
            default:
              return 'N/A'//t("waitingForTranslationToEnd")
          }
        }

        return (
          <div className={cn(columnClasses.base, columnClasses.usage)}>
            {usage()}
          </div>
        )
      },
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("status")} />
      ),
      cell: ({ row }) => {
        const icon = () => {
          switch(row.getValue("status")){
            case "running":
              return <TooltipComponent
                trigger={
                    <Loader className='stroke-foreground h-[18px] w-[18px] animate-spin' />//<CirclePause className="h-[18px] w-[18px] stroke-yellow-600 cursor-pointer"/>
                }
                content={t("translating")}
              />
            case "succeeded":
              return <TooltipComponent
                trigger={
                  <CheckCircle2Icon className="h-[18px] w-[18px] stroke-green-500 cursor-pointer"/>
                }
                content={t("succeeded")}
              />
            case "failed":
              return <TooltipComponent
                trigger={
                  <BanIcon className="h-[18px] w-[18px] stroke-red-500 cursor-pointer"/>
                }
                content={t("failed")}
              />
            default:
              return <></>
          }
        }

        /**
          const [progress, setProgress] = useState(13)
          
          useEffect(() => {
            const timer = setTimeout(() => setProgress(66), 500)
            return () => clearTimeout(timer)
          }, [])
        */

        const status = () => {
         switch(row.getValue("status")){
          case "running":
            return t("translating")//<Progress value={progress} className="w-[100px]"/>
          case "succeeded":
            return t("succeeded")
          case "failed":
            return t("failed")
          default:
            return t("waitingForTranslationToEnd")
         }
        }
    
        return (
          <div className={cn(columnClasses.base, columnClasses.status, columnClasses.flexRow, row.getValue("status") === "running" && "animate-pulse")}>
            {icon()}
            {status()}
          </div>
        )
      },
      enableSorting: true,
      enableHiding: true,
    },
    {
      id: "actions",
      cell: ({ row }) => {
        
        const run = row.original;
        const isSucceeded = row.getValue("status") === "succeeded";

        const outputFile = files.find(file => file.id === run?.output_file_id)

        const buttonClasses = cn(
          "flex size-fit items-center p-1.5 font-medium gap-x-2",
          "text-foreground hover:text-foreground/60 bg-muted rounded-lg",
          !isSucceeded && "opacity-50"
        );

        const ViewFilesButton = () => (
          <TooltipComponent 
            trigger={
              <button
                onClick={() => run && onViewFiles(run)}
                disabled={!isSucceeded}
                className={buttonClasses}
              >
                <Eye className="h-[18px] w-[18px]"/>
              </button>
            }
            content={t("viewFiles")}
          />
        );

        const downloadOutputFile = (
          <TooltipComponent
            trigger={
              <button
                onClick={() => {
                  if (outputFile) {
                    try {
                      toast.success("File downloaded (Not really!)");
                    } catch (error) {
                      console.error("Error downloading file:", error);
                      toast.error("Failed to download file");
                    }
                  } else {
                    toast.error("No file id");
                  }
                }}
                disabled={row.getValue("status") !== "succeeded"}
                className={cn("flex size-fit items-center p-1.5 font-medium gap-x-2 text-foreground hover:text-foreground/60 bg-muted rounded-lg", row.getValue("status") !== "succeeded" ? "opacity-50" : "")}
              >
                <Download className="h-[18px] w-[18px]"/>
              </button>
            }
            content={t("downloadOutputFile")}
          />
        )
  
        return(
          <div className={cn(columnClasses.base, columnClasses.actions, columnClasses.flexRow)}>
            <ViewFilesButton />
            {downloadOutputFile}
          </div>
        )
      },
    },
  ]
}

