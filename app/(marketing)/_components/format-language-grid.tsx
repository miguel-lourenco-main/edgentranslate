import { Card } from "~/components/shadcn/card";

/** Renders grouped format or language chips for the marketing page sections. */
interface Item {
  value: string;
  label?: string;
}

interface Group {
  name: string;
  items: Item[];
}

interface FormatLanguageGridProps {
  groups: Group[];
  renderItem: (item: Item) => React.ReactNode;
}

export function FormatLanguageGrid({ groups, renderItem }: FormatLanguageGridProps) {
  return (
    <Card className={'flex-col w-full lg:w-[70%] h-fit pt-12 pb-20 mx-auto border-none rounded-lg bg-grid'}>
      <div className={'flex flex-col items-center space-y-10 w-full px-4 lg:px-8'}>
        {groups.map((group) => (
          <div key={group.name} className={'flex flex-col items-center space-y-4 w-full'}>
            <span className={'text-xl font-semibold text-foreground'}>{group.name}</span>
            <div className={'flex justify-center flex-wrap gap-3 lg:gap-6 text-background'}>
              {group.items.map((item) => renderItem(item))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
} 
