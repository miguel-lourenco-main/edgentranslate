import { Check, ChevronsUpDown } from "lucide-react"
import { Button } from "./shadcn/button"
import { Popover, PopoverContent, PopoverTrigger } from "./shadcn/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./shadcn/command"
import { Separator } from "./shadcn/separator"
import { cn } from "~/lib/utils"
import { useState, useRef, useEffect } from "react"
import TooltipComponent from "./tooltip-component"
import { useTranslation } from "react-i18next"
import { POPULAR_LANGUAGES } from "~/lib/constants"
import { Language } from "~/lib/types"

function CustomCombox({
  list,
  tooltip,
  onChange,
  initialValue,
  placeholder,
  popularLanguages = POPULAR_LANGUAGES,
  disabled
}: {
  // Props interface for the combobox component
  list: Language[], // Full list of language options
  tooltip: string, // Tooltip text to display
  onChange?: (value: string | undefined) => void, // Callback when selection changes
  initialValue?: string, // Pre-selected value
  placeholder?: string, // Custom placeholder text
  popularLanguages?: Language[], // List of commonly used languages to show first
  disabled?: boolean // Whether the combobox is interactive
}) {
  // State management
  const [open, setOpen] = useState(false) // Controls popover visibility
  const [value, setValue] = useState(initialValue) // Currently selected value
  const scrollAttempts = useRef(0) // Tracks consecutive scroll attempts
  const lastScrollTime = useRef(0) // Timestamp of last scroll attempt

  // Complex scroll handling logic
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      let target = e.target as HTMLElement;
      let scrollableTarget: HTMLElement | null = null;
      
      // Find the nearest scrollable parent element
      while (target && target !== document.body) {
        const { overflowY } = window.getComputedStyle(target);
        if (overflowY === 'auto' || overflowY === 'scroll') {
          scrollableTarget = target;
          break;
        }
        target = target.parentElement as HTMLElement;
      }

      if (scrollableTarget) {
        const { scrollTop, scrollHeight, clientHeight } = scrollableTarget;
        const maxScroll = scrollHeight - clientHeight;
        
        // Normalize scroll amount
        const scrollAmount = Math.sign(e.deltaY) * Math.min(Math.abs(e.deltaY), 100);
        
        // Check if scrolling is possible
        if ((scrollTop <= 0 && scrollAmount < 0) || 
            (scrollTop >= maxScroll && scrollAmount > 0)) {
          // If we can't scroll further in this element, increment the attempt counter
          const now = Date.now();
          if (now - lastScrollTime.current > 1000) {
            // Reset counter if more than 1 second has passed since last attempt
            scrollAttempts.current = 0;
          }
          scrollAttempts.current++;
          lastScrollTime.current = now;

          // Always prevent default to stop immediate parent scrolling
          e.preventDefault();
          
          // Only allow parent scrolling after 5 attempts
          if (scrollAttempts.current >= 5) {
            scrollAttempts.current = 0;
            // Dispatch a new wheel event to the parent
            const wheelEvent = new WheelEvent('wheel', {
              deltaY: scrollAmount,
              bubbles: true
            });
            scrollableTarget.parentElement?.dispatchEvent(wheelEvent);
          }
        } else {
          // We found a scrollable element with room to scroll
          e.preventDefault();
          const newScrollTop = Math.max(0, Math.min(scrollTop + scrollAmount, maxScroll));
          scrollableTarget.scrollTop = newScrollTop;
          scrollAttempts.current = 0; // Reset the counter
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, []);

  const { t } = useTranslation('ui');

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  // Helper function to render command items (language options)
  const renderCommandItems = (items: typeof list) => (
    items.map((item) => (
      <CommandItem
        key={item.value}
        value={item.value}
        onSelect={(currentValue) => {
          setValue(currentValue)
          setOpen(false)
          onChange?.(currentValue)
        }}
        className="flex justify-between"
      >
        <p>{item.label}</p>
        {/* Checkmark icon that shows for selected item */}
        <Check
          className={cn(
            "mr-2 h-4 w-4",
            value === item.value ? "opacity-100" : "opacity-0"
          )}
        />
      </CommandItem>
    ))
  );

  return (
    <TooltipComponent className="w-full" trigger={
      <div className="flex w-full justify-center">
        <Popover open={open} onOpenChange={disabled ? undefined : setOpen}>
          {/* Trigger button shows selected value or placeholder */}
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full max-w-[250px] justify-between"
              disabled={disabled}
            >
              {value
                ? <p>{list.find((item) => item.value === value)?.label}</p>
                : placeholder ?? t('selectItem')
              }
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command
              // Custom filter function to match against label, value, and longValue
              filter={(value, search) => {
                const matches = value.toLowerCase().includes(search.toLowerCase()) ||
                  list.some(item => 
                    item.value === value &&
                    (item.label.toLowerCase().includes(search.toLowerCase()) ||
                    item.longValue.toLowerCase().includes(search.toLowerCase()))
                  );

                return matches ? 1 : 0;
              }}
            >
              {/* Search input field */}
              <CommandInput 
                placeholder={placeholder ?? t('selectLanguagePlaceholder')}
                disabled={disabled}
              />
              <CommandList>
                {/* Popular languages section (if provided) */}
                {popularLanguages.length > 0 && (
                  <>
                    <CommandGroup heading={t('popular')}>
                      {renderCommandItems(popularLanguages)}
                    </CommandGroup>
                    <Separator className="my-2" />
                  </>
                )}
                {/* "No results" message */}
                <CommandEmpty>{t('noItemsFound')}</CommandEmpty>
                {/* Full list of languages */}
                <CommandGroup>
                  {renderCommandItems(list)}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    } content={tooltip} />
  )
}

export default CustomCombox