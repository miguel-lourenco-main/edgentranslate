/**
 * import * as React from "react"

import { Button } from "@kit/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@kit/ui/drawer"

import { ScrollArea } from '@kit/ui/scroll-area';

import PDFViewer from '@kit/ui/pdf-viewer'

export function PDFViewerDrawer({
	file,
	trigger,
}: {
	file: File | string;
	trigger: React.ReactNode;
}) {
	return (
		<Drawer direction='right'>
			<DrawerTrigger asChild>
				{trigger}
			</DrawerTrigger>
			<DrawerContent className='h-screen top-0 right-0 left-auto mt-0 w-[800px] rounded-none bg-[#525659]' showBar={false}>
				<DrawerHeader className="hidden">
					<DrawerTitle>Move Goal</DrawerTitle>
					<DrawerDescription>Set your daily activity goal.</DrawerDescription>
				</DrawerHeader>
				<ScrollArea className='h-screen px-10'>
					<PDFViewer pdf={file} />
				</ScrollArea>
			</DrawerContent>
		</Drawer>
	);
}

 */